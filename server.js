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
const Merkeltree = require("./utilities/merkeltree")


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/getLogsfromDb", async (req, res) => {
    const { startDate, endDate } = req.body;
    const startDateEpoch = new Date(startDate).getTime();//startDate is small 22/02/2022
    //searchDate is 25/02/2022
    const endDateEpoch = new Date(endDate).getTime(); //endDate is bigger 28/02/2022
    const tree = new Merkeltree();
    const transactionList = await tx.getTransaction(startDate, endDate);
    const sortedtransactions = transactionList.sort((a, b) => {
        return a.timeStamp - b.timeStamp
    });
    console.log(sortedtransactions);
    let hashArr = [];
    let currentBlockTimeStamp;
    let nextBlockTimeStamp = -1;
    for (let i = 0; i < sortedtransactions.length; i++) {
        currentBlockTimeStamp = sortedtransactions[i].timeStamp;
        let payloadArr = [];

        let sensorData = await db.getMqttData(currentBlockTimeStamp, nextBlockTimeStamp);
        payloadArr = sensorData.map((item) => {
            delete item["_id"]
            return item;
        });
        tree.generate(payloadArr, (hash) => {
            hashArr.push(hash);
        });
        nextBlockTimeStamp = currentBlockTimeStamp;
    }
    return res.json(hashArr);
});

app.post("/getSensorData", async (req, res) => {
    const { startDate, endDate } = req.body;
    let sensorData = await db.getSensorData(startDate, endDate);
    res.json(sensorData);
})
/*
app.post("/setPrice", async (req, res) => {
    const { price } = req.body;
    let response = await tx.setEnergyPrice(price);
    res.json(response.status);
})
*/


app.get("/getPrice", async (req, res) => {
    let price = 0;
    try {
        price = await tx.getEnergyPrice(price);
        res.json(price);
    } catch (e) {
        console.log(e);
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