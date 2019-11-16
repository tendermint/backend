const express = require('express');
const axios = require('axios');
const convert = require('xml-js');
const bodyParser = require('body-parser')

const app = express();

app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/medium', function (request, response) {
  response.setHeader('Content-Type', 'application/json');
  axios.get('https://medium.com/feed/tendermint?latest')
    .then(({ data }) => {
      response.status(200).send(convert.xml2json(data, { compact: true }))
    })
    .catch(err => response.send(err));
});

const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});