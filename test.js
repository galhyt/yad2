var Yad2DL = require('./dl')

// Yad2DL.connect((dbo) => {
//     dbo.collection("appartments").aggregate([
//         {$unwind: "$price"},
//         {
//             $match: {
//                 //"updated_at": {: new Date("2020-04-01")}
//                 //, "room": {$gt: 2}
//                 //, "refurbished": false
//                 //,neighborhood: "יד אליהו"
//                 sqMr: {$ne: 0}
//                 ,city: 'נתניה'
//             }
//         },
//         {
//             $group: {
//                 _id: "$ad_number",
//                 sqMr: {$last: "$sqMr"},
//                 lastPrice: {$last: "$price.value"}
//             }
//         },
//         {
//             $group:  {
//                 _id: null,
//                 avgSqmr: {$avg: {$divide: ["$lastPrice","$sqMr"]}}
//             }
//         }
//         {$project:{
//             _id: "$ad_number",
//             countPrice: {$size: "$price"}
//         }},
//         {$group:{
//             _id: null,
//             max: {$max: "$countPrice"}
//         }}
        
//     ]).toArray(function(err, results) {
//         console.log(JSON.stringify(results));
//     })
// })

Yad2DL.getDistinct("neighborhood", res => {
    console.log(res)
})