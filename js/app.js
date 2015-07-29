var app = angular.module('WebApp', ['ngMaterial', 'ngMessages', 'ngAnimate', 'ngRoute']);

app.config(['$mdIconProvider', function($mdIconProvider) {
  $mdIconProvider
    .iconSet('action',     './img/icons/action-icons.svg', 24)
    .iconSet('content',    './img/icons/content-icons.svg', 24)
    .iconSet('navigation', './img/icons/navigation-icons.svg', 24)
    .iconSet('mdi',        './img/icons/mdi-icons.svg', 24)
    .iconSet('image',      '/img/icons/image-icons.svg', 24);
    // .iconSet('alert',         '/img/icons/alert-icons.svg', 24)
    // .iconSet('av',            '/img/icons/av-icons.svg', 24)
    // .iconSet('communication', '/img/icons/communication-icons.svg', 24)
    // .iconSet('device',        '/img/icons/device-icons.svg', 24)
    // .iconSet('editor',        '/img/icons/editor-icons.svg', 24)
    // .iconSet('file',          '/img/icons/file-icons.svg', 24)
    // .iconSet('hardware',      '/img/icons/hardware-icons.svg', 24)
    // .iconSet('icons',         '/img/icons/icons-icons.svg', 24)
    // .iconSet('maps',          '/img/icons/maps-icons.svg', 24)
    // .iconSet('notification',  '/img/icons/notification-icons.svg', 24)
    // .iconSet('social',        '/img/icons/social-icons.svg', 24)
    // .iconSet('toggle',        '/img/icons/toggle-icons.svg', 24)
}]);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/', {
      title: 'Accueil',
      templateUrl: 'views/home.html'
    }).
    when('/list', {
      title: 'Analyses',
      templateUrl: 'views/list.html',
      controller: 'ListCtrl'
    }).
    when('/analysis/:id', {
      title: 'Analyse',
      templateUrl: 'views/analysis.html',
      controller: 'AnalysisCtrl'
    });
}]);
