require("dotenv").config();
const Topics = require("./topics");
const mqtt = require("mqtt");
const Logger = require("../utilities/logger");
const Merkeltree = require("../utilities/merkeltree")
const Db = require("../utilities/logDb");
class MQTTHandler {
  constructor() {
  }
  connect() {
    const mqtt_host = 'zamperoni.fit.fraunhofer.de';
    const mqtt_port = '443';
    const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
    const connectUrl = `mqtts://${mqtt_host}:${mqtt_port}`;

    this.mqttClient = mqtt.connect(connectUrl, {
      clientId,
      clean: true,
      connectTimeout: 4000,
      username: 'fit',
      password: '43dC6h8cCM',
    });
    this.mqttClient.on("error", (error) => this.onMQTTError(error));
    this.mqttClient.on("connect", () => this.onMQTTConnect());
    this.mqttClient.on("close", () => this.onMQTTClose());
    this.mqttClient.on("message", (topic, messageBuffer) =>
      this.onMQTTMessage(topic, messageBuffer)
    );
    this.IO = require("../utilities/socket.js").getIO();
    this.Db = new Db("log.db");


    this.tree = new Merkeltree();
  }
  onMQTTError(error) {
    // Logger.logError(error, this.clientName);
    this.mqttClient.end();
  }

  onMQTTClose() {
    Logger.logEvent(this.clientName, "MQTT client disconnected");
  }

  onMQTTConnect() {
    this.mqttClient.subscribe(Topics.TOPIC_FIT_FRIDGE, { qos: 0 });
  }

  onMQTTMessage(topic, messageBuffer) {
    let payload = JSON.parse(messageBuffer.toString());


    this.tree.generate(payload, (hash) => {
      if (this.IO) {
        this.IO.emit('data_from_mqtt', {
          logHash: hash,
          timeStamp: new Date(payload.Time).getTime(),
        });
        this.Db.insertLog({
          logHash: hash,
          timeStamp: new Date(payload.Time).getTime(),
        }, (err, message) => {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  }
}
module.exports = MQTTHandler;
