const express = require("express"),
  bodyParser = require("body-parser"),
  convert = require("xml-js"),
  axios = require("axios"),
  fetch = require("node-fetch"),
  Airtable = require("airtable-node"),
  MailerLite = require('mailerlite-api-v2-node'),
  HTMLParser = require("node-html-parser"),
  _ = require("lodash"),
  cache = require("./cache"),
  app = express(),
  port = process.env.PORT || 8888;

require("dotenv").config();

// Mirror json file of https://api.messari.io/api/screener/FCB5C9E8
const assets = require("../assets.json");

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const MESSARI_API_KEY = process.env.MESSARI_API_KEY;
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;

app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", async (req, res) => {
  res.json({ api: "ok" });
});

app.get("/medium/?", cache.serve(30), function (req, res) {
  res.setHeader("Content-Type", "application/json");
  axios
    .all([
      axios.get("https://medium.com/feed/tendermint?latest"),
      axios.get("https://blog.cosmos.network/feed"),
    ])
    .then((responses) => {
      const all = responses
        .map((e) => {
          return JSON.parse(
            convert.xml2json(e.data, { compact: true })
          ).rss.channel.item.map((item) => {
            return {
              title: item.title._cdata,
              link: item.link._text,
              date: item.pubDate._text,
              image: HTMLParser.parse(item["content:encoded"]._cdata)
                .querySelector("img")
                .attributes["src"].toString(),
              timestamp: new Date(item.pubDate._text).getTime(),
            };
          });
        })
        .flat(1);
      const sorted = _.orderBy(all, ["timestamp"], ["desc"]);
      res.status(200).send(sorted);
    });
});

app.get("/subscriber", cache.serve(30), async (req, res) => {
  const mailerLite = MailerLite(MAILERLITE_API_KEY);
  const {userID} = req.body;
  mailerLite
    .getSubscriber(userID)
    .then((response) => {
      res.send(response);
    });
});

app.post("/group-add-subscriber", cache.serve(30), async (req, res) => {
  const mailerLite = MailerLite(MAILERLITE_API_KEY);
  const {groupId, userID} = req.body;
  mailerLite
    .addSubscriberToGroup(groupId, userID)
    .then((response) => {
      res.send(response);
    });
});

app.get("/cosmos/tag/tutorial", cache.serve(30), function (req, res) {
  res.setHeader("Content-Type", "application/json");
  axios
    .all([axios.get("https://blog.cosmos.network/feed/tagged/tutorial")])
    .then((responses) => {
      const all = responses
        .map((e) => {
          const parsed = JSON.parse(convert.xml2json(e.data, { compact: true }))
            .rss.channel.item;
          // handle tagged items that have only 1 item
          if (parsed.length) {
            const mapItems = parsed.map((item) => {
              return {
                title: item.title._cdata,
                link: item.link._text,
                date: item.pubDate._text,
                image: HTMLParser.parse(item["content:encoded"]._cdata)
                  .querySelector("img")
                  .attributes["src"].toString(),
                timestamp: new Date(item.pubDate._text).getTime(),
                category:
                  item.category._cdata || item.category.map((i) => i._cdata),
              };
            });
            return mapItems;
          } else {
            return {
              title: parsed.title._cdata,
              link: parsed.link._text,
              date: parsed.pubDate._text,
              image: HTMLParser.parse(parsed["content:encoded"]._cdata)
                .querySelector("img")
                .attributes["src"].toString(),
              timestamp: new Date(parsed.pubDate._text).getTime(),
              category:
                parsed.category._cdata || parsed.category.map((i) => i._cdata),
            };
          }
        })
        .flat(1);
      res.status(200).send(all);
    })
    .catch((error) => console.log(error));
});

app.get("/marketcap", cache.serve(30), async (req, res) => {
  // Uncomment to use realtime messari screener api filters watchedAssets
  // const data = (await axios.get(`https://api.messari.io/api/screener/FCB5C9E8`)).data;
  // const watchedAssetsList = data.filters.watch.watchedAssets
  // res.json(assets)

  let list = [];

  await Promise.all(
    assets.watchedAssets.map((id) => {
      return new Promise((resolve) => {
        fetch(`https://data.messari.io/api/v1/assets/${id}/metrics`, {
          headers: {
            "x-messari-api-key": MESSARI_API_KEY,
          },
        }).then((response) => {
          return new Promise(() => {
            response.json().then((item) => {
              // handle current_marketcap_usd: null
              // e.g. https://data.messari.io/api/v1/assets/starname/metrics
              const currentMarketcap =
                item.data.marketcap.current_marketcap_usd || 0;
              list.push(currentMarketcap);
              resolve();
            });
          });
        });
      });
    })
  )
    .then(() => {
      // filter false value in array
      const checkNullList = list.filter(Boolean);
      const sum = checkNullList.reduce((a, b) => a + b, 0);
      const totalMarketcap = Number(
        (Math.round(sum) / 1000 / 1000 / 1000).toFixed(2)
      );

      res.setHeader(
        "Cache-Control",
        "public, s-maxage=1200, stale-while-revalidate=600"
      );

      res.send(JSON.stringify(totalMarketcap));
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/apps", async (req, res) => {
  const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY })
    .base("app257DDgKV2KGpWA")
    .table("apps");

  airtable
    .list({
      view: "All apps",
      maxRecords: 1000,
    })
    .then((response) => {
      res.send(response);
    });
});

app.get("/wallets", async (req, res) => {
  const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY })
    .base("app257DDgKV2KGpWA")
    .table("wallets");

  airtable
    .list({
      maxRecords: 1000,
    })
    .then((response) => {
      res.send(response);
    });
});

app.get("/explorers", async (req, res) => {
  const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY })
    .base("app257DDgKV2KGpWA")
    .table("explorers");

  airtable
    .list({
      maxRecords: 1000,
    })
    .then((response) => {
      res.send(response);
    });
});

app.get("/events", async (req, res) => {
  const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY })
    .base("app6cmf6dU89OHtUP")
    .table("events");

  airtable
    .list({
      maxRecords: 1000,
    })
    .then((response) => {
      res.send(response);
    });
});

app.get("/cwu", async (req, res) => {
  const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY })
    .base("appGq4J4B7aGj2d3P")
    .table("cwu");

  airtable
    .list({
      maxRecords: 1000,
    })
    .then((response) => {
      res.send(response);
    });
});

app.get("/workshops", async (req, res) => {
  const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY })
    .base("appyPXo0kRzyqRPJk")
    .table("workshops");

  airtable
    .list({
      maxRecords: 1000,
    })
    .then((response) => {
      res.send(response);
    });
});

app.get("/coingecko-cosmos-marketcap", cache.serve(30), async (req, res) => {
  const data = [
    "cosmos",
    "iris-network",
    "terra-luna",
    "terrausd",
    "binancecoin",
    "okb",
    "crypto-com-chain",
    "thorchain",
    "fetch-ai",
    "kucoin-shares",
    "mirror-protocol",
    "kava",
    "band-protocol",
    "oasis-network",
    "akash-network",
    "secret",
    "anchor-protocol",
    "injective-protocol",
    "bluezelle",
    "switcheo",
    "certik",
    "sentinel-group",
    "hard-protocol",
    "oraichain-token",
    "foam-protocol",
    "kira-network",
    "e-money",
    "likecoin",
    "starname",
    "sifchain",
    "bitsong",
  ];
  const tokenIdStrings = data.toString();

  await axios
    .get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIdStrings}&vs_currencies=usd&include_market_cap=true`
    )
    .then((response) => {
      const marketcap = Object.values(response.data).map(
        (i) => i.usd_market_cap || 0
      );
      const sum = marketcap.reduce((a, b) => a + b, 0);
      const totalMarketcap = Number(
        (Math.round(sum) / 1000 / 1000 / 1000).toFixed(2)
      );

      res.send(JSON.stringify(totalMarketcap));
    })
    .catch((err) => {
      console.log(err);
    });
});

const listener = app.listen(port, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
