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

const insertSensorData = async (payload) => {
    await dbConnection.collection('sensor').insertOne(payload);
}

const getLogs = async (currentBlockTimeStamp, nextBlockTimeStamp) => {
    let result;
    if (nextBlockTimeStamp == -1) {
        result = await dbConnection.collection('sensor')
            .find({ 'timeStamp': { $lte: currentBlockTimeStamp } }).toArray();
    } else {
        result = await dbConnection.collection('sensor')
            .find({ 'timeStamp': { $lte: currentBlockTimeStamp, $gte: nextBlockTimeStamp } }).toArray();
    }
    return result;
}


const getSensorData = async (startDate, endDate) => {
    let pipeline = [
        {
            $group: {
                _id: '$idx',
                totalCurrent: {
                    $sum: "$v"
                },
                minTime: {
                    $min: "$timeStamp"
                },
                maxTime: {
                    $max: "$timeStamp"
                }
            }
        },
        {
            $project: {
                port: "$_id",
                _id: 0,
                totalCurrent: "$totalCurrent",
                maxTime: { "$toDate": "$maxTime" },
                minTime: { "$toDate": "$minTime" }
            }
        },
        {
            $project: {
                port: "$port",
                _id: 0,
                totalCurrent: "$totalCurrent",
                duration: {
                    $dateDiff: {
                        startDate: "$minTime",
                        endDate: "$maxTime",
                        unit: "minute"
                    }
                }
            }
        },
        {
            $project: {
                port: "$port",
                totalCurrent: "$totalCurrent",
                totalHour: {
                    $divide: [
                        "$duration", 60
                    ]
                }
            }
        },
        {
            $sort: {
                port: 1
            }
        }
    ];

    if (startDate && endDate) { // add filter to the pipeline if there is date range
        pipeline.unshift({
            $match: {
                timeStamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        })
    }
    let result = await dbConnection.collection('sensor')
        .aggregate(pipeline, {
            allowDiskUse: true
        }).toArray();
    return result;
}
module.exports = {
    connectDB,
    getDB, insertSensorData,
    disconnectDB,
    getLogs,
    insertLog, getSensorData
}