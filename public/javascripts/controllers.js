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
  '$mdToast',
  '$routeParams',
  'platforms',
  'ezAlert',
  function($scope, $mdToast, $routeParams, platforms, ezAlert) {

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
      return ezAlert({
        title: "Introuvable",
        content: "La plateforme d'identifiant " + cardID + " n'existe pas.",
        ariaLabel: "Erreur plateforme introuvable"
      });
    }

    $scope.setSubtitle($scope.platform.platformName);

    $scope.analyses = [];
  }).finally(function () {
    $scope.loading = false;
  });;
}])
.controller('AnalyzerCtrl', ['$scope', '$mdToast', 'platforms', function($scope, $mdToast, platforms) {
  $scope.index = -1;

  function getAnalysis(id) {
    if (!angular.isArray($scope.analyses)) { return null; }

    for (var i = $scope.analyses.length - 1; i >= 0; i--) {
      if ($scope.analyses[i].id == id) { return $scope.analyses[i]; }
    };
  }

  function removeAnalysis(id) {
    if (!angular.isArray($scope.analyses)) { return null; }

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

  $scope.parseUrl = function (id, url) {
    if (!url) { return; }

    var analysis = getAnalysis(id);
    if (!analysis) { return; }

    analysis.pathParams  = [];
    analysis.queryParams = [];

    var link = document.createElement('a');
    link.href = url;

    link.pathname.split('/').forEach(function (param) {
      if (param) { analysis.pathParams.push({ value: param }); }
    });

    link.search.substring(1).split('&').forEach(function (param) {
      if (!param) { return; }

      var parts = param.split('=');

      analysis.queryParams.push({
        name: decodeURIComponent(parts[0] || ''),
        value: decodeURIComponent(parts[1] || '')
      });
    });

    analysis.dirty = true;
  }

  $scope.addParam = function (analysis, type) {
    var field = (type || '') + 'Params';
    if (!analysis) { return; }
    if (type != 'query' && type != 'path') { return; }

    if (!angular.isArray(analysis[field])) { analysis[field] = []; }
    analysis[field].push({});
    analysis.dirty = true;
  };
  $scope.removeParam = function (analysis, type, i) {
    var field = (type || '') + 'Params';
    if (!analysis) { return; }
    if (type != 'query' && type != 'path') { return; }
    if (!angular.isArray(analysis[field])) { return; }

    analysis[field].splice(i, 1);
    analysis.dirty = true;
  };

  $scope.remove = function (id) {
    removeAnalysis(id);
    $mdToast.show({
      template: '<md-toast><span flex>Analyse supprimée</span></md-toast>',
      hideDelay: 2000,
      position: 'top right'
    });
  };
  $scope.setDirty = function (id) {
    var analysis = getAnalysis(id);
    if (analysis) { analysis.dirty = true; }
  };
  $scope.save = function (analysis) {
    if (!analysis) { return; }
    analysis.dirty = false;
    $mdToast.show({
      template: '<md-toast><span flex>Analyse sauvegardée</span></md-toast>',
      hideDelay: 2000,
      position: 'top right'
    });
  };

  $scope.newAnalysis = function () {
    $scope.index = $scope.analyses.push({ identifiers: [] }) - 1;
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