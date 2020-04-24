const express = require('express');
const bodyParser = require('body-parser');
require('custom-env').env(true)
var MongoClient = require('mongodb').MongoClient;
var dbConnection = "mongodb://"
if (process.env.DB_USER) dbConnection += process.env.DB_USER + ":" + process.env.DB_PASS
dbConnection+=process.env.DB_HOST+":"+process.env.DB_PORT+"/";
if (process.env.DB_USER) dbConnection += process.env.DB_USER

class Yad2DL {
    constructor() {}

    static connect(callback) {
        var options = {poolSize: 100,bufferMaxEntries: 0, useNewUrlParser: true, useUnifiedTopology: true}
        MongoClient.connect(dbConnection, options, async function(err, db) {
            if (err) throw err;
            var dbo = db.db(process.env.DB_NAME);
            callback(dbo)
        })
    }

    static getDistinct(fieldName, callback, query) {
        new Promise((resolve, reject) => {
            var match = null
            if (query != null) match = Yad2DL.getMatch(query)

            this.connect(dbo => {
                dbo.collection("appartments").aggregate([
                    {
                        $match : match
                    },
                    {
                        $group: {
                            _id: "$"+fieldName
                        }
                    }
                ]).toArray(function(err, results) {
                    resolve(results.map(el => el._id))
                })
            })
        }).then(result => callback(result))
    }

    static matchAttrib(attribs) {
        var filterAttrib =  '{'+ attribs.replace(/(\$\w{2})(?=:)/g, "\"$1\"") +'}'

        return JSON.parse(filterAttrib)
    }

    static getMatch(query) {
        var match = {}
        for (var fieldName in query) {
            match[fieldName] = Yad2DL.matchAttrib(query[fieldName])
        }
        return match
    }

    static getResult(groupBy, query, callback) {
        new Promise((resolve, reject) => {
            var match = Yad2DL.getMatch(query)
            this.connect(dbo => {
                dbo.collection("appartments").aggregate([
                    {$unwind: "$price"},
                    {
                        $match: match
                    },
                    {
                        $group: {
                            _id: "$ad_number",
                            city: {$last: "$city"},
                            neighborhood: {$last: "$neighborhood"},
                            address: {$last: "$address"},
                            sqMr: {$last: "$sqMr"},
                            room: {$last: "$room"},
                            lastPrice: {$last: "$price.value"}
                        }
                    },
                    {
                        $group:  {
                            _id: "$"+groupBy,
                            avgSqmr: {$avg: {$divide: ["$lastPrice","$sqMr"]}},
                            avgPerRoom: {$avg: {$divide: ["$lastPrice", "$room"]}},
                            count: {$sum: 1}
                        }
                    }
                    ]).toArray(function(err, results) {
                        resolve(results)
                })
            })
        }).then(result => callback(result))
    }
}

module.exports = Yad2DL;