
var app = angular.module('app', [
    'ui.router', 
    'ui.bootstrap',                     // https://angular-ui.github.io/bootstrap/
    'angular-storage',
    'leaflet-directive',                // https://github.com/tombatossals/angular-leaflet-directive
    'ngAnimate',                        // https://github.com/Augus/ngAnimate
    '720kb.tooltips',                   // https://github.com/720kb/angular-tooltips
    //'thatisuday.dropzone'               // https://github.com/thatisuday/ng-dropzone
]);

app.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
    
    $stateProvider.state('home', {
        url: '',
        templateUrl: './templates/main.html'
    });

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: './templates/login.html',
        controller: 'LoginCtrl as l'
    });

    $stateProvider.state('newuser', {
        url: '/newuser',
        templateUrl: './templates/new-user.html',
        controller: 'SigninCtrl as s'
    });

    $urlRouterProvider.otherwise(function($injector) {
        $injector.get('$state').go('home');
    });

    $httpProvider.interceptors.push('AuthInterceptor');

});


app.run(['AuthService', '$rootScope', '$state', function(AuthService, $rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function(event, toState) {
        if (!AuthService.token && toState.name !== 'login' && toState.name !== 'newuser') {
            event.preventDefault();
            console.log("redirect to login page");
            $state.go('login');
        }
    });
}]);
