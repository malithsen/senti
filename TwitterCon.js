var Twitter = require('ntwitter'),
    moment = require('moment'),
    sentiment = require('sentiment');

var getExpandedURL = function(entity) {
  var a = [entity.url, entity.expanded_url, entity.display_url];
  return a;
};

var TwitterCon = function(con_key, con_sec, acc_key, acc_sec){
    this.con_key = con_key;
    this.con_sec = con_sec;
    this.acc_key = acc_key;
    this.acc_sec = acc_sec;

    this.twit = new Twitter({
        consumer_key: con_key,
        consumer_secret: con_sec,
        access_token_key: acc_key,
        access_token_secret: acc_sec
        });
};


TwitterCon.prototype.getSearchResults = function(word, cb){
    var twit = this.twit;
    twit.search(word, {"count": 50, "include_rts": false, "lang": "en"}, function(err, data) {
        var tweets = [];
        data.statuses.forEach(function(entry) {
          var time = moment(entry.created_at).valueOf();

            var urls = entry.entities.urls.map(getExpandedURL);
            if (entry.entities.media) {
              var media = entry.entities.media.map(getExpandedURL);
              urls = urls.concat(media);
            }

            var t = {};
            t.user = entry.user.screen_name;
            t.text = entry.text;
            t.time = time;
            t.tweet_url = 'https://twitter.com/' + t.user + '/status/' + entry.id_str;
            t.media_url = entry.entities.media ? [entry.entities.media[0].media_url, entry.entities.media[0].expanded_url] : '';
            t.urls = urls;
            sentiment(t.text, function (err, result) {
              t.score = result.score;
              t.comp = result.comparative;
              t.positive = result.positive;
              t.negative = result.negative;
              if (result.score != 0){
                tweets.push(t);
              }
            });
      });
      var result = {"success": 1, "tweets": tweets}
      cb(null, result);
});
};
TwitterCon.prototype.getUserTweets = function(user, cb){
    var twit = this.twit;
    twit.getUserTimeline({"screen_name": user, "count": 50, "include_rts": false}, function(err, data){
        if (data == undefined) {
          cb(null, {"success": 0, "tweets": []});
        } else {
          var tweets = [];
          data.forEach(function(entry) {
          var time = moment(entry.created_at).valueOf();

            var urls = entry.entities.urls.map(getExpandedURL);
            if (entry.entities.media) {
              var media = entry.entities.media.map(getExpandedURL);
              urls = urls.concat(media);
            }

            var t = {};
            t.user = entry.user.screen_name;
            t.text = entry.text;
            t.time = time;
            t.tweet_url = 'https://twitter.com/' + t.user + '/status/' + entry.id_str;
            t.media_url = entry.entities.media ? [entry.entities.media[0].media_url, entry.entities.media[0].expanded_url] : '';
            t.urls = urls;
            sentiment(t.text, function (err, result) {
              t.score = result.score;
              t.comp = result.comparative;
              t.positive = result.positive;
              t.negative = result.negative;
              if (result.score != 0){
                tweets.push(t);
              }
            });
          });
          var result = {"success": 1, "tweets": tweets}
          cb(null, result);
        }

    });
};

module.exports = TwitterCon;
