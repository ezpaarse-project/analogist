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
.controller('AnalysisCtrl', [
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

    $scope.analysis = [
      {
        "id": 1,
        "title": "Consultation d'un article PDF",
        "url": "http://www.google.fr?id=1234&issn=1234-5678",
        "mime": "pdf",
        "rtype": "article",
        "identifiers": [
          "title_id => 1234",
          "online_identifier => 1234-5678"
        ]
      },
      {
        "id": 2,
        "title": "Consultation d'un article HTML",
        "url": "http://www.google.fr/article-abcd",
        "mime": "html",
        "rtype": "article",
        "identifiers": [
          "title_id => abcd"
        ]
      },
      {
        "id": 3,
        "title": "Consultation d'un résumé",
        "url": "http://www.google.fr",
        "mime": "html",
        "rtype": "abstract",
        "identifiers": []
      }
    ];
  }).finally(function () {
    $scope.loading = false;
  });;
}])
.controller('AnalyzerCtrl', ['$scope', '$mdToast', 'platforms', function($scope, $mdToast, platforms) {
  $scope.index = -1;

  function getAnalysis(id) {
    if (!angular.isArray($scope.analysis)) { return null; }

    for (var i = $scope.analysis.length - 1; i >= 0; i--) {
      if ($scope.analysis[i].id == id) { return $scope.analysis[i]; }
    };
  }

  function removeAnalysis(id) {
    if (!angular.isArray($scope.analysis)) { return null; }

    for (var i = $scope.analysis.length - 1; i >= 0; i--) {
      if ($scope.analysis[i].id == id) {
        return $scope.analysis.splice(i, 1);
      }
    };
  }

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
    $scope.index = $scope.analysis.push({ identifiers: [] }) - 1;
  };

  $scope.back = function () { $scope.index = -1; };
  $scope.select = function (i) {
    $scope.index = i || 0;

    if ($scope.index < 0) {
      $scope.index = 0;
    } else if ($scope.index >= $scope.analysis.length) {
      $scope.index = $scope.analysis.length - 1;
    }
  };
  $scope.prev = function () { $scope.select($scope.index - 1); };
  $scope.next = function () { $scope.select($scope.index + 1); };
  $scope.hasNext = function () {
    return ($scope.index >= 0 && $scope.index + 1 < $scope.analysis.length);
  };
  $scope.hasPrev = function () {
    return ($scope.index - 1 >= 0);
  };
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
            template: '<md-toast><span flex>Platforme sauvegardée</span></md-toast>',
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