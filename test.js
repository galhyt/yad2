var Yad2DL = require('./dl')

Yad2DL.connect((dbo) => {
    dbo.collection("appartments").aggregate([
        {$unwind: "$price"},
        {
            $match: {
                "updated_at": {$gt: new Date("2020-04-01")}
                , "room": {$gt: 2, $lt: 4}
                //, "refurbished": false
                //,neighborhood: "יד אליהו"
                ,sqMr: {$ne: 0}
                //,city: 'נתניה'
            }
        },
        {
            $group: {
                _id: "$ad_number",
                city: {$last: "$city"},
                sqMr: {$last: "$sqMr"},
                lastPrice: {$last: "$price.value"}
            }
        },
        {
            $group:  {
                _id: "$city",
                avgSqmr: {$avg: {$divide: ["$lastPrice","$sqMr"]}},
                count: {$sum: 1}
            }
        }
        // {$project:{
        //     _id: "$ad_number",
        //     countPrice: {$size: "$price"}
        // }},
        // {$group:{
        //     _id: null,
        //     max: {$max: "$countPrice"}
        // }}
        
    ]).toArray(function(err, results) {
        const arr = results.map(el=>{
            return el._id + ":" + el.avgSqmr.toFixed(0) + " מתוך דגימה=" + el.count
        })
        console.log(JSON.stringify(arr));
        //console.log(JSON.stringify(results));
    })
})

// Yad2DL.getDistinct("neighborhood", res => {
//     console.log(res)
// })