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



app.post("/getLogsfromBlockchain", async (req, res) => {
    const { startDate, endDate } = req.body;
    console.log(startDate, endDate);
    const transactionList = await tx.getTransaction(startDate, endDate);
    res.json(transactionList);
})

app.post("/getLogsfromDb", async (req, res) => {
    const { startDate, endDate } = req.body;

    const startDateEpoch = startDate;
    const endDateEpoch = endDate;

    const tree = new Merkeltree();
    const hashArr = [];
    let currentBlockTimeStamp;
    let nextBlockTimeStamp = -1;
    let index = -1;

    const blockTransactionList = await tx.getTransaction(startDateEpoch, endDateEpoch);
    const allBlockTransactionList = await tx.getTransaction();

    if (blockTransactionList.length && allBlockTransactionList.length) {
        for (let i = 0; i <= allBlockTransactionList.length; i++) {
            if (allBlockTransactionList[i].timeStamp === blockTransactionList[0].timeStamp) {
                index = i;
                break;
            }
        }
        if (index !== -1) {
            const specialts = allBlockTransactionList[index - 1];
            if (specialts)
                blockTransactionList.unshift(specialts); // add specialts in the first element of the list
        }

        const sortedBlockTransactionList = blockTransactionList.sort((a, b) => a.timeStamp - b.timeStamp);

        if (startDateEpoch && endDateEpoch && index > 0) {
            for (let i = 0; i < sortedBlockTransactionList.length - 1; i++) {
                currentBlockTimeStamp = sortedBlockTransactionList[i].timeStamp;
                nextBlockTimeStamp = sortedBlockTransactionList[i + 1].timeStamp;


                const sensorDbData = await db.getLogs(nextBlockTimeStamp, currentBlockTimeStamp, "sensor");
                const mqttDbData = await db.getLogs(nextBlockTimeStamp, currentBlockTimeStamp, "telemetry");

                const sensorDbList = sensorDbData.map((item) => {
                    delete item["_id"]
                    return item;
                });

                const telemetryDbList = mqttDbData.map((item) => {
                    delete item["_id"]
                    return item;
                });

                tree.generate(sensorDbList, (sensorHash) => {
                    tree.generate(telemetryDbList, (telemetryHash) => {
                        tree.generate([sensorHash, telemetryHash], (finalHash) => {
                            hashArr.push(finalHash);
                        });
                    });
                });

            }
        } else {
            for (let i = 0; i < sortedBlockTransactionList.length; i++) {
                currentBlockTimeStamp = sortedBlockTransactionList[i].timeStamp;

                let sensorDbData = await db.getLogs(currentBlockTimeStamp, nextBlockTimeStamp, "sensor");
                let mqttDbData = await db.getLogs(currentBlockTimeStamp, nextBlockTimeStamp, "telemetry");

                const sensorDbList = sensorDbData.map((item) => {
                    delete item["_id"]
                    return item;
                });

                const telemetryDbList = mqttDbData.map((item) => {
                    delete item["_id"]
                    return item;
                });

                tree.generate(sensorDbList, (sensorHash) => {
                    tree.generate(telemetryDbList, (telemetryHash) => {
                        tree.generate([sensorHash, telemetryHash], (finalHash) => {
                            hashArr.push(finalHash);
                        });
                    });
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