const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
var Yad2DL = require('./dl')

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(pino);

app.get('/api/fieldvalues/:fieldname', async (req, res) => {
  var values = await getDistinctValues(req.params.fieldname, req.query)
  values = values.filter(val => {
    return val != null
  })
  
  console.log(values)
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(values))
});

app.get('/api/filter', async (req, res) => {
  const values = await getResult(req.query)
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(values))
});

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);

const getDistinctValues = async (fieldName, query) => {
  let values
  console.log('fielName='+fieldName+' query='+JSON.stringify(query))
  await new Promise((resolve,reject) => {
    Yad2DL.getDistinct(fieldName, values => {
        resolve(values)
    }, query)
  }).then(vals => values = vals)

  return values
}

const getResult = async (query) => {
  let values
  console.log('getResult: query='+query)
  await new Promise((resolve,reject) => {
    Yad2DL.getResult(query, values => {
        resolve(values)
    })
  }).then(vals => values = vals)

  return values
}
