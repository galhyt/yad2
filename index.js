const express = require('express');
const bodyParser = require('body-parser');
//const pino = require('express-pino-logger')();
const request = require('request');
var fs = require('fs')

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
    request('https://www.yad2.co.il/realestate/rent?city=6300&street=0101', options,  (err, res, body) => {
    if (err) { return console.log(err); }
      const data = getDataTbl(body)
      console.log("%s no of records %d", new Date().toString(), data.length)
      exportJson(data)
    });
}

const getDataTbl = txt => {
    var aDataTbl = []
    const arr = txt.match(/\<div class="feeditem table"[\w\W\s]+?\>[\w\W\s]+?(?=\<div class="realtor_promotion)/g)
    for(var i = 1 ; i < arr.length ; i++) {
      const appartment = parseAppartmentData(arr[i])
      if (appartment == null) continue
      aDataTbl.push(appartment)
    }

    return aDataTbl
}

const parseAppartmentData = txt => {
  if (txt.indexOf('סאבלט') != -1) return null

  const priceReg = /\<div[^>]+?class="price"\>[\w\W\s]+?(.*)((?!\<\/div\>)[\w\W\s])+(?=\<\/div\>)/
  const sqMrReg = /\<span id="data_SquareMeter_[\w\W\s]+class="val"\>(\d+)(?=\s*\<\/span\>)/
  const floorReg = /\<span id="data_floor_\d+" class="val"\>(\d+|[א-ת]{4})(?=\<\/span\>)/
  const roomsReg = /\<span id="data_rooms_\d+" class="val"\>(\d+(\.\d+){0,1})(?=\<\/span\>)/
  const addressReg = /\<span class="title"\>\s*([^<]+)(?=\s*\<\/span\>)/

  if (txt.match(roomsReg) == null) return null
  if (txt.match(sqMrReg) == null) return null

  var pricePart = txt.match(priceReg)[1]
  const sqMrPart = txt.match(sqMrReg)[1]
  const floorPart = txt.match(floorReg)[1]
  const roomPart = txt.match(roomsReg)[1]
  const addressPart = txt.match(addressReg)[1]

  pricePart = pricePart.match(/\d+(,\d{3})*/)
  if (pricePart == null) return null
  pricePart = pricePart[0]

  const ret = {
    price: Number(pricePart.replace(',', '')),
    sqMr: Number(sqMrPart),
    floor: floorPart,
    room: Number(roomPart),
    address: addressPart.replace(/\s+$/, '')
  }

  return ret
}

exportJson = data => {
  const now = new Date()
  const fileName = now.getFullYear() + '_' + (now.getMonth()+1) + '_' + now.getDate()
  fs.writeFile("data/" + fileName + ".json", JSON.stringify(data), err => {
    if (err != null) throw err
  })
}

main()
