angular.module('WebApp', ['ngMaterial', 'ngMessages', 'ngAnimate', 'ngRoute'])
.config(['$mdThemingProvider', function($mdThemingProvider) {
  $mdThemingProvider.definePalette('crimsonRed', $mdThemingProvider.extendPalette('red', {
    '500': 'ED143D'
  }));

  $mdThemingProvider.theme('default')
  .primaryPalette('crimsonRed')
  .accentPalette('blue')
  .warnPalette('orange');
}])
.config(['$mdIconProvider', function($mdIconProvider) {
  $mdIconProvider
    .iconSet('action',        '/img/icons/action-icons.svg', 24)
    .iconSet('content',       '/img/icons/content-icons.svg', 24)
    .iconSet('navigation',    '/img/icons/navigation-icons.svg', 24)
    .iconSet('mdi',           '/img/icons/mdi-icons.svg', 24)
    .iconSet('communication', '/img/icons/communication-icons.svg', 24)
    .iconSet('image',         '/img/icons/image-icons.svg', 24);
    // .iconSet('alert',         '/img/icons/alert-icons.svg', 24)
    // .iconSet('av',            '/img/icons/av-icons.svg', 24)
    // .iconSet('device',        '/img/icons/device-icons.svg', 24)
    // .iconSet('editor',        '/img/icons/editor-icons.svg', 24)
    // .iconSet('file',          '/img/icons/file-icons.svg', 24)
    // .iconSet('hardware',      '/img/icons/hardware-icons.svg', 24)
    // .iconSet('icons',         '/img/icons/icons-icons.svg', 24)
    // .iconSet('maps',          '/img/icons/maps-icons.svg', 24)
    // .iconSet('notification',  '/img/icons/notification-icons.svg', 24)
    // .iconSet('social',        '/img/icons/social-icons.svg', 24)
    // .iconSet('toggle',        '/img/icons/toggle-icons.svg', 24)
}])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);

  $routeProvider.
    when('/list', {
      title: 'Plateformes',
      templateUrl: '/partials/list',
      controller: 'ListCtrl'
    }).
    when('/platforms/:id', {
      title: 'Plateformes',
      templateUrl: '/partials/platform',
      controller: 'PlatformCtrl'
    });
}])
.run(['$rootScope', 'Session', 'AuthService', 'platforms', function ($rootScope, Session, AuthService, platforms) {
  $rootScope.session   = Session;
  $rootScope.auth      = AuthService;
  $rootScope.platforms = platforms;
}]);
