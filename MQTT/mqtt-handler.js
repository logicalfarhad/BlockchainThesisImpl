require("dotenv").config();
const Topics = require("./topics");
const mqtt = require("mqtt");
const Logger = require("../utilities/logger");
const Merkeltree = require("../utilities/merkeltree")
const Db = require("../utilities/logDb");
const TransactionUtil = require("../utilities/tx");
class MQTTHandler {
  constructor() {
    this.tx = new TransactionUtil();
    this.sensorList = [];
    this.telemetryList = [];
    this.singleRun = true;
    const INTERVAL = process.env.LOGGING_INTERVAL || 2
    this.LOGGING_INTERVAL = INTERVAL * 60 * 1000;
  }
  connect() {
    const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
    const connectUrl = process.env.MQTT_BROKER;

    this.mqttClient = mqtt.connect(connectUrl, {
      clientId,
      clean: true,
      connectTimeout: 4000,
      // username: process.env.MQTT_USERNAME,
      //  password: process.env.MQTT_PASSWORD
    });
    this.mqttClient.on("error", (error) => this.onMQTTError(error));
    this.mqttClient.on("connect", () => this.onMQTTConnect());
    this.mqttClient.on("close", () => this.onMQTTClose());

    this.mqttClient.on("message", (topic, messageBuffer) =>
      this.onMQTTMessage(topic, messageBuffer)
    );
    this.IO = require("../utilities/socket.js").getIO();
    this.tree = new Merkeltree();
    this.IO.on("connect", (socket) => {
      socket.on("change_port_status", (payload) => {
        this.mqttClient.publish(Topics.TOPIC_FIT_TELEMETRY, JSON.stringify(payload), { qos: 0 });
      });
    });
  }
  onMQTTError(error) {
    this.mqttClient.end();
  }

  onMQTTClose() {
    Logger.logEvent("MQTT client disconnected");
  }

  onMQTTConnect() {
    this.mqttClient.subscribe(Topics.TOPIC_FIT_TELEMETRY, { qos: 0 });
    this.mqttClient.subscribe(Topics.TOPIC_FIT_SENSOR, { qos: 0 });
  }

  onMQTTMessage(topic, messageBuffer) {
    let currentTime = new Date().getTime();
    let payload = JSON.parse(messageBuffer.toString());
    payload = { ...payload, timeStamp: currentTime }
    if (topic.includes('sensor')) {
      if (this.IO) {
        this.IO.emit('data_from_mqtt', payload);
      }
      this.sensorList.push({ ...payload });
      Db.insertLog({ ...payload }, "sensor");
    } else if (topic.includes('device')) {
      this.telemetryList.push({ ...payload });
      Db.insertLog({ ...payload }, "telemetry");
    }
   // console.log("before")
    if (this.singleRun == true) {
      setInterval(() => {
      //  console.log("after");
       // console.log(this.sensorList);
        this.tree.generate(this.sensorList, (sensorHash) => {

          this.tree.generate(this.telemetryList, (deviceHash) => {

            //console.log(sensorHash);
           // console.log("###########")
           // console.log(deviceHash);

            this.tree.generate([sensorHash, deviceHash], (finalHash) => {
              let txObj = {
                logHash: finalHash,
                timeStamp: new Date().getTime(),
              };
              this.tx.sendTransaction(txObj);
            });
          });
        });
        this.telemetryList = [];
        this.sensorList = [];
      }, this.LOGGING_INTERVAL);
    }
    this.singleRun = false;
  }
}
module.exports = MQTTHandler;
