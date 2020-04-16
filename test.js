var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, {poolSize: 100,bufferMaxEntries: 0, reconnectTries: 5000, useNewUrlParser: true, useUnifiedTopology: true}, async function(err, db) {
    if (err) throw err;
    var dbo = db.db("yad2");

    dbo.collection("appartments").aggregate([
        {
            $group: {
                _id: "$ad_number",
                lastPrice: {$last: "$price"}
            }
        }
    ]).toArray(function(err, results) {
        console.log(JSON.stringify(results));
    })
})