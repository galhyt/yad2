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
    var lon = 32.075611
    var lat = 34.804000
    var radius = 100
    dbo.collection("appartments").aggregate([
        {$unwind: "$price"},
        {
            $project: {
                ad_number: 1,
                longitude: 1,
                latitude: {$convert: {"input":"$latitude", "to": "decimal", onNull: 0, onError: 0 }}
            }
        },
        {
            $project: {
                ad_number: 1,
                longitude: 1,
                latitude: 1,
                mul: {$multiply: ["$latitude",Math.PI]}
            }
        },
        // {
        //     $project: {
        //         ad_number: 1,
        //         longitude: 1,
        //         latitude: 1,
        //         //mul: {$multiply: ["$latitude",Math.PI]},
        //         // sin: {
        //         //     $sin: {
        //         //         $divide: [
        //         //             {$multiply: [latitude,Math.PI]},180
        //         //         ]
        //         //     }
        //         // },
        //         distance: {
        //             $multiply: [{
        //                 $acos: {
        //                     $add: [{
        //                         $multiply: [{
        //                             $sin: {
        //                                 $divide: [
        //                                     {$multiply: [lat,Math.PI]},180
        //                                 ]
        //                             },
        //                             $sin: {
        //                                 $divide: [
        //                                     {$multiply: [Number("$latitude"||0),Math.PI]},180
        //                                 ]
        //                             }
        //                         }]},{
        //                         $multiply: [{
        //                             $cos: {
        //                                 $divide: [
        //                                     {$multiply: [lat,Math.PI]},180
        //                                 ]
        //                             }},{
        //                             $cos: {
        //                                 $divide: [
        //                                     {$multiply: [Number("$latitude"||0),Math.PI]},180
        //                                 ]
        //                             }},{
        //                             $cos: {
        //                                 $subtract: [{
        //                                     $divide: [
        //                                         {$multiply: [Number("$longitude"||0),Math.PI]},180
        //                                     ]},{
        //                                         $divide: [
        //                                             {$multiply: [lon,Math.PI]},180
        //                                         ]
        //                                     }]
        //                                 }
        //                             }
        //                         ]}
        //                     ]
        //                 }
        //             },
        //             6371000
        //         ]}
                
        //     }
        // }
        // {$match: {
        //     sin: {$gt: 0}
        // }}
    ]).toArray(function(err, results) {
        // results.forEach(el => {
        //     console.log(el)
        //     dbo.collection("appartments").findOne({'ad_number': {$eq: el._id}}, (err,doc) => {
        //         var result = [];
        //         var map = new Map();
        //         for (const item of doc.price) {
        //             if(!map.has(item.date)){
        //                 map.set(item.date, true);    // set any value to Map
        //                 result.push({
        //                     date: item.date,
        //                     value: item.value
        //                 });
        //             }
        //         }
        //         console.log(doc.price)
        //         console.log(result)
        //         throw new Error()
        //     })
        // });
        //console.log(err.message)
        console.log(JSON.stringify(results));
    })
})

// Yad2DL.getDistinct("neighborhood", res => {
//     console.log(res)
// })