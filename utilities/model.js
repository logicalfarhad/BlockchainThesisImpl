const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let mqttdata = new Schema(
    {
        "Time": {
            "type": "String"
        },
        "DS18B20-1": {
            "Id": {
                "type": "String"
            },
            "Temperature": {
                "type": "Number"
            }
        },
        "DS18B20-2": {
            "Id": {
                "type": "String"
            },
            "Temperature": {
                "type": "Number"
            }
        },
        "TempUnit": {
            "type": "String"
        },
        "_id": {
            "type": mongoose.Schema.Types.ObjectId
        }
    },
    { collection: "mqtt" }
);

module.exports = mongoose.model("mqttdata", mqttdata);