var Yad2DL = require('./dl')

Yad2DL.connect((dbo) => {
    dbo.collection("appartments").aggregate([
        // {$unwind: "$price"},
        // {
        //     $group: {
        //         _id: "$ad_number",
        //         date: {$last: "$price.date"},
        //         value: {$last: "$price.value"},
        //         count: {$sum:1}
        //     }
        // },
        // {
        //     $match: {
        //         count: {$gt:1}
        //     }
        // }
        {
            $project: {
                _id: "$ad_number",
                count: {$size: "$price"}
            }
        },
        {
            $match: {
                count: {$gt: 1}
            }
        },
        {
            $group: {
                _id: "$count",
                c: {$sum: 1}
            }
        },
        {
            $sort:  {"_id": 1}
        }
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