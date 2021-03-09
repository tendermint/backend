const
  express = require('express'),
  bodyParser = require('body-parser'),
  convert = require('xml-js'),
  axios = require('axios'),
  cache = require("./cache"),
  HTMLParser = require('node-html-parser'),
  _ = require("lodash"),
  app = express(),
  port = process.env.PORT || 8888;

app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/medium/?', cache.serve(30), function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  axios.all([
    axios.get("https://medium.com/feed/tendermint?latest"),
    axios.get("https://blog.cosmos.network/feed")
  ]).then(responses => {
    const all = responses.map(e => {
      return JSON.parse(convert.xml2json(e.data, { compact: true })).rss.channel.item.map(item => {
        return {
          title: item.title._cdata,
          link: item.link._text,
          date: item.pubDate._text,
          image: HTMLParser.parse(item["content:encoded"]._cdata).querySelector("img").attributes['src'].toString(),
          timestamp: new Date(item.pubDate._text).getTime()
        }
      })
    }).flat(1)
    const sorted = _.orderBy(all, ["timestamp"], ["desc"])
    res.status(200).send(sorted)
  })
});

app.get('/cosmos/tag/tutorial', cache.serve(30), function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  axios.all([
    axios.get("https://blog.cosmos.network/feed")
  ]).then(responses => {
    const all = responses.map(e => {
      return JSON.parse(convert.xml2json(e.data, { compact: true })).rss.channel.item.map(item => {
        return {
          title: item.title._cdata,
          link: item.link._text,
          date: item.pubDate._text,
          image: HTMLParser.parse(item["content:encoded"]._cdata).querySelector("img").attributes['src'].toString(),
          timestamp: new Date(item.pubDate._text).getTime(),
          category: item.category._cdata || item.category.map(i => i._cdata)
        }
      })
    }).flat(1)
    res.status(200).send(all)
  })
  .catch(error => console.log(error))
});

const listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});