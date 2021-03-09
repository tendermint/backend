# backend

This is a server to fetch data from third-party sources, serve content and do everything a front-end can't.

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

**200**: Returns a list of medium feed from `https://blog.cosmos.network/feed` filtered with `tutorial` category.
```
[
  {
    "title": "The Cosmos Hub is a Port City",
    "link": "https://blog.cosmos.network/the-cosmos-hub-is-a-port-city-5b7f2d28debf?source=rss----6c5d35b77e13---4",
    "date": "Tue, 23 Feb 2021 18:22:00 GMT",
    "image": "https://cdn-images-1.medium.com/max/1024/1*DHtmSfS_Efvuq8n2LAnhkA.png",
    "timestamp": 1614104520000,
    "category": [
      "roadmaps",
      "interchain",
      "cosmos",
      "blockchain",
      "cosmos-hub"
    ]
  },
  ...
]
```