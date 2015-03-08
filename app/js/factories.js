/* Managing the session*/
shoppingApp.service('Session', function () {
  this.create                = function ( userId, userName) {
    this.userId              = userId;
    this.userName            = userName;
  };
  this.destroy               = function () {
    this.userId              = null;
    this.userName            = null;
  };
  return this;
})


/* Autenticate User*/
shoppingApp.factory('AuthService', function($http,Session) {
  var authService               = {}; 
    authService.isAuthenticated = function () {
    return !!Session.userId;
  };
  return authService
});


// get all values from the mobiles.json file
shoppingApp.factory('mobilesFactory', function($resource) {  // return $resource('app/template/user.json');
  return $resource('app/template/mobiles.json', {}, {'query': 
            {method: 'GET', isArray: true}}); 
});


/*Discounted Price
    - It is used to find discounted price from price of the mobile and its discount.
    - mobile["Price"]-(mobile["Price"] * (mobile["Discount"]/100) - Formula to find discounted price */
shoppingApp.factory('Mobile', function () {
  var mobile                 = {};

  mobile.discount_price      = function (mobile) {
    if(mobile["Discount"]){
       return (mobile["Price"]-(mobile["Price"] * (mobile["Discount"]/100)))
    }else{ return mobile["Price"]}
  };

  return mobile
});


// Common method is used to return related uniq items based on attributes
shoppingApp.factory('Items', function() {
  var items                    = {}; 
  items.get_uniq_by            = function (data,key) {
    var result                 = [];    
    for (var i = 0; i < data.length; i++) {
      var value                = data[i][key];
 
      if (result.indexOf(value)== -1) {
        result.push(value);
      }
    }
    return result;
  };
  return items
});


// The below function is used to find the max and min value of the mobiles
shoppingApp.factory('getBound', function(Mobile) {  
  var resource              = {}; 
  resource.maxValue         = function (mobiles) {
    var max;
    for (var i=0 ; i<mobiles.length ; i++) {
      if (!max || parseInt(Mobile.discount_price(mobiles[i])) > parseInt(max))
        max                 = Mobile.discount_price(mobiles[i]);
      }
    return max
  };

  resource.minValue         = function (mobiles) {
    var min;
    for (var i=0 ; i<mobiles.length ; i++) {
      if (!min || parseInt(Mobile.discount_price(mobiles[i])) < parseInt(min))
        min                = Mobile.discount_price(mobiles[i]);
      }
    return min
  };  
  return resource
});


/*  Add cart
    - This method will invoke when hitting add Cart button in the mobile page
    - It will store the values into localstorage*/
shoppingApp.factory('Cart', function (localStorageService,Mobile) {
  
  var cart                    = {};
  var array                   = []
  cart.add                    = function (mobile) {
    if (localStorageService.get('shoppingCarts') === null) {    
      localStorageService.set('shoppingCarts', []);
    }
    mobile.discounted_price   = Mobile.discount_price( mobile)

    if(localStorageService.get('shoppingCarts')){
      array                   = localStorageService.get('shoppingCarts')
    }

    array.push(mobile);
    localStorageService.set('shoppingCarts', array);
    return array
  };
  return cart
});






