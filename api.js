const express = require('express');
const bodyParser = require('body-parser');
//const pino = require('express-pino-logger')();
const request = require('request');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(pino);

app.get('/api', (req, res) => {
    res.send('api called')
});

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);