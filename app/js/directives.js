
// Show the rating of the mobiles
shoppingApp.directive('starRating', function () {
  return {
    restrict: 'A',
    template: '<ul class="rating">' +
        '<li ng-repeat="star in stars" ng-class="star">' +
        '\u2605' +
        '</li>' +
        '</ul>',
    scope: {
        ratingValue: '=',
        max: '='
    },
    link: function (scope, elem, attrs) {
      scope.stars = [];
      for (var i = 0; i < scope.max; i++) {
        scope.stars.push({
            filled: i < scope.ratingValue
        });
      }
    }
  }
});

// dynamicaly enable/disable the cart button based on localstorage and scope
shoppingApp.directive('addCartButton', function ($rootScope,localStorageService,Cart,toaster) {
  return {
    restrict: 'E',
    transclude: false,
    replace: true,
    template:  '<button class="button info add-cart-btn" ng-class="{disabled_btn : diablebyDefault ? diablebyDefault : mobile.isDisabled}" id="mobile_{{mobile.Sno}}">Add to cart <span>The Product is already added in cart</span></button>',
    scope: {
      mobile: "=",
      diablebyDefault: "="
    },
    link: function(scope,elem,attrs){
      elem.click(function() {
        $("#display_slider").hide();
        if(!scope.mobile.isDisabled && !scope.diablebyDefault){
          Cart.add(scope.mobile)
          toaster.pop('success', "The Product has been added successfuly");
          $rootScope.carts = localStorageService.get('shoppingCarts')
          scope.mobile.isDisabled = true; 
        }else{
          toaster.pop('warning', "The Product is already added in cart");
        }
      });
    }
  }
});
 
// Activate the current link which is present in the app
shoppingApp.directive('activeLink', ['$location', function(location) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs, controller) {
      var clazz      = attrs.activeLink;
      var path       = attrs.href;
      path           = path.substring(1); //hack because path does not return including hashbang
      scope.location = location;
      scope.$watch('location.path()', function(newPath) {
        // alert(newPath)
        if (path === newPath) {
          element.addClass(clazz);
        } else {
          element.removeClass(clazz);
        }
      });
    }
  };
}]);

// shoppingApp.directive('googlePlaces', function(){
// return {
//     restrict:'E',
//     replace:true,
//     // transclude:true,
//     scope: {location:'='},
//     template: '<input id="google_places_ac" name="google_places_ac" type="text" class="input-block-level"/>',
//     link: function($scope, elm, attrs){
//         var autocomplete = new google.maps.places.Autocomplete($("#google_places_ac")[0], {});
//         google.maps.event.addListener(autocomplete, 'place_changed', function() {
//             var place = autocomplete.getPlace();
//             $scope.location = {center: {latitude: place.geometry.location.lat(), 
//               longitude: place.geometry.location.lng() }, zoom: 14 }
//             $scope.$apply();
//         });
//     }
// }
// });
