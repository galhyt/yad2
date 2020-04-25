const express = require('express');
const bodyParser = require('body-parser');
require('custom-env').env(true)
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
  
  console.log(JSON.stringify(values))
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(values))
});

app.get('/api/filter/:groupBy', async (req, res) => {
  const values = await getResult(req.params.groupBy, req.query)
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(values))
});

const server = app.listen(process.env.API_PORT, () =>
  console.log('Express server is running on '+ server.address().address+':'+server.address().port)
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

const getResult = async (groupBy, query) => {
  let values
  console.log('getResult: query='+query)
  await new Promise((resolve,reject) => {
    Yad2DL.getResult(groupBy, query, values => {
        resolve(values)
    })
  }).then(vals => values = vals)

  return values
}
