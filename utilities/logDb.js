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

const removeAll = async (callback) => {
    const result = await dbConnection.collection('mqtt').deleteMany();
    callback(result);
}

module.exports = {
    connectDB,
    getDB,
    disconnectDB,
    removeAll, getLogs,
    insertLog
}