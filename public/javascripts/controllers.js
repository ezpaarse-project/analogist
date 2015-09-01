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

  $scope.auth.checkSession();

  $rootScope.$on('$routeChangeSuccess', function() {
    $scope.title = $route.current.title;
    $scope.subtitle = null;
  });

  $scope.setSubtitle = function (str) {
    $scope.subtitle = str;
  };

  $scope.goto = function(path) {
    $location.path(path || '/');
    $mdSidenav('left').close();
  };
}])
.controller('PlatformCtrl', [
  '$scope',
  'analysesFactory',
  '$mdToast',
  '$routeParams',
  'platforms',
  'ezAlert',
  function($scope, analysesFactory, $mdToast, $routeParams, platforms, ezAlert) {

  $scope.loading = true;
  var cardID = $scope.cardID = $routeParams.id;

  $scope.nbViews = 1;

  $scope.range = function (n) {
    var arr = [];
    for (var i = 0; i < n; i++) { arr.push(i); };
    return arr;
  };

  $scope.addView = function () {
    $scope.nbViews++;
  };
  $scope.removeView = function () {
    if ($scope.nbViews > 1) { $scope.nbViews--; }
  };

  platforms.get().then(function (list) {
    for (var i = list.length - 1; i >= 0; i--) {
      if (list[i].card.id == cardID) { $scope.platform = list[i]; break; }
    };

    if (!$scope.platform) {
      $scope.loading = false;

      return ezAlert({
        title: "Introuvable",
        content: "La plateforme d'identifiant " + cardID + " n'existe pas.",
        ariaLabel: "Erreur plateforme introuvable"
      });
    }

    $scope.setSubtitle($scope.platform.name);

    analysesFactory.get($scope.platform.card.id)
    .then(function success(analyses) {
      $scope.loading  = false;
      $scope.analyses = analyses;

    }, function fail(response) {
      $scope.loading  = false;
      $scope.analyses = [];

      if (response.status == 404) { return; }

      ezAlert({
        title: "Erreur",
        content: "Une erreur est survenue pendant la récupération des analyses",
        ariaLabel: "Erreur récupération des analyses"
      });
    });
  });
}])
.controller('AnalyzerCtrl', [
  '$scope',
  '$mdToast',
  '$http',
  'ezAlert',
  'analysesFactory',
  function($scope, $mdToast, $http, ezAlert, analysesFactory) {
  $scope.index = -1;

  $http.get('https://raw.githubusercontent.com/ezpaarse-project/ezpaarse-platforms/master/rtype.json').then(function (response) {
    if (angular.isArray(response.data)) { $scope.resourceTypes = response.data; }
  });
  $http.get('https://raw.githubusercontent.com/ezpaarse-project/ezpaarse-platforms/master/mime.json').then(function (response) {
    if (angular.isArray(response.data)) { $scope.mimeTypes = response.data; }
  });

  function getAnalysis(id) {
    if (!angular.isArray($scope.analyses)) { return null; }

    for (var i = $scope.analyses.length - 1; i >= 0; i--) {
      if ($scope.analyses[i].id == id) { return $scope.analyses[i]; }
    };
  }

  function removeAnalysis(id) {
    if (!angular.isArray($scope.analyses)) { return; }

    for (var i = $scope.analyses.length - 1; i >= 0; i--) {
      if ($scope.analyses[i].id == id) {
        $scope.analyses.splice(i, 1);
        if ($scope.index >= $scope.analyses.length) {
          $scope.index = $scope.analyses.length - 1;
        }
        return;
      }
    };
  }

  $scope.addParam = function (analysis, type) {
    var field = (type || '') + 'Params';
    if (!analysis) { return; }
    if (type != 'query' && type != 'path') { return; }

    if (!angular.isArray(analysis[field])) { analysis[field] = []; }
    analysis[field].push({});
    analysis.setDirty(true);
  };
  $scope.removeParam = function (analysis, type, i) {
    var field = (type || '') + 'Params';
    if (!analysis) { return; }
    if (type != 'query' && type != 'path') { return; }
    if (!angular.isArray(analysis[field])) { return; }

    analysis[field].splice(i, 1);
    analysis.setDirty(true);
  };

  $scope.remove = function (analysis) {
    if (!analysis || analysis.isLoading()) { return; }

    analysis.remove()
    .then(function success() {
      removeAnalysis(analysis.id);

      $mdToast.show({
        template: '<md-toast><span flex>Analyse supprimée</span></md-toast>',
        hideDelay: 2000,
        position: 'top right'
      });
    }, function fail() {
      ezAlert({
        title: "Erreur",
        content: "Une erreur est survenue pendant la suppression",
        ariaLabel: "Erreur suppression de l'analyse"
      });
    });
  };

  $scope.save = function (analysis) {
    if (!analysis || analysis.isLoading()) { return; }

    analysis.save()
    .then(function success() {
      $mdToast.show({
        template: '<md-toast><span flex>Analyse sauvegardée</span></md-toast>',
        hideDelay: 2000,
        position: 'top right'
      });
    }, function fail() {
      ezAlert({
        title: "Erreur",
        content: "Une erreur est survenue pendant la sauvegarde",
        ariaLabel: "Erreur sauvegarde de l'analyse"
      });
    });
  };

  $scope.newAnalysis = function () {
    $scope.index = $scope.analyses.push(analysesFactory.create($scope.cardID)) - 1;
  };

  $scope.back = function () { $scope.index = -1; };
  $scope.select = function (i) {
    $scope.index = i || 0;

    if ($scope.index < 0) {
      $scope.index = 0;
    } else if ($scope.index >= $scope.analyses.length) {
      $scope.index = $scope.analyses.length - 1;
    }
  };
  $scope.prev = function () { $scope.select($scope.index - 1); };
  $scope.next = function () { $scope.select($scope.index + 1); };
  $scope.hasNext = function () {
    return ($scope.index >= 0 && $scope.index + 1 < $scope.analyses.length);
  };
  $scope.hasPrev = function () {
    return ($scope.index - 1 >= 0);
  };
}])
.controller('ListCtrl', ['$scope', '$mdDialog', '$mdToast', 'platforms', function($scope, $mdDialog, $mdToast, platforms) {
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
        if (typeof el.name === 'string' && /^[a-z]/i.test(el.name)) {
          group = el.name.charAt(0).toUpperCase();
        }
        break;
      case 'status':
        if (typeof el.status === 'string') {
          group = el.status;
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
            template: '<md-toast><span flex>Plateforme sauvegardée</span></md-toast>',
            hideDelay: 3000,
            position: 'top right'
          });
        };
      },
      templateUrl: '/partials/form-add',
      targetEvent: ev
    });
  };
}]);