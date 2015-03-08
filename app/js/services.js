// 'use strict';

/* App Module */

var shoppingApp = angular.module('shoppingApp', [
  'ngRoute','ngMap','ngGPlaces','LocalStorageModule','toaster','ui.bootstrap','ngResource','autocomplete',
  'ui-rangeSlider','angular.filter','shoopingControllers'
]);


shoppingApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/login', {
        templateUrl: 'app/template/login.html',
        controller: 'LoginCtrl',
        access: "false"
      }).
      when('/home', {
        templateUrl: 'app/template/home.html',
        controller: 'HomeCtrl',
        access: "false"
      }).
      when('/mobiles', {
        templateUrl: 'app/template/mobiles.html',
        controller: 'MobileCtrl',
        access: "true"
      }).
      when('/locator',{
        templateUrl: 'app/template/locator.html',
        controller: 'locatorCntrl',
        access: "true"
      }).      
      otherwise({
        redirectTo: '/login'
      });
  }])
  .run( function($rootScope, AuthService,$location,$route,$interval,localStorageService,toaster) {
    $rootScope.$on('$routeChangeStart', function (event,current) {
      // Autenticate  and authorize page for the user
      if(current.$$route && current.$$route.access=="false"){
        if (AuthService.isAuthenticated()) {
          $location.path('/home')
      }else{
          $location.path('/login')
      }
    }
    else{
      //expire the localstorage value after 30 minutes
      $interval(function(){
        localStorageService.remove("shoppingCarts")
        $rootScope.carts                 = localStorageService.get("shoppingCarts")
        window.location.reload();
        toaster.pop('warning', "Your current session is over!. Please add the cart again.")
      }, 1800000);
    }
  });
});

shoppingApp.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('shoopingControllers')
    .setStorageType('sessionStorage')
});

// shoppingApp.config(function(ngGPlacesAPIProvider){
//   ngGPlacesAPIProvider.setDefaults({
//     radius:500,
//     latitude: true,
//     longitude: true,
//   });
// });