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
            $match: {
                city: {
                    $eq: "גבעתיים",
                },
                address: {$eq: "כצנלסון 39"}
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