angular.module('WebApp')
.controller('AppCtrl', [
  '$scope',
  '$mdSidenav',
  '$location',
  '$rootScope',
  '$route',
  function($scope, $mdSidenav, $location, $rootScope, $route) {

  $scope.auth.checkSession();

  $rootScope.$on('$routeChangeSuccess', function() {
    $scope.subtitle     = null;
    $scope.toolbarItems = null;
    $scope.menuItems    = null;
  });

  $scope.setSubtitle = function (str) {
    $scope.subtitle = str;
  };
  $scope.setToolbarItems = function (items) {
    $scope.toolbarItems = items;
  };
  $scope.setMenuItems = function (items) {
    $scope.menuItems = items;
  };

  $scope.goto = function(path) {
    $location.path(path || '/');
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

  var cardID = $scope.cardID = $routeParams.id;

  getPlatform();

  $scope.toggleSplitView = function () {
    $scope.split = !$scope.split;
  }

  function reload() {
    platforms.reload();
    getPlatform();
  }

  function getPlatform() {
    $scope.loading = true;

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
      .then(function (analyses) {
        $scope.loading  = false;
        $scope.analyses = analyses;

        $scope.setToolbarItems([
          { label: 'Sauvegarder', icon: 'content:save', action: save },
          { label: 'Nouvelle analyse', icon: 'content:add', action: newAnalysis }
        ]);

        $scope.setMenuItems([
          { label: 'Actualiser', icon: 'navigation:refresh', action: reload },
          { label: 'Voir sur GitHub', icon: 'mdi:github', href: $scope.platform.githubUrl },
          { label: 'Voir sur Trello', icon: 'mdi:trello', href: $scope.platform.card.url }
        ]);
      })
      .catch(function (response) {
        $scope.loading  = false;
        $scope.analyses = [];

        if (response.status == 404) { return; }

        ezAlert({
          title: "Erreur",
          content: "Une erreur est survenue pendant la récupération des analyses",
          ariaLabel: "Erreur récupération des analyses"
        });
      });
    }).catch(function () {
      $scope.loading = false;
    });
  }

  function newAnalysis() {
    $scope.analyses.push(analysesFactory.wrapAnalysis($scope.cardID));
  };

  function save() {
    if (!$scope.analyses) { return; }
    $scope.saving = true;

    analysesFactory.save($scope.analyses)
    .then(function success() {
      $scope.saving = false;

      $mdToast.show({
        template: '<md-toast><span flex>Analyses sauvegardées</span></md-toast>',
        hideDelay: 2000,
        position: 'bottom right'
      });
    }, function fail() {
      $scope.saving = false;

      ezAlert({
        title: "Erreur",
        content: "Une erreur est survenue pendant la sauvegarde",
        ariaLabel: "Erreur sauvegarde des analyses"
      });
    });
  };
}])
.controller('AnalyzerCtrl', [
  '$scope',
  '$mdToast',
  '$http',
  'ezAlert',
  'analysesFactory',
  function($scope, $mdToast, $http, ezAlert, analysesFactory) {

  $http.get('https://raw.githubusercontent.com/ezpaarse-project/ezpaarse-platforms/master/rtype.json').then(function (response) {
    if (angular.isArray(response.data)) { $scope.resourceTypes = response.data; }
  });
  $http.get('https://raw.githubusercontent.com/ezpaarse-project/ezpaarse-platforms/master/mime.json').then(function (response) {
    if (angular.isArray(response.data)) { $scope.mimeTypes = response.data; }
  });
  $http.get('https://raw.githubusercontent.com/ezpaarse-project/ezpaarse-platforms/master/rid.json').then(function (response) {
    if (angular.isArray(response.data)) { $scope.resourceIDs = response.data; }
  });

  $scope.back = function () { $scope.analysis = null; };
  $scope.select = function (analysis) { $scope.analysis = analysis; };

  /**
   * Add an element in an array
   */
  $scope.addElement = function (analysis, field) {
    if (!analysis) { return; }
    if (!angular.isArray(analysis[field])) { analysis[field] = []; }

    analysis[field].push({});
    analysis.setDirty(true);
  };

  /**
   * Remove an element from an array
   */
  $scope.removeElement = function (analysis, field, i) {
    if (!analysis) { return; }
    if (!angular.isArray(analysis[field])) { return; }

    analysis[field].splice(i, 1);
    analysis.setDirty(true);
  };

  $scope.remove = function (analysis) {
    if (!analysis || $scope.loading) { return; }

    $scope.loading = true;

    analysis.remove()
    .then(function success() {
      $scope.loading = false;

      // Remove from local analyses
      for (var i = $scope.analyses.length - 1; i >= 0; i--) {
        if ($scope.analyses[i] === analysis) {
          $scope.analyses.splice(i, 1);
          break;
        }
      };

      if ($scope.analysis === analysis) { $scope.analysis = null; }

      $mdToast.show({
        template: '<md-toast><span flex>Analyse supprimée</span></md-toast>',
        hideDelay: 2000,
        position: 'bottom right'
      });
    }, function fail() {
      $scope.loading = false;
      ezAlert({
        title: "Erreur",
        content: "Une erreur est survenue pendant la suppression",
        ariaLabel: "Erreur suppression de l'analyse"
      });
    });
  };
}])
.controller('ListCtrl', ['$scope', '$mdDialog', '$mdToast', 'platforms', function($scope, $mdDialog, $mdToast, platforms) {
  $scope.groupby = 'letter';

  getPlatforms();

  $scope.setMenuItems([
    { label: 'Actualiser', icon: 'navigation:refresh', action: reload }
  ]);

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
            position: 'bottom right'
          });
        };
      },
      templateUrl: '/partials/form-add',
      targetEvent: ev
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

  function reload() {
    platforms.reload();
    getPlatforms();
  }

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
  }
}]);