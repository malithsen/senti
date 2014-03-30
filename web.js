var TwitterCon = require('./TwitterCon'),
    config = require('./config'),
    limiter = require('connect-ratelimit'),
    cache = require('memory-cache');

var TIMEOUT = 1000 * 60;
var CACHE_TIMEOUT = 1000 * 5;
var express = require('express');
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger());

app.configure( function() {
  app.use(express.static(__dirname + '/public'));
});

var twittercon = new TwitterCon(config.twitter.consumer_key,
                                config.twitter.consumer_secret,
                                config.twitter.access_key,
                                config.twitter.access_secret);

app.use(limiter({
  whitelist: ['127.0.0.1'],
  catagories: {
    normal: {
      totalRequests: 20,
      every: (1000 * 60 * 15)
    }
  }
}));

app.get('/search/:word', function(req, res) {
  console.log("Calling getSearchResults");
  var word = req.params.word;
  var cb = function(err, data) {
    if (err) {
      res.end(err);
    } else {
      res.json(data);
    }
  };
  if (res.ratelimit.exceeded){
    cb(null, {"success": -1, "tweets": []});
  } else {
    twittercon.getSearchResults(word, cb);
  }
});

app.get('/getUser/:user', function(req, res) {
  console.log("Calling getUserTimeline");
  console.log(res.ratelimit);
  var user = req.params.user;
  var cachekey = user;

  var cb = function(err, data, fromCache) {
    if (err) {
      res.end(err);
    } else {
      if (!fromCache){
        cache.put(cachekey, data, CACHE_TIMEOUT);
      }
      res.json(data);
    }
  };
  if(cache.get(cachekey)){
    cb(null, cache.get(cachekey), true);
  } else {
    if (res.ratelimit.exceeded){
      cb(null, {"success": -1, "tweets": []});
    } else {
      twittercon.getUserTweets(user, cb);
    }
  }
});

app.get('/views/:v', function(req, res) {
  console.log(req.params.v);
  res.render(req.params.v);
});

app.get('*', function(req, res) {
  res.render('index', {
    title: 'Senti',
  });
});

var port = process.env.PORT || 3000;
var server = app.listen(port, function() {
    console.log('Listening on port %d', server.address().port);
});