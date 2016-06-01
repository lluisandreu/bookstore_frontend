// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'webStorageModule']);

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
        })
        .state('books', {
            url: '/books',
            templateUrl: 'templates/books.html',
            controller: 'MainCtrl'
        })
        .state('book', {
            url: '/book/:bookId',
            templateUrl: 'templates/book.html',
            controller: 'BookCtrl'
        });
    $urlRouterProvider.otherwise('/');

});

app.controller('LoginCtrl',

    function ($ionicSideMenuDelegate, $scope, $http, $state, webStorage) {
        var logged = webStorage.get('login');
        if (logged == "logged") {
            $state.go("home");
        } else {
            var loginUrl = "http://multimedia.uoc.edu/frontend/auth.php";
            $ionicSideMenuDelegate.canDragContent(false);
            $scope.message = {};
            $scope.user = {};
            var cart = [];
            $scope.login = function (data) {
                var userLowercase = data.user.toLowerCase();
                $scope.user = $.param({
                    user: userLowercase,
                    passwd: data.passwd,
                });
                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    }
                }
                $http.post(loginUrl, $scope.user, config).then(
                    function (resp) {
                        console.log(resp.data);
                        $scope.status = resp.data.status;
                        if ($scope.status == 'OK') {
                            webStorage.set('username', data.user);
                            webStorage.set('login', 'logged');
                            webStorage.set('cart', cart);
                            $state.go("home");
                        } else {
                            $scope.message.login = "Your login failed. Please try again";
                        }
                    });
                console.log($scope.user);
            }
        }
    }


)

app.controller('MainCtrl',

    function ($ionicSideMenuDelegate, $http, $scope, webStorage) {
        var backendUrl = "http://eimtcms.uoc.edu/~lluisandreu/mybooks_backend/public_html/index.php/book/rest/";
        $ionicSideMenuDelegate.canDragContent(true);
        $scope.books = {};
        $scope.user = webStorage.get('username');
        $http.get(backendUrl + 'all').then(function (response) {
            $scope.books = response.data;
            console.log(response.data);
        }, function (errResponse) {
            console.error("Can't fetch ".backendUrl);
        });
        $scope.logout = function () {
            webStorage.clear('login');
        }
    }
);

app.controller('BookCtrl',

    function ($ionicSideMenuDelegate, $stateParams, $http, $scope, webStorage) {
        $ionicSideMenuDelegate.canDragContent(true);
        var backendUrl = "http://eimtcms.uoc.edu/~lluisandreu/mybooks_backend/public_html/index.php/book/rest/";
        var bookId = $stateParams.bookId;
        $http.get(backendUrl + bookId).then(function (response) {
            $scope.books = response.data;
            console.log($scope.books);
        }, function (errResponse) {
            console.error("Can't fetch ".backendUrl);
        });
        $scope.addToCard = function (id) {
            var order = webStorage.get('cart');
            order.push(id);
            webStorage.set('cart', order);
        }
        console.log(webStorage.get('cart'));
    }
);




function ContentController($scope, $ionicSideMenuDelegate) {
    $scope.toggleLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };
}