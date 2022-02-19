require("dotenv").config();
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const MQTTHandler = require("./MQTT/mqtt-handler");
const app = express();
const cors = require("cors");

const mqttHandler = new MQTTHandler();
const port = process.env.NODE_PORT || 5000;
const server = http.createServer(app);

require("./utilities/socket.js").init(server);
const Logger = require("./utilities/logger");
const Db = require("./utilities/logDb");
const logDb = new Db("log.db");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/getLogs", (req, res) => {
    logDb.getLogs((docs) => {
        res.json(docs);
    })
})

app.get("/removeDb", (req, res) => {
    logDb.removeAll((numRemoved) => {
        res.json(numRemoved);
    })
})
/*
app.use(express.static(path.join(__dirname, "frontend/dist")));
app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});
*/
server.listen(port, () => Logger.info(`Express Listening on port ${port}`));

mqttHandler.connect();