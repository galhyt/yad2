//const express = require('express');
//const bodyParser = require('body-parser');
//const pino = require('express-pino-logger')();
import Yad2DL from './Yad2/dl'

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(pino);

app.get('/api', (req, res) => {
  const values = await getDistinctValues('neighborhood')
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({'values': values}))
});

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);

const getDistinctValues = async (fieldName) => {
  let values
  new Promise((resolve,reject) => {
    Yad2DL.getDistinct(fieldName, values => {
        resolve(values)
    })
  }).then(vals => values = vals)

  return values
}