var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, {poolSize: 100,bufferMaxEntries: 0, reconnectTries: 5000, useNewUrlParser: true, useUnifiedTopology: true}, async function(err, db) {
    if (err) throw err;
    var dbo = db.db("yad2");

    dbo.collection("appartments").aggregate([
        {$unwind: "$price"},
        {
            $match: { "updated_at": { $gt: new Date("2020-04-01")} }
        },
        {
            $group: {
                _id: "$ad_number",
                sqMr: {$last: "$sqMr"},
                lastPrice: {$last: "$price.value"}
            }
        },
        // {
        //     $project: {
        //         _id: null,
        //         pricePerSqmr: {$divide: ["$lastPrice","$sqMr"]}
        //     }
        //},
        {
            $group:  {
                _id: null,
                avgSqmr: {$avg: {$divide: ["$lastPrice","$sqMr"]}}
            }
        }
    ]).toArray(function(err, results) {
        console.log(JSON.stringify(results));
    })
})