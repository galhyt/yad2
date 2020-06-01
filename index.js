const express = require('express');
const bodyParser = require('body-parser');
//const pino = require('express-pino-logger')();
const request = require('request');
const Yad2DL = require('./dl')
var fs = require('fs')

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

var citiesCodes = [6300,5000,7400,8300,8400,6400,9700,7900]
const setTimer = true
// try to get cities codes from cmd
if (process.argv.length > 2) {
  const argvCodes = process.argv.slice(2)
  argvCodes.forEach(code => {
    if (!/\d+/.test(code))
      throw new Error(code + ' is not a legal city code')
  })

  citiesCodes = argvCodes
}

const options = {
  'gzip': true,
  headers: {
    'authority': 'www.yad2.co.il',
    'method': 'GET',
    'path': '/realestate/rent?city=6300&page=2',
    'scheme': 'https',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
    'cache-control': 'max-age=0',
    'cookie': 'adoric_user=1; adoric_goals=%5B%225ae5882c307a8fbd0017c1c5%22%5D; adoric_uniq_day_id=5ec04b15ff961f001890c7f0; y2018-2-cohort=43; __uzma=49b87779-ea29-4440-964f-cd6e21916436; __uzmb=1586022568; __ssds=3; __uzmaj3=953a2de9-b7d8-458b-831b-8dcb62950474; __ssuzjsr3=a9be0cd8e; __uzmbj3=1586022575; __gads=ID=a6aa2029485b447e:T=1586022576:S=ALNI_MZUMfgQ7fFOvjz3l06yjBYA6Xt5cQ; _ga=GA1.3.1763115841.1586380895; abTestKey=92; yad2upload=536870922.27765.0000; fitracking_48=no; use_elastic_search=1; bc.visitorToken=6652260848939728896; historyprimaryarea=hamerkaz_area___sharon_area; historysecondaryarea=ramat_gan_givataim___ramat_hasharon_herzeliya; DCST=pE9; SPSI=1fb29a4723506dc3d2f6b83601f68e80; UTGv2=h41d1202054a58e8ca3f9f721c797d013882; _gid=GA1.3.307618122.1589660435; fi_utm=direct%7Cdirect%7C%7C%7C%7C; y2_cohort_2020=44; y2session=nMPBzC44ILWj3gHfFeA022EAKPV96qKQjOViUjoo; spcsrf=6a26580f479619d57e413479569542e0; PRLST=Hh; favorites_userid=bia922357116; __uzmcj3=8092913633139; __uzmdj3=1589660806; adOtr=92fP17b2453; __uzmc=5399293173487; __uzmd=1589660809; DSR=LBLHS4TI2ryAZIBOwY+X7UWaonBgvT1HPuBJLQGvYBaG5ZMByvtHzBjxPfGCKJJtd4gyGms5463oscnn5ADdnw==; DCSS=ADE3B32496826E972180B520C3DAEBC05B2E10F; DGCC=tK',
    'referer': 'https://www.yad2.co.il/realestate/rent?city=6300&page=2',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'upgrade-insecure-requests': 1,
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36'
  }
};

const main = () => {
  if (setTimer) {
    doScheduledTask()
  }
  else {
    doRequest(603)
  }
    // fs.readFile("C:\\Projects\\Yad2\\data\\new_north.html", function(err, body) {
    //   if (err) throw(err)

    //   const data = getDataTbl(body)
    //   if (data == null) return console.log('Error finding data!')
    //   console.log("%s no of records %d", new Date().toString(), data.length)
    //   //exportJson(data)
    //   addToDb(data)
    // })
}

var errDic = []
const doScheduledTask = async (indx, page, iteration, retake) => {
  if (typeof(retake) == 'undefined') retake = false
  if (typeof(indx) == 'undefined') indx = 0
  if (typeof(iteration) == 'undefined') iteration = 1

  let len
  try {
    len = await doRequest(citiesCodes[indx], page)
  }
  catch (err) {
      console.log(err.message)
      if (!retake)
        errDic.push({indx:indx, page:page, iteration:iteration})
  }
  finally {
    console.log('iteration=%s,city=%s,page=%s,no of records=%s,date=%s', iteration, citiesCodes[indx], page, len, new Date())
    if (retake) return

    if (len < 15) {
      indx++;
      page = undefined;
    }
    else {
      if (typeof(page) != 'undefined')
        page++;
      else
        page = 2;
    }

    if (indx < citiesCodes.length) {
      var millisecs = Math.floor(
        Math.random() * 15000 + 15000
      )

      if (iteration % 10 == 0) millisecs *= 4;
      iteration++

      setTimeout(() => {
        doScheduledTask(indx, page, iteration)
      }, millisecs);
    }
    else {
      errDic.forEach(el => {
        doScheduledTask(el.indx, el.page, el.iteration, true)
      })
    }
  }
}

const doRequest = async (city, page) => {
  var url =  'https://www.yad2.co.il/realestate/rent?city=' + city
  if (typeof(page) != 'undefined') url += '&page=' + page
  options.headers.path = url.replace('https://www.yad2.co.il', '')
  options.headers.referer = url

  let dataLen = await new Promise((resolve, reject) => {
    request(url, options, (err, res, body) => {
      if (err) {
        console.log(err);
        return reject(new Error(err.message))
      }
      const data = getDataTbl(body);
      if (data == null)
        return reject(new Error('Error finding data!'));

      //console.log("%s no of records %d", new Date().toString(), data.length);
      addToDb(data);
      //exportJson(data);

      resolve(data.length)
    });
  })

  return dataLen
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
      //console.log(data.items[i])
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
  const latitude = (!isNaN(itemData.coordinates.latitude) ? Number(itemData.coordinates.latitude) : null)
  const longitude = (!isNaN(itemData.coordinates.longitude) ? Number(itemData.coordinates.longitude) : null)
  var neighborhood = ""
  
  const neighborhoodMatch = itemData.row_2.match(/([א-ת\s]+)(?=,\s[א-ת\s]+$)/)
  if (neighborhoodMatch != null) neighborhood = neighborhoodMatch[0]

  var ret = {
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

  if (longitude !=  null && latitude != null) {
    ret['longitude'] = longitude
    ret['latitude'] = latitude
  }

  return ret
}

exportJson = data => {
  const now = new Date()
  const fileName = now.getFullYear() + '_' + (now.getMonth()+1) + '_' + now.getDate()
  const path = "data/" + fileName + ".json"
  fs.exists(path, isExists => {
    if (isExists) {
      fs.appendFile(path, JSON.stringify(data), err => {
        if (err != null) throw err
      })
    }
    else {
      fs.writeFile(path, JSON.stringify(data), err => {
        if (err != null) throw err
      })
    }
  })
}

function addToDb(data) {
  Yad2DL.connect(async function(dbo) {
    var promises = []
    data.forEach(el => {
      promises.push(new Promise((resolve, reject) => {
        dbo.collection("appartments").findOne({'ad_number': {$eq: el.ad_number}}, (err, doc) => {
          promises.push(new Promise((resolve1, reject1) => {
            if (!doc) {
              promises.push(new Promise((resolve2,reject2)=> {
                dbo.collection("appartments").insertOne(el, function(err, res) {
                  if (!err) resolve2(); else reject2(new Error(err.message))
                })
              }));
            }
            else {
              if (typeof(doc.price.find(p => p.date.getTime() === el.price[0].date.getTime())) == 'undefined')
                doc.price.push(el.price[0])

              promises.push(new Promise((resolve2,reject2)=> {
                dbo.collection("appartments").updateOne({'ad_number': {$eq: el.ad_number}}, {$set: {
                    price: doc.price,
                    updated_at: el.updated_at,
                    sqMr: el.sqMr,
                    floor: el.floor,
                    room: el.room,
                    address: el.address,
                    city: el.city,
                    neighborhood: el.neighborhood,
                    refurbished: el.refurbished,
                    longitude: el.longitude,
                    latitude: el.latitude
                  }}, () => {
                  resolve2()
                })
              }))
            }
            resolve1()
          }))
          resolve()
        })
      }))
    });

    let aw = await Promise.all(promises)
    //db.close();
  });
}

main()
