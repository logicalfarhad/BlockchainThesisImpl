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


const insertLog = async (payload, collectionName) => {
    await dbConnection.collection(collectionName).insertOne(payload);
}

const getLogs = async (currentBlockTimeStamp, nextBlockTimeStamp, collectionName) => {
    let result;
    if (nextBlockTimeStamp == -1) {
        result = await dbConnection.collection(collectionName)
            .find({ 'timeStamp': { $lte: currentBlockTimeStamp } }).toArray();
    } else {
        result = await dbConnection.collection(collectionName)
            .find({ 'timeStamp': { $lte: currentBlockTimeStamp, $gte: nextBlockTimeStamp } }).toArray();
    }

    return result;
}


const getSensorData = async (startDate, endDate) => {
    let pipeline = [
        {
          $addFields: {
            timestamp: {
              $toDate: '$timeStamp'
            },
            totalCurrent: 0,
            totalRuntime: 0,
            timeDiff: 0
          }
        }, {
          $project: {
            _id: 0,
            idx: 1,
            v: 1,
            timestamp: 1,
            totalCurrent: 1,
            totalRuntime: 1,
            timeDiff: 1
          }
        }, {
          $sort: {
            idx: 1,
            timestamp: 1
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
    getDB,
    disconnectDB,
    getLogs,
    insertLog, getSensorData
}