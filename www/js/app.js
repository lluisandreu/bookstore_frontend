// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic']);

app.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});

app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('index', {
            url: '/',
            templateUrl: 'templates/login.html',
            controller: 'LoginCtrl'
        })
        .state('home', {
            url: '/home',
            templateUrl: 'templates/home.html',
            controller: 'MainCtrl'
        });
    $urlRouterProvider.otherwise('/');

});

app.controller('MainCtrl',

    function ($http, $scope) {
        var backendUrl = "http://www.bookstore.backend.boom/index.php/book/rest/";
        $scope.books = [];
        $http.get(backendUrl + 'all').then(function (response) {
            $scope.books = response.data;
            console.log(response.data);
        }, function (errResponse) {
            console.error("Can't fetch ".backendUrl);
        });
    }
);

app.controller('LoginCtrl',

    function ($scope, $http, $state) {
        var loginUrl = "http://multimedia.uoc.edu/frontend/auth.php";
        $scope.user = {};
        $scope.login = function (data) {
            $scope.user.user = data.user;
            $scope.user.passwd = data.passwd;
            $http.post(loginUrl, $scope.user).then(
                function (resp) {
                    console.log(resp.data);
                    $scope.status = resp.data.status;
                    if ($scope.status == 'KO') {
                        $state.go("home");
                    }
                });
            console.log($scope.user);
        }
    }
)

function ContentController($scope, $ionicSideMenuDelegate) {
    $scope.toggleLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };
}