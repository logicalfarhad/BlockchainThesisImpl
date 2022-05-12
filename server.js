require("dotenv").config();
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const MQTTHandler = require("./MQTT/mqtt-handler");
const app = express();
const cors = require("cors");
const TransactionUtil = require("./utilities/tx");
const tx = new TransactionUtil();
const mqttHandler = new MQTTHandler();
const port = process.env.NODE_PORT || 5000;
const server = http.createServer(app);

require("./utilities/socket.js").init(server);
const Logger = require("./utilities/logger");
const db = require("./utilities/logDb");
const Merkeltree = require("./utilities/merkeltree");


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/getLogsfromDb", async (req, res) => {
    const { startDate, endDate } = req.body;

    const startDateEpoch = startDate;
    const endDateEpoch = endDate;

    const tree = new Merkeltree();
    let hashArr = [];
    let currentBlockTimeStamp;
    let nextBlockTimeStamp = -1;
    let index = -1;

    const transactionList = await tx.getTransaction(startDateEpoch, endDateEpoch);
    const fullTransactionList = await tx.getTransaction();

    if (transactionList.length && fullTransactionList.length) {
        for (let i = 0; i <= fullTransactionList.length; i++) {
            if (fullTransactionList[i].timeStamp === transactionList[0].timeStamp) {
                index = i;
                break;
            }
        }
        if (index !== -1) {
            const specialts = fullTransactionList[index - 1];
            if (specialts)
                transactionList.unshift(specialts);
        }

        const sortedtransactions = transactionList.sort((a, b) => a.timeStamp - b.timeStamp);

        if (startDateEpoch && endDateEpoch && index > 0) {
            for (let i = 0; i < sortedtransactions.length - 1; i++) {
                currentBlockTimeStamp = sortedtransactions[i].timeStamp;
                nextBlockTimeStamp = sortedtransactions[i + 1].timeStamp;
                let payloadArr = [];
                let sensorData = await db.getLogs(nextBlockTimeStamp, currentBlockTimeStamp);
                payloadArr = sensorData.map((item) => {
                    delete item["_id"]
                    return item;
                });
                tree.generate(payloadArr, (hash) => {
                    hashArr.push(hash);
                });
            }
        } else {
            for (let i = 0; i < sortedtransactions.length; i++) {
                currentBlockTimeStamp = sortedtransactions[i].timeStamp;
                let payloadArr = [];

                let sensorData = await db.getLogs(currentBlockTimeStamp, nextBlockTimeStamp);
                payloadArr = sensorData.map((item) => {
                    delete item["_id"]
                    return item;
                });
                tree.generate(payloadArr, (hash) => {
                    hashArr.push(hash);
                });
                nextBlockTimeStamp = currentBlockTimeStamp;
            }
        }
    }
    return res.json(hashArr);
});

app.post("/getSensorData", async (req, res) => {
    const { startDate, endDate } = req.body;
    let sensorData = await db.getSensorData(startDate, endDate);
    res.json(sensorData);
})
app.post("/setPrice", async (req, res) => {
    const { price } = req.body;
    console.log(price);
    let response = await tx.setEnergyPrice(price);
    res.json(response.status);
})
app.get("/getPrice", async (req, res) => {
    let price = 0;
    try {
        price = await tx.getEnergyPrice(price);
        res.json(price);
    } catch (e) {
        console.log(e)
        res.json(false);
    }
})

app.get("/removeDb", (req, res) => {
    db.removeAll((result) => {
        res.json(result);
    })
})

app.post("/getLogsfromBlockchain", async (req, res) => {
    const { startDate, endDate } = req.body;
    console.log(startDate, endDate);
    const transactionList = await tx.getTransaction(startDate, endDate);
    res.json(transactionList);
})
/*
app.use(express.static(path.join(__dirname, "frontend/dist")));
app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});
*/


db.connectDB(async (err) => {
    if (err) {
        console.error(err);
        process.exit();
    }
    // start the Express server
    server.listen(port, () => Logger.info(`Express Listening on port ${port}`));
});

mqttHandler.connect();