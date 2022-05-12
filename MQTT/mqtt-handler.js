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
    this.deviceLogArr = [];
    this.sensorLogArr = [];
    this.flag = true;
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
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD
    });
    this.mqttClient.on("error", (error) => this.onMQTTError(error));
    this.mqttClient.on("connect", () => this.onMQTTConnect());
    this.mqttClient.on("close", () => this.onMQTTClose());

    this.mqttClient.on("message", (topic, messageBuffer) =>
      this.onMQTTMessage(topic, messageBuffer)
    );
    this.IO = require("../utilities/socket.js").getIO();
    this.tree = new Merkeltree();
  }
  onMQTTError(error) {
    this.mqttClient.end();
  }

  onMQTTClose() {
    Logger.logEvent(this.clientName, "MQTT client disconnected");
  }

  onMQTTConnect() {
    this.mqttClient.subscribe(Topics.TOPIC_FIT_TELEMETRY, { qos: 0 });
    this.mqttClient.subscribe(Topics.TOPIC_FIT_SENSOR, { qos: 0 });
  }

  onMQTTMessage(topic, messageBuffer) {
    let time = new Date().getTime();
    let payload = JSON.parse(messageBuffer.toString());
    payload = { ...payload, timeStamp: time }
    if (topic.includes('sensor')) {
      if (this.IO) {
        this.IO.emit('data_from_mqtt', payload);
      }
      this.sensorLogArr.push({ ...payload });
      Db.insertLog({ ...payload }, "sensor");
    } else if (topic.includes('device')) {
      this.deviceLogArr.push({ ...payload });
      Db.insertLog({ ...payload }, "telemetry");
    }
    if (this.flag == true) {
      setInterval(() => {
        this.tree.generate(this.sensorLogArr, (sensorHash) => {
          this.tree.generate(this.deviceLogArr, (deviceHash) => {
            this.tree.generate([sensorHash, deviceHash], (finalHash) => {
              let txObj = {
                logHash: finalHash,
                timeStamp: new Date().getTime(),
              };
              this.tx.sendTransaction(txObj);
            });
          });

        });
        this.deviceLogArr = [];
        this.sensorLogArr = [];
      }, this.LOGGING_INTERVAL);
    }
    this.flag = false;
  }
}
module.exports = MQTTHandler;
