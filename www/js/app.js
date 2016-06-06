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
            controller: 'BooksCtrl'
        })
        .state('book', {
            url: '/book/:bookId',
            templateUrl: 'templates/book.html',
            controller: 'BookCtrl'
        })
        .state('order', {
            url: '/order',
            templateUrl: 'templates/order.html',
            controller: 'OrderCtrl'
        });
    $urlRouterProvider.otherwise('/');

});

app.service('backendUrl', function () {
    this.url = function () {
        return "http://eimtcms.uoc.edu/~lluisandreu/mybooks_backend/public_html/index.php/book/rest/";
    }
});

app.controller('MainCtrl', function ($scope, webStorage, $ionicSideMenuDelegate, $ionicLoading) {
    $ionicLoading.show();
    $scope.user = webStorage.get('username');
    $scope.orderTotal = webStorage.get('order');
    $scope.cart = webStorage.get('cart');
    $ionicLoading.hide();

    $scope.logOut = function () {
        webStorage.remove('login');
    }

    $scope.toggleLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

});

app.controller('LoginCtrl',

    function ($ionicSideMenuDelegate, $scope, $http, $state, webStorage, $ionicLoading) {
        var logged = webStorage.get('login');
        if (logged == "logged") {
            $state.go("home");
        } else {
            var loginUrl = "http://multimedia.uoc.edu/frontend/auth.php";
            $ionicSideMenuDelegate.canDragContent(false);
            $scope.message = {};
            $scope.user = {};
            var cart = [];
            var order = [];
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
                $ionicLoading.show();
                $http.post(loginUrl, $scope.user, config).then(
                    function (resp) {
                        $scope.status = resp.data.status;
                        if ($scope.status == 'OK') {
                            $ionicLoading.hide();
                            webStorage.set('login', 'logged');
                            if (!webStorage.has('username')) {
                                webStorage.set('username', data.user);
                            }
                            if (!webStorage.has('cart')) {
                                webStorage.set('cart', cart);
                            }
                            if (!webStorage.has('order')) {
                                webStorage.set('order', order);
                            }

                            $state.go("home");
                        } else {
                            $ionicLoading.hide();
                            $scope.message.login = "Your login failed. Please try again";
                        }
                    });
            }
        }
    }
);

app.controller('BooksCtrl',

    function ($ionicSideMenuDelegate, $http, $scope, webStorage, backendUrl, $ionicLoading) {
        $ionicLoading.show();
        var backendUrl = backendUrl.url();
        $ionicSideMenuDelegate.canDragContent(true);
        $scope.books = {};
        $scope.user = webStorage.get('username');
        $http.get(backendUrl + 'all').then(function (response) {
            $scope.books = response.data;
            $ionicLoading.hide();
        }, function (errResponse) {
            console.error("Can't fetch ".backendUrl);
            $ionicLoading.hide();
        });
        $scope.logout = function () {
            webStorage.remove('login');
        }
    }
);

app.controller('BookCtrl',

    function ($ionicSideMenuDelegate, $stateParams, $http, $scope, webStorage, backendUrl, $ionicLoading, $ionicPopover) {
        $ionicLoading.show();
        $ionicSideMenuDelegate.canDragContent(true);
        var backendUrl = backendUrl.url();
        var bookId = $stateParams.bookId;
        $scope.orderTodal =
            $scope.message = {};
        $http.get(backendUrl + bookId).then(function (response) {
            $scope.books = response.data;
            $ionicLoading.hide();
        }, function (errResponse) {
            console.error("Can't fetch ".backendUrl);
        });

        $scope.addToCard = function (id, title, quantity, price) {
            $ionicLoading.show();
            var lineItem = {
                id, title, quantity, price
            };
            var order = webStorage.get('cart');
            order.push(lineItem);
            webStorage.set('cart', order);
            $scope.message.cart = "This book was added to your cart";
            $ionicLoading.hide();

        }

    }
);

app.controller('OrderCtrl',

    function (backendUrl, $ionicSideMenuDelegate, $stateParams, $http, $scope, $ionicPopup, webStorage, $ionicLoading) {
        $ionicLoading.show();
        $ionicSideMenuDelegate.canDragContent(true);
        var backendUrl = backendUrl.url();
        $scope.cart = webStorage.get('cart');
        $scope.lineItems = [];
        angular.forEach($scope.cart, function (element, index) {
            $scope.lineItems[index] = element;
        });
        $ionicLoading.hide();

        $scope.removeLineItem = function (id) {
            $ionicLoading.show();
            // Remove from view
            var indexTwo = $scope.lineItems.indexOf(id);
            $scope.lineItems.splice(indexTwo, 1);

            webStorage.set('cart', $scope.lineItems);
            $ionicLoading.hide();
        }

        $scope.addQuantity = function (id) {
            $ionicLoading.show();
            $scope.lineItems[id].quantity = parseInt($scope.lineItems[id].quantity) + 1;
            webStorage.set('cart', $scope.lineItems);
            $ionicLoading.hide();
            angular.forEach($scope.lineItems, function (element, index) {
                total += Number(($scope.lineItems[index].price) * ($scope.lineItems[index].quantity));
            });

        }

        $scope.removeQuantity = function (id) {
            $ionicLoading.show();
            $scope.lineItems[id].quantity = $scope.lineItems[id].quantity - 1;
            webStorage.set('cart', $scope.lineItems);
            $ionicLoading.hide();
            angular.forEach($scope.lineItems, function (element, index) {
                total += Number(($scope.lineItems[index].price) * ($scope.lineItems[index].quantity));
            });
        }

        $scope.orderTotal = function () {
            var total = 0;
            angular.forEach($scope.lineItems, function (element, index) {
                total += (Number(($scope.lineItems[index].price) * ($scope.lineItems[index].quantity)));
            });
            webStorage.set('order', total);
            return total;
        }
    });