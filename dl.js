const express = require('express');
const bodyParser = require('body-parser');

var MongoClient = require('mongodb').MongoClient;
const dbConnection = "mongodb://localhost:27017/";

class Yad2DL {
    constructor() {}

    static connect(callback) {
        MongoClient.connect(dbConnection, {poolSize: 100,bufferMaxEntries: 0, useNewUrlParser: true, useUnifiedTopology: true}, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("yad2");
            callback(dbo)
        })
    }

    static getDistinct(fieldName, callback) {
        new Promise((resolve, reject) => {
            this.connect(dbo => {
                dbo.collection("appartments").aggregate([
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
        var filterAttrib =  {}

        attribs.split(',').forEach(el => {
            var arr = el.split(':')
            filterAttrib[arr[0]] = arr[1]
        });

        return {
            filterAttrib
        }
    }

    static getResult(query, callback) {
        new Promise((resolve, reject) => {
            var match = {}
            for (var fieldName in query) {
                match[fieldName] = Yad2DL.matchAttrib(query[fieldName])
            }
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
                            sqMr: {$last: "$sqMr"},
                            room: {$last: "$room"},
                            lastPrice: {$last: "$price.value"}
                        }
                    },
                    {
                        $group:  {
                            _id: "$city",
                            avgSqmr: {$avg: {$divide: ["$lastPrice","$sqMr"]}},
                            avgPerRoom: {$avg: {$divide: ["$lastPrice", "$room"]}},
                            count: {$sum: 1}
                        }
                    }
                    ]).toArray(function(err, results) {
                        resolve(results.map(el => el._id))
                })
            })
        }).then(result => callback(result))
    }
}

module.exports = Yad2DL;