'use strict';
var twiApp = angular.module('twiApp', ['ngRoute', 'chieffancypants.loadingBar', 'ngAnimate', 'ngSanitize']);

twiApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
  $locationProvider.html5Mode(true);

  $routeProvider
  .when('/', {
    templateUrl: 'views/home'
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
  var paths = ['/', '/search', '/nouser', '/ratelimit'];
  var curpath = $location.path();
  $scope.hide_summary = true;

  var generateChart = function(p, n){
    var data = [
    {
      value: p,
      color: "#2ecc71"
    },
    {
      value: n,
      color: "#e74c3c"
    }]
    var ctx = document.getElementById("pie").getContext("2d");
    var myNewChart = new Chart(ctx).Pie(data);
  };

  var renderTweets = function(data){
    var totalpos = 0;
    var totalneg = 0;
    if (data.success == 1){
      data.tweets.forEach(function(t){
        if (t.score > 0){
          t.emoti = 'happy.png';
          totalpos ++;
          t.colour = 'rgba(144, 221, 144, 0.7)'; // hand this over to css
        } else{
          t.emoti = 'sad.png';
          totalneg ++;
          t.colour = 'rgba(238, 154, 154, 0.7)';
        }
      });
      $scope.tweets = data.tweets;
      $scope.totalpos = totalpos;
      $scope.totalneg = totalneg;
      $scope.hide_summary = false;
    } else if(data.success == 0) {
        $location.url('/nouser');
    } else if(data.success == -1){
        $location.url('/ratelimit');
      }

    generateChart(totalpos, totalneg);
  };

  var loadUser = function(name){
    $http.get('getUser/' + name).success(function(data){
      renderTweets(data);
    });
  };

  var loadSearch = function(term){
    $http.get('search/' + term).success(function(data){
      renderTweets(data);
    });
  };

  $scope.go = function (path) {
    if(path[0] == '@'){
      $location.path(path.slice(1, path.length));
    } else {
      $location.path('q=' + path);
    }
  };

  if(curpath.slice(1, 3) == 'q='){
    $scope.keyword = curpath.slice(3, curpath.length);
    loadSearch($scope.keyword);
  }
  else if (paths.indexOf(curpath) < 0) {
    $scope.keyword = '@' + curpath.slice(1, curpath.length);
    loadUser($scope.keyword);
  }
}]);
