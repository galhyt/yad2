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
        var filterAttrib =  '{'+ attribs.replace(/(\$\w{2,5})(?=:)/g, "\"$1\"") +'}'
        var obj = JSON.parse(filterAttrib)
        for (var entry in obj) {
            if (/\d{4}\-\d{1,2}\-\d{1,2}/g.test(obj[entry]))
                obj[entry] = new Date(obj[entry])
        }

        return obj
    }

    static getMatch(query) {
        var match = {}
        for (var fieldName in query) {
            match[fieldName] = Yad2DL.matchAttrib(query[fieldName])
        }
        return match
    }

    static getDistanceCalc(attribs) {
        //if (attribs == null) return null

        var lon = (attribs != null ? attribs.lon : 0)
        var lat = (attribs != null ? attribs.lat : 0)
        return {
            enabled: (attribs == null ? false: true),
            sin1: {
                $sin: {
                    $divide: [
                        {$multiply: [lat,Math.PI]},180
                    ]
                }
            },
            sin2: {
                $sin: {
                    $divide: [
                        {$multiply: ["$latitude",Math.PI]},180
                    ]
                }
            },
            cos1: {
                $cos: {
                    $divide: [
                        {$multiply: [lat,Math.PI]},180
                    ]
                }
            },
            cos2: {
                $cos: {
                    $divide: [
                        {$multiply: ["$latitude",Math.PI]},180
                    ]
                }
            },
            cos3: {
                $cos: {
                    $subtract: [{
                        $divide: [
                            {$multiply: ["$longitude",Math.PI]},180
                        ]},{
                            $divide: [
                                {$multiply: [lon,Math.PI]},180
                            ]
                        }]
                    }
            },
            adding: {
                $add: [
                    {$multiply: ["$sin1", "$sin2"]},
                    {$multiply: ["$cos1","$cos2","$cos3"]}
                ]
            },
            distanceFormula: {
                $multiply: [
                    {
                        $acos: "$adding"
                    },
                    6371000
                ]
            }
        }
    }

    static getResult(groupBy, query, callback) {
        new Promise((resolve, reject) => {
            var match = Yad2DL.getMatch(query)
            var distanceCalc = Yad2DL.getDistanceCalc(match.distanceCalc)
            var distanceMatch = {}
            if (match.distanceCalc != null) {
                distanceMatch = {distance: match.distance}
                delete match.distanceCalc
                delete match.distance
            }
            this.connect(dbo => {
                dbo.collection("appartments").aggregate([
                    {$unwind: "$price"},
                    {
                        $match: match
                    },
                    {
                        $project: {
                            ad_number: 1,
                            city: 1,
                            neighborhood: 1,
                            address: 1,
                            sqMr: 1,
                            room: 1,
                            floor: 1,
                            price: 1//,
                            // longitude: 1,
                            // latitude: 1,
                            // sin1: distanceCalc.sin1,
                            // sin2: distanceCalc.sin2,
                            // cos1: distanceCalc.cos1,
                            // cos2: distanceCalc.cos2,
                            // cos3: distanceCalc.cos3
                        }
                    },
                    // {
                    //     $project: {
                    //         ad_number: 1,
                    //         city: 1,
                    //         neighborhood: 1,
                    //         address: 1,
                    //         sqMr: 1,
                    //         room: 1,
                    //         floor: 1,
                    //         price: 1,
                    //         longitude: 1,
                    //         latitude: 1,
                    //         sin1: 1,
                    //         sin2: 1,
                    //         cos1: 1,
                    //         cos2: 1,
                    //         cos3: 1,
                    //         adding: distanceCalc.adding
                    //     }
                    // },
                    // {
                    //     $project: {
                    //         ad_number: 1,
                    //         city: 1,
                    //         neighborhood: 1,
                    //         address: 1,
                    //         sqMr: 1,
                    //         room: 1,
                    //         floor: 1,
                    //         price: 1,
                    //         longitude: 1,
                    //         latitude: 1,
                    //         sin1: 1,
                    //         sin2: 1,
                    //         cos1: 1,
                    //         cos2: 1,
                    //         cos3: 1,
                    //         adding: 1,
                    //         distance: distanceCalc.distanceFormula
                    //     }
                    // },
                    // {
                    //     $match: distanceMatch
                    // },
                    {
                        $group: {
                            _id: "$ad_number",
                            city: {$last: "$city"},
                            neighborhood: {$last: "$neighborhood"},
                            address: {$last: "$address"},
                            sqMr: {$last: "$sqMr"},
                            room: {$last: "$room"},
                            floor: {$last: "$floor"},
                            lastPrice: {$last: "$price.value"}
                        }
                    },
                    {
                        $match: {
                            lastPrice: {$gt: 0}
                        }
                    },
                    {
                        $group:  {
                            _id: "$"+groupBy,
                            sumSqmr: {$sum: "$sqMr"},
                            sumPrice: {$sum: "$lastPrice"},
                            sumRoom: {$sum: "$room"},
                            count: {$sum: 1}
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            avgSqmr: {$divide: ["$sumPrice", "$sumSqmr"]},
                            avgPerRoom: {$divide: ["$sumPrice", "$sumRoom"]},
                            count: 1
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