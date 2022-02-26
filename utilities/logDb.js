const { MongoClient } = require("mongodb");
const connectionString = 'mongodb://localhost:27017';
const client = new MongoClient(connectionString, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
});

let dbConnection;

module.exports = {
    connectToServer: (callback) => {
        client.connect((err, db) => {
            if (err || !db) {
                return callback(err);
            }

            dbConnection = db.db("logging");
            console.log("Successfully connected to MongoDB.");

            return callback();
        });
    },

    getDb: () => {
        return dbConnection;
    },
    insertLog: async (payload) => {
        const result = await dbConnection.collection('mqtt').insertOne(payload);
        console.log(result.insertedId);
    },
    getLogs: async (callback) => {
        let result = await dbConnection.collection('mqtt').find({}).toArray();
        callback(result);
    },

    removeAll: async (callback) => {
        const result = await dbConnection.collection('mqtt').deleteMany();
        callback(result);
    }
};
