const express = require('express');
const bodyParser = require('body-parser');
//const pino = require('express-pino-logger')();
const request = require('request');
var fs = require('fs')

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(pino);

// app.get('/', (req1, res1) => {
//     main()
// });

// app.listen(3001, () =>
//   console.log('Express server is running on localhost:3001')
// );

const main = () => {
  const options = {
    'gzip': true,
    headers: {
      'authority': 'www.yad2.co.il',
      'method': 'GET',
      'path': '/realestate/rent?city=6300&street=0101',
        'Accept': 'text/html',
        'Accept-Charset': 'utf-8',
        'content-type': 'text/html; charset=utf-8',
        'authority': 'www.yad2.co.il',
        'scheme': 'https',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7,utf-8',
        'cookie': 'y2018-2-cohort=43; __uzma=49b87779-ea29-4440-964f-cd6e21916436; __uzmb=1586022568; abTestKey=14; UTGv2=h41d1202054a58e8ca3f9f721c797d013882; __ssds=3; __ssuzjsr3=a9be0cd8e; __uzmaj3=953a2de9-b7d8-458b-831b-8dcb62950474; __uzmbj3=1586022575; use_elastic_search=1; __gads=ID=a6aa2029485b447e:T=1586022576:S=ALNI_MZUMfgQ7fFOvjz3l06yjBYA6Xt5cQ; fitracking_12=no; historyprimaryarea=hamerkaz_area; historysecondaryarea=ramat_gan_givataim; ; _ga=GA1.3.1763115841.1586380895; searchB144FromYad2=2_C_1844; yad2upload=1056964618.27765.0000; _gid=GA1.3.11360897.1586733941; y2_cohort_2020=59; y2session=5LwX82RKG6E7CD05QphCXalXPKaBwV4IdhTsIZyR; __uzmcj3=285225891073; __uzmdj3=1586741082; __uzmc=7331329254365; __uzmd=1586741081; favorites_userid=bia922357116',
        'if-none-match': '"599d7-2JgeooADn2wrUIEvgA+1ani5RcU"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'no-cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36'
    }
  };
    request('https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=485&page=3', options,  (err, res, body) => {
      if (err) { return console.log(err); }
      
      const data = getDataTbl(body)
      if (data == null) return console.log('Error finding data!')
      console.log("%s no of records %d", new Date().toString(), data.length)
      addToDb(data)
      exportJson(data)
    });
    // fs.readFile("C:\\Projects\\Yad2\\data\\new_north.html", function(err, body) {
    //   if (err) throw(err)

    //   const data = getDataTbl(body)
    //   if (data == null) return console.log('Error finding data!')
    //   console.log("%s no of records %d", new Date().toString(), data.length)
    //   //exportJson(data)
    //   addToDb(data)
    // })
}

const getDataTbl = txt => {
    var aDataTbl = []
    const reg = /window\.\_\_NUXT\_\_\=\(function\([^)]+\)\{return\s(\{[\w\W]+?routePath\:\w+\}\})/g
    var match = reg.exec(txt)
    if (match == null) return null
    match = /feed:(\{[\w\W]+\})(?=,search:)/.exec(match[1])
    if (match == null) return null
    const jsonTxt = match[1].replace(/(?<=[,{}}\]])(\w+?)(?=:)/g,"\"$1\"")
                            .replace(/(?<!"[^"]+):([^[{}":]+?)(?=[,}])/g, ":\"$1\"")
                            .replace(/\[[^\[\]]+?\]/g, "[]")
                            .replace(/(?<=:"[^"]+[^\\])"(?!\}*,"\w+":)/g, "\\\"")

    const data = JSON.parse(jsonTxt)
    for(var i = 0 ; i < data.items.length ; i++) {
      console.log(data.items[i])
      const appartment = parseAppartmentData(data.items[i].data)
      if (appartment == null) continue
      aDataTbl.push(appartment)
    }

    return aDataTbl
}

const floorDic = {
  "קומת קרקע": 0,
  "aV": 1,
  "aI": 2,
  "P": 3
}

const parseAppartmentData = itemData => {
  if (/סאבלט|חניה/.test(itemData.row_2)) return null
  if (!/[א-ת]/.test(itemData.row_1)) return null

  const pricePart = itemData.price.replace(/[^\d]/g, '')
  const sqMrPart = (/^[\d\.]+$/g.test(itemData.square_meters) ? itemData.square_meters : itemData.line_3.replace(/[^\d]/g, ''))
  const floorPart = floorDic[itemData.line_2]
  const roomPart = itemData.line_1.replace(/[^\d\.]/g, '')
  const addressPart = itemData.row_1
  const ad_numberPart = itemData.ad_number
  const updated_atPart = (itemData.updated_at == 'עודכן היום' ?  new Date(new Date().toISOString().replace(/(.+)T.+$/g, '$1')) : new Date(itemData.updated_at.replace(/[^\d\/]+/g, '').replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')))
  const refurbished = (itemData.Meshupatz_text == 'k' ? false : true)
  const city = itemData.row_2.match(/[א-ת\s]+$/)[0]
  const neighborhood = itemData.row_2.match(/([א-ת\s]+)(?=,\s[א-ת\s]+$)/)[0]

  const ret = {
    ad_number: ad_numberPart,
    updated_at: updated_atPart,
    price: [{date: updated_atPart, value: Number(pricePart)}],
    sqMr: Number(sqMrPart),
    floor: floorPart,
    room: Number(roomPart),
    address: addressPart,
    city: city.trim(),
    neighborhood: neighborhood.trim(),
    refurbished: refurbished
  }

  return ret
}

exportJson = data => {
  const now = new Date()
  const fileName = now.getFullYear() + '_' + (now.getMonth()+1) + '_' + now.getDate()
  fs.appendFile("data/" + fileName + ".json", JSON.stringify(data), err => {
    if (err != null) throw err
  })
}

function addToDb(data) {
  MongoClient.connect(url, {poolSize: 100,bufferMaxEntries: 0, reconnectTries: 5000, useNewUrlParser: true, useUnifiedTopology: true}, async function(err, db) {
    if (err) throw err;
    var dbo = db.db("yad2");
    
    var promises = []
    data.forEach(el => {
      promises.push(new Promise((resolve, reject) => {
        dbo.collection("appartments").findOne({'ad_number': el.ad_number}, (err, doc) => {
          promises.push(new Promise((resolve1, reject1) => {
            if (!doc) {
              promises.push(new Promise((resolve2,reject2)=> {
                dbo.collection("appartments").insertOne(el, function(err, res) {
                  if (!err) resolve2(); else reject2(new Error(err.message))
                })
              }));
            }
            else {
              if (doc.price.find(p => {return p.date == el.price[0].date}) == 'undefined') {
                doc.price.push(el.price[0])
                promises.push(new Promise((resolve2,reject2)=> {
                  dbo.collection("appartments").update({_id: el._id}, {$set: {price: doc.price}}, () => {
                    resolve2()
                  })
                }))
              }
            }
            resolve1()
          }))
          resolve()
        })
      }))
    });

    let aw = await Promise.all(promises)
    db.close();
  });
}

main()
