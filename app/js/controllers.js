

/* Controllers */

/* Main controllers*/
var shopingControllers = angular.module('shoopingControllers', []);

/* Application controller*/
shopingControllers.controller('ApplicationCntrl', ['$scope','$location','Session','toaster','$rootScope',
 'Items','localStorageService',  function($scope,$location,Session,toaster,$rootScope,Items,localStorageService) {
  
  $rootScope.carts                 = localStorageService.get("shoppingCarts")
  if($rootScope.carts){
    $scope.cartsGroup             =  Items.get_uniq_by($rootScope.carts, 'Sno');
  }
  toaster.clear();
  $scope.exit                     = function(){
    Session.destroy();
    $rootScope.current_user       = null
    $location.path("/login")
    toaster.pop('success', "You have been successfully logged out!")
  }
}]);

/* Login controller*/
shopingControllers.controller('LoginCtrl', ['$scope', '$resource','$rootScope','$location',
  'Session','toaster', function($scope, $resource,$rootScope,$location,Session,toaster) {
  
  $scope.credentials              = { username: '',password: ''};
  
  $scope.login                    = function(credentials){
    var result                    = false;
    $resource('app/template/user.json').get(function(response){
     for(var i=0;i<response.data.length;i++){
       if (response && response.data[i].username==credentials["username"]
          && response.data[i].password==credentials["password"]){
          Session.create(response.data[i].user_id, response.data[i].username)
          $rootScope.current_user = response.data[i].username
          result                  = true
        } 
      }
      if(result==true){ 
       $location.path("/home")
       toaster.pop('success', "Welcome "+ credentials["username"] +"!  You have been successfully logged in!")
      }else{
        toaster.pop('error',"Invalid Username/Password");} 
    }, function () {
      toaster.pop('warning', "No users present in Js");
    });
  };
}]);

/* Home controller*/
shopingControllers.controller('HomeCtrl', ['$scope',function($scope) {}]);


/* Mobile controller*/
shopingControllers.controller('MobileCtrl', ['$scope', 'filterFilter','mobilesFactory','getBound',
  'Mobile','Items',function ($scope, filterFilter,mobilesFactory,getBound,Mobile,Items) {
  
  $scope.entryLimit               = 5
  $scope.currentPage              = 1;
  $scope.useBrands                = {};
  $scope.myInterval               = 2000;
  mobilesFactory.query().$promise.then(function (mobiles) {
    $scope.useName                = {}
    $scope.mobiles                = mobiles
    $scope.brandsGroup            = Items.get_uniq_by($scope.mobiles, 'Brand');
    $scope.namesGroup             =  Items.get_uniq_by($scope.mobiles, 'Name');
    $scope.updatePagination(mobiles)
    $scope.maxPrice               = getBound.maxValue(mobiles);
    $scope.minPrice               = getBound.minValue(mobiles);
    $scope.usePrice               = {lower_bound:$scope.minPrice,
                                   upper_bound: $scope.maxPrice
  };

  $scope.$watch(function () {
    return {
        useBrands: $scope.useBrands,
        usePrice: $scope.usePrice, 
        useName:   $scope.useName
      }
    }, function (value) {

            
      // Search with brand Starts ...............//
      var filterAfterBrands       = []
      var selected;
      selected                    = false;
      for (var j in $scope.mobiles) {
        var item                  = $scope.mobiles[j];
        for (var i in $scope.useBrands) {
          $("#display_slider").hide();
          if ($scope.useBrands[i]) {
            selected              = true
            if(i==item.Brand){
              filterAfterBrands.push(item);
              break;
            }
          }
        }
      }
      if (!selected) {
        filterAfterBrands         = $scope.mobiles;
      }

      // Search with Price Starts ...............//
      var filterAfterPrices       = []
      selected                    = false;
      for (var j in filterAfterBrands) {
        if($scope.usePrice.lower_bound!=$scope.minPrice || 
          $scope.usePrice.upper_bound!=$scope.maxPrice){
           $("#display_slider").hide();
        }
        var item                  = filterAfterBrands[j];
        var final_price           = $scope.current_price(item)
        if (final_price) {

          selected                = true
          if(parseInt(final_price) >= $scope.usePrice.lower_bound 
           && parseInt(final_price) <= $scope.usePrice.upper_bound){
         
            filterAfterPrices.push(item);
          }
        }          
      }
      if (!selected) {
        filterAfterPrices         = filterAfterBrands;
      }
      var filterAfterNames        = []
      if($scope.useName){
        if(Object.keys($scope.useName).length > 0){
          $("#display_slider").hide();
        }
        filterAfterNames          = filterFilter(filterAfterPrices, $scope.useName)
      }
      $scope.updatePagination(filterAfterNames)
      $scope.filteredMobiles      = filterAfterNames;
      $scope.namesGroup           =  Items.get_uniq_by($scope.filteredMobiles, 'Name');
    }, true);
  }); 

 // clear all the scope values for reseting the filters
  $scope.resetFilters             = function(){
    $("#display_slider").hide()
    $scope.useBrands              = {};
    $scope.usePrice               = {lower_bound:$scope.minPrice,
                                    upper_bound: $scope.maxPrice };   
    $scope.useName                = {};
  }
  
  // Current discounted price ///
  $scope.current_price            = function (args) {
    return Mobile.discount_price(args)
  }

  // Update the No of pages and item at every search
  $scope.updatePagination         = function (mobiles) {
    $scope.totalItems             = mobiles.length;
    $scope.noOfPages              = Math.ceil($scope.totalItems / $scope.entryLimit);
  }
  
  // Current discounted price ///
  $scope.count                    = function (brand) {
    return filterFilter($scope.mobiles, {Brand: brand}).length
  }

  $($scope.totalItems)
}]);

// Cart Controllers
shopingControllers.controller('cartCntrl', ['$scope','localStorageService','$rootScope',
 'Mobile', function($scope,localStorageService,$rootScope,Mobile) {
  
  var carts                     = localStorageService.get("shoppingCarts")
  $scope.quantity               =  1;

  // To find the current price with discounted amount
  $scope.current_price          = function (args) {
    return Mobile.discount_price(args)
  }
    
  //  Sum of all the cart prices
  $scope.total                  = function(){
    var total                   = 0
    angular.forEach($rootScope.carts, function ( cart ) {
      total                     = total + (cart.discounted_price * (
                                             cart.quantity ?  cart.quantity : 1))
    });
    return total
  }

  $scope.addQty                 = function(cart,quantity){
    cart.quantity               = quantity
  }

  // removing the cart from the carts
  $scope.removeCart             = function(index,cart){
    carts.splice(index, 1)
    localStorageService.set("shoppingCarts",carts)
    $rootScope.carts.splice(index, 1)
  }

  // Redirects the mobile page 
  $scope.goMobiles              = function(){
    window.location.reload();
  } 
}]);

shopingControllers.controller('locatorCntrl', function($scope,ngGPlacesAPI) {



//  // $scope.location = {center: {latitude: 12.9171427, longitude: 80.19234890000007 }, zoom: 14 };
//   var autocomplete = new google.maps.places.Autocomplete($("#google_places_ac")[0], {}); 
//   google.maps.event.addListener(autocomplete, 'place_changed', function() {
//         var place = autocomplete.getPlace();
//         $scope.location = {center: {latitude: place.geometry.location.lat(), 
//           longitude: place.geometry.location.lng() }, zoom: 14 }
//         $scope.$apply();
//     });      

//         $scope.options = {scrollwheel: false};
// // $scope.places = ngGPlacesAPI.nearbySearch({latitude:12.914130900, longitude:80.193085900000030000
// // }).then(
// //     function(data){
// //       console.log(data)
// //       return data;
// //     });

});
