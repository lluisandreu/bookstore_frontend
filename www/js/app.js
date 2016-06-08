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

app.factory('getQuantity', function () {
    return {
        getQuantity: function (items) {
            var quantity = 0;
            angular.forEach(items, function (element, index) {
                quantity += parseInt(element.quantity);
            });
            return quantity;
        }
    }
});

app.filter('getById', function () {
    return function (input, id) {
        var i = 0,
            len = input.length;
        for (; i < len; i++) {
            if (+input[i].id == +id) {
                return i;
            }
        }
        return null;
    }
});

app.controller('MainCtrl', function ($scope, webStorage, $ionicSideMenuDelegate, $ionicLoading, getQuantity) {
    $ionicLoading.show();
    $scope.user = webStorage.get('username');
    var cart = webStorage.get('cart');
    if (cart) {
        $scope.orderTotal = cart.total;
        $scope.quantity = getQuantity.getQuantity(cart.lineItems);
    } else {
        $scope.orderTotal = 0;
    }

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
                                cart = {
                                    user: data.user
                                };
                                cart.lineItems = [];
                                cart.total = 0;
                                webStorage.set('cart', cart);
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

    function ($ionicSideMenuDelegate, $stateParams, $http, $scope, webStorage, backendUrl, $ionicLoading, $ionicPopup, $filter, $state, getQuantity) {
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
            var found = $filter('getById')(order.lineItems, id);

            if (found != null) {
                order.lineItems[found].quantity = parseInt(order.lineItems[found].quantity) + parseInt(lineItem.quantity);
            } else {
                order.lineItems.push(lineItem);
            }
            console.log(order);
            var total = 0;
            angular.forEach(order.lineItems, function (element, index) {
                total += (Number((order.lineItems[index].price) * (order.lineItems[index].quantity)));
            });
            order.total = total;

            $scope.quantity = getQuantity.getQuantity(order.lineItems);
            webStorage.set('cart', order);
            $ionicLoading.hide();
        }

        $scope.cartAlert = function (lineItem) {
            var alertPopup = $ionicPopup.alert({
                title: lineItem.title + ' was added to the cart!',
                buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                    text: 'Go to checkout',
                    type: 'button-balanced',
                    onTap: function (e) {
                        $state.go('order');
                        alertPopup.close();
                        e.preventDefault();
                    }
                }, {
                    text: 'OK',
                    type: 'button-positive',
                    onTap: function (e) {
                        // Returning a value will cause the promise to resolve with the given value.
                        alertPopup.close();
                    }
                }]
            });
        };
    }
);

app.controller('OrderCtrl',

    function (backendUrl, $ionicSideMenuDelegate, $stateParams, $http, $scope, $ionicPopup, webStorage, $ionicLoading, getQuantity) {
        $ionicLoading.show();
        $ionicSideMenuDelegate.canDragContent(true);
        var backendUrl = backendUrl.url();
        var total = 0;
        $scope.cart = webStorage.get('cart');
        $scope.lineItems = [];

        angular.forEach($scope.cart.lineItems, function (element, index) {
            $scope.lineItems[index] = element;
        });
        $scope.quantity = getQuantity.getQuantity($scope.lineItems);
        $ionicLoading.hide();

        $scope.removeLineItem = function (id) {
            $ionicLoading.show();
            // Remove from view
            var findView = $scope.lineItems.indexOf(id);
            $scope.lineItems.splice(findView, 1);

            var findStorage = $scope.cart.lineItems.indexOf(id);
            $scope.cart.lineItems.splice(findStorage, 1);

            angular.forEach($scope.lineItems, function (element, index) {
                total += Number(($scope.lineItems[index].price) * ($scope.lineItems[index].quantity));
            });
            $scope.cart.total = total;
            webStorage.set('cart', $scope.cart);
            $scope.quantity = getQuantity.getQuantity($scope.lineItems);
            $ionicLoading.hide();
        }

        $scope.addQuantity = function (id) {
            $ionicLoading.show();
            $scope.lineItems[id].quantity = parseInt($scope.lineItems[id].quantity) + 1;
            $ionicLoading.hide();
            angular.forEach($scope.lineItems, function (element, index) {
                total += Number(($scope.lineItems[index].price) * ($scope.lineItems[index].quantity));
            });
            $scope.cart.lineItems[id].quantity = $scope.lineItems[id].quantity;
            $scope.cart.total = total;
            $scope.quantity = getQuantity.getQuantity($scope.lineItems);
            webStorage.set('cart', $scope.cart);

        }

        $scope.removeQuantity = function (id) {
            $ionicLoading.show();
            $scope.lineItems[id].quantity = $scope.lineItems[id].quantity - 1;
            $ionicLoading.hide();
            angular.forEach($scope.lineItems, function (element, index) {
                total += Number(($scope.lineItems[index].price) * ($scope.lineItems[index].quantity));
            });
            $scope.cart.lineItems[id].quantity = $scope.lineItems[id].quantity;
            $scope.cart.total = total;
            $scope.quantity = getQuantity.getQuantity($scope.lineItems);
            webStorage.set('cart', $scope.cart);
        }

        $scope.orderTotal = function () {
            var total = 0;
            angular.forEach($scope.lineItems, function (element, index) {
                total += (Number(($scope.lineItems[index].price) * ($scope.lineItems[index].quantity)));
            });
            $scope.cart.total = total;
            webStorage.set('cart', $scope.cart);
            return total;
        }
    });