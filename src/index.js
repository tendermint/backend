const
  express = require('express'),
  bodyParser = require('body-parser'),
  convert = require('xml-js'),
  axios = require('axios'),
  cache = require("./cache"),
  app = express()

app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/medium/:source', cache.serve(30), function (request, response) {
  const urls = {
    tendermint: "https://medium.com/feed/tendermint?latest",
    cosmos: "https://blog.cosmos.network/feed"
  }
  response.setHeader('Content-Type', 'application/json');
  axios.get(urls[request.params.source])
    .then(({ data }) => {
      response.status(200).send(convert.xml2json(data, { compact: true }))
    })
    .catch(err => response.send(err));
});

const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});