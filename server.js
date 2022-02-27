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

app.post("/getLogsfromDb", (req, res) => {
    const { startDate, startDate } = req.body;
    const tree = new Merkeltree();
    db.getLogs((documents) => {
        let hashArr = [];
        documents.forEach((doc) => {
            tree.generate(doc, (hash) => {
                hashArr.push({ logHash: hash, timeStamp: Date.parse(doc.Time) });
            })
        });
        res.json(hashArr);
    });
});

app.get("/removeDb", (req, res) => {
    db.removeAll((result) => {
        console.log(result.deletedCount);
        res.json(result);
    })
})

app.post("/getLogsfromBlockchain", async (req, res) => {
    const { startDate, startDate } = req.body;
    const transactionList = await tx.getTransaction();
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