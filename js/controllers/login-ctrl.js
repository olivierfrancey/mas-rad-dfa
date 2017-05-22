app.controller('LoginCtrl', ['$http', 'AuthService', '$state', 'WEBSERVICE', 
  function($http, AuthService, $state, WEBSERVICE) {

  var login = this;
  login.user = {};

  login.connect = function() {
    delete login.error;
    login.loadIcon = true;
    $http({
        method: 'POST',
        url: WEBSERVICE.apiUrl + 'auth',
        data: login.user
    }).then(function(res) {
        login.loadIcon = false;
        //console.log(res.data);
        AuthService.setToken(res.data.token);
        AuthService.setUserId(res.data.user.id);
        $state.go('home');  
    }).catch(function(error) {
      login.error = "Unable to log you.";
      console.log(error);
    });
  }

  login.cancel = function() {
    login.user = {};
    login.loadIcon = false;
  }
}]);