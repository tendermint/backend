const cache = require('memory-cache')

let memCache = new cache.Cache();

let serve = (duration) => {
  return (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    const key = '__express__' + req.originalUrl || req.url
    const cacheContent = memCache.get(key);
    if (cacheContent) {
      res.send(cacheContent);
      return
    } else {
      res.sendResponse = res.send
      res.send = (body) => {
        memCache.put(key, body, duration * 1000);
        res.sendResponse(body)
      }
      next()
    }
  }
}

module.exports.serve = serve