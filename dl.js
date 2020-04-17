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

}

module.exports = Yad2DL;