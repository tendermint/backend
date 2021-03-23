# backend

This is a server to fetch data from third-party sources, serve content and do everything a front-end can't.

⚡️ https://backend.tendermint.com

# Install

The server needs a reasonably recent version of Node.js installed.

```
npm install
```

# Run

```
npm run start
```


## API

### GET `/medium`

**200**: Returns a list of medium feed from `https://medium.com/feed/tendermint?latest` and `https://blog.cosmos.network/feed`
```
[
  {
    "title": "The Cosmos Hub is a Port City",
    "link": "https://blog.cosmos.network/the-cosmos-hub-is-a-port-city-5b7f2d28debf?source=rss----6c5d35b77e13---4",
    "date": "Tue, 23 Feb 2021 18:22:00 GMT",
    "image": "https://cdn-images-1.medium.com/max/1024/1*DHtmSfS_Efvuq8n2LAnhkA.png",
    "timestamp": 1614104520000
  },
  ...
]
```

### GET `/cosmos/tag/tutorial`

**200**: Returns a list of Cosmos medium feed filtered by `tutorial` category.
```
[
  {
    "title": "Setup your frontend application / NodeJS Application with Gaia v4.0.0",
    "link": "https://blog.cosmos.network/setup-your-frontend-application-nodejs-application-with-gaia-v4-0-0-9546f4b3e302?source=rss----6c5d35b77e13---4",
    "date": "Fri, 12 Feb 2021 18:07:03 GMT",
    "image": "https://cdn-images-1.medium.com/max/1024/1*LYh6GQi6M7o9_J-ITFP36w.png",
    "timestamp": 1613153223000,
    "category": [
      "cosmos-sdk",
      "crypto",
      "development",
      "blockchain",
      "tutorial"
    ]
  }
]
```

### GET `/marketcap`

**200**: Returns the value of total current market cap of Cosmos Ecosystem apps in billion (_Messari API_)

### GET `/apps`

**200**: Returns a list of Ecosystem apps & projects

### GET `/wallets`

**200**: Returns a list of Ecosystem wallets