const dbStore = require('nedb');

class LogDb {
    constructor() {
      
    }
    getDb() {
        const db = new dbStore({
            filename: "logs.json",
            autoload: true
        });
        return db;
    }
    insertLog(document, cb) {
        const db = this.getDb();
        // newDoc is the newly inserted document, including its _id
        db.insert(document, (err, doc) => {
            cb(err, doc);
        })
    }
    getLogs(cb) {
        const db = this.getDb();
        //Find all documents in the collection
        db.find({}, (err, docs) => {
            cb(docs);
        });
    }
    removeAll(cb) {
        const db = this.getDb();
        // Removing all documents with the 'match-all' query
        db.remove({}, { multi: true }, (err, numRemoved) => {
            cb(numRemoved);
        });

    }
}

module.exports = LogDb;
