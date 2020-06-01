var Yad2DL = require('./dl')

function distance(lon1, lat1, lon2, lat2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
}

Yad2DL.connect((dbo) => {
    var lat = 32.075611
    var lon = 34.804000
    var radius = 100
    dbo.collection("appartments").aggregate([
        {$unwind: "$price"},
        {
            $project: {
                ad_number: 1,
                longitude: 1,
                latitude: 1,
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
                }
            }
        
        },
        {
            $project: {
                ad_number: 1,
                longitude: 1,
                latitude: 1,
                sin1: 1,
                sin2: 1,
                cos1: 1,
                cos2: 1,
                cos3: 1,
                adding: {
                    $add: [
                        {$multiply: ["$sin1", "$sin2"]},
                        {$multiply: ["$cos1","$cos2","$cos3"]}
                    ]
                }
            }
        },
        {
            $project: {
                ad_number: 1,
                longitude: 1,
                latitude: 1,
                sin1: 1,
                sin2: 1,
                cos1: 1,
                cos2: 1,
                cos3: 1,
                adding: 1,
                acos: {
                    $acos: "$adding"
                }
            }
        },
        {
            $project: {
                ad_number: 1,
                longitude: 1,
                latitude: 1,
                sin1: 1,
                sin2: 1,
                cos1: 1,
                cos2: 1,
                cos3: 1,
                adding: 1,
                acos: 1,
                distance: {
                    $multiply: [
                        "$acos",6371000
                    ]
                }
            }
        },
        {
            $match: {
                distance: {
                    $lt: radius
                }
            }
        }
    ]).toArray(function(err, results) {
        console.log(err)
        console.log(JSON.stringify(results));
    })
})

// Yad2DL.getDistinct("neighborhood", res => {
//     console.log(res)
// })