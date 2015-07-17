angular.module('WebApp')
.controller('AppCtrl', [
  '$scope',
  '$mdSidenav',
  '$location',
  '$rootScope',
  '$route',
  function($scope, $mdSidenav, $location, $rootScope, $route) {
  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };

  $rootScope.$on('$routeChangeSuccess', function() {
    $rootScope.title = $route.current.title;
  });

  $scope.goto = function(path) {
    $location.path(path || '/');
    $mdSidenav('left').close();
  };
}])
.controller('AnalysisCtrl', ['$scope', '$mdToast', '$routeParams', '$mdBottomSheet', 'platforms', 'ezAlert', function($scope, $mdToast, $routeParams, $mdBottomSheet, platforms, ezAlert) {
  $scope.loading = true;
  var cardID = $routeParams.id;

  platforms.get().then(function (list) {
    for (var i = list.length - 1; i >= 0; i--) {
      if (list[i].card.id == cardID) { $scope.platform = list[i]; return; }
    };

    return ezAlert({
      title: "Introuvable",
      content: "La plateforme d'identifiant " + cardID + " n'existe pas.",
      ariaLabel: "Erreur plateforme introuvable"
    });
  }).finally(function () {
    $scope.loading = false;
  });;
  // $scope.showGridBottomSheet = function($event, platform) {
  //   $mdBottomSheet.show({
  //     templateUrl: './views/actions.html',
  //     targetEvent: $event,
  //     controller: function($scope, $mdBottomSheet) {
  //       $scope.platform = platform;
  //       $scope.validate = function(ev) {
  //         $mdToast.show({
  //           template: '<md-toast>' +
  //                       '<span flex>Analyse validée</span>' +
  //                     '</md-toast>',
  //           hideDelay: 3000,
  //           position: 'top right'
  //         });
  //       };
  //       $scope.listItemClick = function($index) {
  //         $mdBottomSheet.hide();
  //       };
  //     }
  //   });
  // };
}])
.controller('ListCtrl', ['$scope', '$mdDialog', '$mdToast', '$mdBottomSheet', 'platforms', function($scope, $mdDialog, $mdToast, $mdBottomSheet, platforms) {
  $scope.platforms = platforms;
  $scope.groupby   = 'letter';

  $scope.buildList = function () {
    if (!platforms.list) { return $scope.list = null; }

    var groups  = {};
    $scope.list = [];

    platforms.list.forEach(function (el) {
      var group = '#';

      switch ($scope.groupby) {
      case 'letter':
        if (typeof el.platformName === 'string' && /^[a-z]/i.test(el.platformName)) {
          group = el.platformName.charAt(0).toUpperCase();
        }
        break;
      case 'status':
        if (typeof el.platformStatus === 'string') {
          group = el.platformStatus;
        }
        break;
      }

      if (!groups[group]) {
        $scope.list.push({ name: group, list: groups[group] = [] });
      }
      groups[group].push(el);
    });
  };

  function getPlatforms() {
    $scope.loading = true;

    platforms.get().then(function () {
      $scope.buildList();
    }).finally(function () {
      $scope.loading = false;
    });
  }

  getPlatforms();

  $scope.reload = function () {
    platforms.reload();
    getPlatforms();
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
      templateUrl: './views/form-add.html',
      targetEvent: ev
    });
  };
}]);