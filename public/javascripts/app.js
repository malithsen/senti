'use strict';
var twiApp = angular.module('twiApp', ['ngRoute', 'chieffancypants.loadingBar', 'ngAnimate', 'ngSanitize']);

twiApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
  $locationProvider.html5Mode(true);

  $routeProvider
  .when('/', {
    templateUrl: 'views/home'
  })
  .when('/search', {
    templateUrl: 'views/tweets',
    controller: "TweetCtrl"
  })
  .when('/nouser', {
    templateUrl: 'views/nouser'
  })
  .when('/ratelimit', {
    templateUrl: 'views/ratelimit'
  })
  .otherwise({
    templateUrl: 'views/tweets',
    controller: 'TweetCtrl'
  });
}]);

twiApp.filter('linkify', function(){
  return function(text, urls){
    text = text.replace(/(^|\s|“|\.|")@(\w+)/g, '$1<a href="https://twitter.com/$2" target="_blank">@$2</a>');
    text = text.replace(/(^|\s)#(\w+)/g, '$1<a href="https://twitter.com/search?q=%23$2" target="_blank">#$2</a>');
    urls.forEach(function(url) {
        text = text.replace(url[0], "<a href='" + url[1] + "'target='_blank'>" + url[2] + "</a>");
      });
    return text
  };
}).filter('highlight', function(){
  return function(text, pos, neg){
    pos.forEach(function(t){
      text = text.replace(new RegExp('\\b'+t+'\\b', 'gi'), '<span class="positive">$&</span>');
    });
    neg.forEach(function(t){
      text = text.replace(new RegExp('\\b'+t+'\\b', 'gi'), '<span class="negative">$&</span>');
    });
    return text
  };
});

twiApp.controller('TweetCtrl', ['$scope', '$http', '$location', function($scope, $http, $location){
  var paths = ['/', '/search', '/nouser', '/ratelimit']
  var curpath = $location.path()

  var renderTweets = function(data){
  if (data.success == 1){
    data.tweets.forEach(function(t){
      if (t.score > 0){
        t.emoti = 'happy.png';
        t.colour = 'rgba(144, 221, 144, 0.7)'; // hand this over to css
      } else{
        t.emoti = 'sad.png';
        t.colour = 'rgba(238, 154, 154, 0.7)';
      }
    });
    $scope.tweets = data.tweets;
  } else if(data.success == 0) {
      $location.url('/nouser');
  } else if(data.success == -1){
      $location.url('/ratelimit');
    }
  };

  var loadUser = function(name){
    $http.get('getUser/' + $scope.keyword).success(function(data){
      renderTweets(data);
    });
  };

  var loadSearch = function(term){
    $location.url('/search');
    $http.get('search/' + $scope.keyword).success(function(data){
      renderTweets(data);
    });
  };

  $scope.go = function ( path ) {
    if(path[0] == '@'){
      $location.path(path.slice(1, path.length));
    } else {
      loadSearch(path);
    }
  };

  if (paths.indexOf(curpath) < 0) {
    $scope.keyword = '@' + curpath.slice(1, curpath.length);
    loadUser($scope.keyword);
  }
}]);
