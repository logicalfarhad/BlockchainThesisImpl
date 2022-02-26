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
const tree = new Merkeltree();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/getLogsfromDb", (req, res) => {
    db.getLogs((result) => {
        res.send(result);
    });

    /*
    logDb.getLogs((docs) => {
        let hashArr = [];
        docs.forEach((doc) => {
            tree.generate(doc, (hash) => {
                hashArr.push({ logHash: hash, timeStamp: new Date(doc.Time).getTime() });
            })
        })
        hashArr.sort((a, b) => a.timeStamp - b.timeStamp);
        res.json(hashArr);
    });
*/
});

app.get("/removeDb", (req, res) => {
    db.removeAll((result) => {
        console.log(result.deletedCount);
        res.json(result);
    })
})

app.get("/getLogsfromBlockchain", async (req, res) => {
    const transactionList = await tx.getTransaction();
    transactionList.sort((a, b) => a.timeStamp - b.timeStamp);
    res.json(transactionList);
})
/*
app.use(express.static(path.join(__dirname, "frontend/dist")));
app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});
*/


db.connectToServer(function (err) {
    if (err) {
        console.error(err);
        process.exit();
    }

    // start the Express server
    server.listen(port, () => Logger.info(`Express Listening on port ${port}`));
});

mqttHandler.connect();