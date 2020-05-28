const Yad2DL = require("./dl")
var MongoClient = require('mongodb').MongoClient;
const dbConnection = "mongodb://heroku_qd87fbg5:seos5pv5b2400b1d8sl7tsatjt@ds143131.mlab.com:43131/heroku_qd87fbg5"

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that  
    // with toString() and then trim() 

    Yad2DL.connect(dbo => {
        var options = {poolSize: 100,bufferMaxEntries: 0, useNewUrlParser: true, useUnifiedTopology: true}
        MongoClient.connect(dbConnection, options, async function(err, db) {
            if (err) throw err;
            var productDbo = db.db('heroku_qd87fbg5');
            const cur = dbo.collection("appartments").find()
            cur.forEach(el => {
                productDbo.collection("appartments").findOne({'ad_number': {$eq: el.ad_number}}, (err, doc) => {
                    if (!doc) {
                        productDbo.collection("appartments").insertOne(el, function(err, res) {
                        })
                    }
                })
            })
        })
    })
});


