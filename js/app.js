var app = angular.module('WebApp', ['ngMaterial', 'ngMessages', 'ngAnimate']);

app.config(['$mdIconProvider', function($mdIconProvider) {
  $mdIconProvider
    .iconSet('action',     '/img/icons/action-icons.svg', 24)
    .iconSet('content',    '/img/icons/content-icons.svg', 24)
    .iconSet('navigation', '/img/icons/navigation-icons.svg', 24)
    .iconSet('mdi',        '/img/icons/mdi-icons.svg', 24);
    // .iconSet('alert',         '/img/icons/alert-icons.svg', 24)
    // .iconSet('av',            '/img/icons/av-icons.svg', 24)
    // .iconSet('communication', '/img/icons/communication-icons.svg', 24)
    // .iconSet('device',        '/img/icons/device-icons.svg', 24)
    // .iconSet('editor',        '/img/icons/editor-icons.svg', 24)
    // .iconSet('file',          '/img/icons/file-icons.svg', 24)
    // .iconSet('hardware',      '/img/icons/hardware-icons.svg', 24)
    // .iconSet('icons',         '/img/icons/icons-icons.svg', 24)
    // .iconSet('image',         '/img/icons/image-icons.svg', 24)
    // .iconSet('maps',          '/img/icons/maps-icons.svg', 24)
    // .iconSet('notification',  '/img/icons/notification-icons.svg', 24)
    // .iconSet('social',        '/img/icons/social-icons.svg', 24)
    // .iconSet('toggle',        '/img/icons/toggle-icons.svg', 24)
}]);

app.controller('AppCtrl', ['$scope', '$mdSidenav', '$mdDialog', '$mdToast', '$mdBottomSheet', function($scope, $mdSidenav, $mdDialog, $mdToast, $mdBottomSheet){
  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };

  $scope.loadingPlatforms = true;

  getTrelloPlatformsList(function displayPlatformsTable(err, platforms) {
    $scope.loadingPlatforms = false;
    if (err) { return $scope.errPlatforms = true; }

    $scope.platforms = platforms;
    $scope.$apply();
  });

  $scope.showGridBottomSheet = function($event, platform) {
    $mdBottomSheet.show({
      templateUrl: '/views/actions.html',
      targetEvent: $event,
      controller: function($scope, $mdBottomSheet) {
        $scope.platform = platform;
        $scope.validate = function(ev) {
          $mdToast.show({
            template: '<md-toast>' +
                        '<span flex>Analyse validée</span>' +
                      '</md-toast>',
            hideDelay: 3000,
            position: 'top right'
          });
        };
        $scope.listItemClick = function($index) {
          $mdBottomSheet.hide();
        };
      }
    });
  };


  $scope.showAdd = function(ev) {
    $mdDialog.show({
      controller: function DialogController($scope, $mdDialog) {
        $scope.hide   = function() { $mdDialog.hide(); };
        $scope.cancel = function() { $mdDialog.cancel(); };
        $scope.save   = function() {
          $mdDialog.hide();

          $mdToast.show({
            template: '<md-toast>' +
                        '<span flex>Platforme sauvegardée</span>' +
                      '</md-toast>',
            hideDelay: 3000,
            position: 'top right'
          });
        };
      },
      templateUrl: '/views/form-add.html',
      targetEvent: ev
    });
  };
}]);
