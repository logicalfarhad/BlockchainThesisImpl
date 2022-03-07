const { MongoClient } = require("mongodb");
const connectionString = 'mongodb://localhost:27017';
const client = new MongoClient(connectionString, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
});
let dbConnection

const connectDB = async (callback) => {
    try {
        client.connect(() => {
            dbConnection = client.db("logging");
            return callback()
        })
    } catch (e) {
        return callback(err)
    }
}

const getDB = () => dbConnection

const disconnectDB = () => dbConnection.close()


const insertLog = async (payload) => {
    await dbConnection.collection('mqtt').insertOne(payload);
}
const getLogs = async (callback) => {
    let result = await dbConnection.collection('mqtt').find().toArray();
    callback(result);
}

const insertSensorData = async (payload) => {
    await dbConnection.collection('sensor').insertOne(payload);
}

const getSensorData = async (startDate, endDate, callback) => {
    let pipeline = [
        {
            $group: {
                _id: "$idx",
                avgVoltage: {
                    $avg: "$v"
                },
                avgTime: {
                    "$avg": "$ts"
                }
            }
        },
        {
            $project: {
                port: "$_id",
                _id: 0,
                avgVoltage: "$avgVoltage",
                avgTime: "$avgTime"
            }
        },
        {
            $sort: {
                port: 1
            }
        }
    ];

    if (startDate && endDate) {
        pipeline.unshift({
            $match: {
                timeStamp: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        })
    }
    let result = await dbConnection.collection('sensor').aggregate(pipeline).toArray();
    callback(result);
}


const removeAll = async (callback) => {
    const result = await dbConnection.collection('mqtt').deleteMany();
    callback(result);
}

module.exports = {
    connectDB,
    getDB, insertSensorData,
    disconnectDB,
    removeAll, getLogs,
    insertLog, getSensorData
}