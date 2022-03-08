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
    this.tree = new Merkeltree();
  }
  onMQTTError(error) {
    this.mqttClient.end();
  }

  onMQTTClose() {
    Logger.logEvent(this.clientName, "MQTT client disconnected");
  }

  onMQTTConnect() {
    /*
    setInterval(() => {
      let payload = {
        "Time": new Date().toISOString(),
        "DS18B20-1": { "Id": "0315A46FF3FF", "Temperature": 13.7 },
        "DS18B20-2": { "Id": "0415A424A8FF", "Temperature": 13.6 }
      };
      //  Db.insertLog(payload);
      this.tree.generate(payload, (hash) => {
        let txObj = {
          logHash: hash,
          timeStamp: new Date(payload.Time).getTime(),
        };
        //   this.tx.sendTransaction(txObj);
      });
    }, 60 * 1000);
    */

    setInterval(() => {
      let port_payload = {
        "type": "outlet",
        "idx": Math.floor(Math.random() * 8) + 1,
        "v": 0.256,
        "unit": "A",
        "field": "current",
        "cause": "interval",
        "ts": 6605,
        "timeStamp": new Date()
      };
      Db.insertSensorData(port_payload);
    }, 60 * 1000);
    this.mqttClient.subscribe(Topics.TOPIC_FIT_FRIDGE, { qos: 0 });
  }

  onMQTTMessage(topic, messageBuffer) {
    let payload = JSON.parse(messageBuffer.toString());
    this.tree.generate(payload, (hash) => {

      let txObj = {
        logHash: hash,
        timeStamp: new Date(payload.Time).getTime(),
      };

      if (this.IO) {
        this.IO.emit('data_from_mqtt', txObj);
      }
    });
  }
}
module.exports = MQTTHandler;
