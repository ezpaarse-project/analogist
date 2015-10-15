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
    $scope.subtitle   = null;
    $scope.onRootPage = ($location.path() === '/list');
  });

  $scope.setSubtitle = function (str) {
    $scope.subtitle = str;
  };

  $scope.goto = function(path) {
    $location.path(path || '/');
  };
}])
.controller('ToolbarCtrl', ['$scope', '$mdDialog', 'TRELLO', function ($scope, $mdDialog, TRELLO) {
  var vm = this;

  vm.links = [
    { href: 'http://analogist.couperin.org/', icon: 'action:home', label: 'AnalogIST' },
    { href: 'http://trello.com/b/' + TRELLO.boardID, icon: 'mdi:trello', label: 'Tableau Trello' }
  ];

  vm.actions = [
    { trigger: $scope.auth.login, icon: 'mdi:login', label: 'Connexion' },
    { trigger: $scope.auth.logout, icon: 'mdi:logout', label: 'Déconnexion' }
  ];

  vm.showMembershipDialog = function (ev) {
    $mdDialog.show({
      controller: 'MembershipCtrl as vm',
      parent: angular.element(document.body),
      templateUrl: '/partials/form-membership',
      targetEvent: ev
    });
  };
}])
.controller('MembershipCtrl', [
  '$mdDialog',
  '$http',
  '$mdToast',
  'ezAlert',
  'TRELLO',
  function ($mdDialog, $http, $mdToast, ezAlert, TRELLO) {
  var vm = this;
  vm.boardID = TRELLO.boardID;

  vm.hide   = function() { $mdDialog.hide(); };
  vm.cancel = function() { $mdDialog.cancel(); };

  vm.requestMembership = function () {
    if (vm.submitting) { return; }
    vm.submitting = true;

    $http.post('/auth/membership')
    .then(function () {
      $mdDialog.hide();
      $mdToast.show({
        template: '<md-toast><span flex>Demande envoyée</span></md-toast>',
        hideDelay: 2000,
        position: 'bottom right'
      });
    })
    .catch(function () {
      ezAlert({
        title: "Erreur",
        content: "La demande n'a pas pu être envoyée, veuillez réessayer.",
        ariaLabel: "Erreur demande des droits de modification"
      });
    })
    .finally(function () {
      vm.submitting = false;
    });
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
  var vm = this;
  var cardID = vm.cardID = $routeParams.id;

  getPlatform();

  vm.newAnalysis = function () {
    if (!vm.analyses) { return; }
    vm.analyses.push(analysesFactory.wrapAnalysis(vm.cardID));
  };

  vm.save = function () {
    if (!vm.analyses) { return; }
    vm.saving = true;

    analysesFactory.save(vm.analyses)
    .then(function success() {
      vm.saving = false;

      $mdToast.show({
        template: '<md-toast><span flex>Analyses sauvegardées</span></md-toast>',
        hideDelay: 2000,
        position: 'bottom right'
      });
    }, function fail() {
      vm.saving = false;

      ezAlert({
        title: "Erreur",
        content: "Une erreur est survenue pendant la sauvegarde",
        ariaLabel: "Erreur sauvegarde des analyses"
      });
    });
  };

  function reload() {
    platforms.reload();
    getPlatform();
  }

  function getPlatform() {
    vm.loading = true;

    platforms.get().then(function (list) {
      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i].card.id == cardID) { vm.platform = list[i]; break; }
      };

      if (!vm.platform) {
        vm.loading = false;

        return ezAlert({
          title: "Introuvable",
          content: "La plateforme d'identifiant " + cardID + " n'existe pas.",
          ariaLabel: "Erreur plateforme introuvable"
        });
      }

      $scope.setSubtitle(vm.platform.name);

      vm.links = [
        { label: 'Page d\'accueil', icon: 'action:home', href: vm.platform.homeUrl },
        { label: 'Code source', icon: 'mdi:github', href: vm.platform.githubUrl },
        { label: 'Carte Trello', icon: 'mdi:trello', href: vm.platform.card.url }
      ];

      analysesFactory.get(vm.platform.card.id)
      .then(function (analyses) {
        vm.loading  = false;
        vm.analyses = analyses;
      })
      .catch(function (response) {
        vm.loading  = false;
        vm.analyses = [];

        if (response.status == 404) { return; }

        ezAlert({
          title: "Erreur",
          content: "Une erreur est survenue pendant la récupération des analyses",
          ariaLabel: "Erreur récupération des analyses"
        });
      });
    }).catch(function () {
      vm.loading = false;
    });
  }
}])
.controller('AnalyzerCtrl', [
  '$scope',
  '$mdToast',
  '$mdDialog',
  '$http',
  'ezAlert',
  'analysesFactory',
  function($scope, $mdToast, $mdDialog, $http, ezAlert, analysesFactory) {

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
  };

  /**
   * Remove an element from an array
   */
  $scope.removeElement = function (analysis, field, i) {
    if (!analysis) { return; }
    if (!angular.isArray(analysis[field])) { return; }

    analysis[field].splice(i, 1);
  };

  $scope.parseUrl = function (analysis) {
    if (!analysis) { return; }

    var hasPathParams = angular.isArray(analysis.pathParams) && analysis.pathParams.length > 0;
    var hasQueryParams = angular.isArray(analysis.queryParams) && analysis.queryParams.length > 0;

    if (!hasPathParams && !hasQueryParams) {
      return analysis.parseUrl();
    }

    $mdDialog.show($mdDialog.confirm({
      title: "Êtes-vous sûr ?",
      content: "Cette action remplacera les champs relatifs aux paramètres de l'URL.",
      ariaLabel: "Confirmer le remplacement des champs",
      ok: "Remplacer",
      cancel: "Annuler"
    })).then(function () {
      analysis.parseUrl();
    });
  };

  $scope.remove = function (analysis) {
    if (!analysis || $scope.loading) { return; }

    $mdDialog.show($mdDialog.confirm({
      content: "Êtes-vous sûr de vouloir supprimer cette URL ?",
      ariaLabel: "Confirmer la suppression de l'URL",
      ok: "Supprimer",
      cancel: "Annuler"
    })).then(function () {
      deleteAnalysis(analysis);
    });
  };

  function deleteAnalysis(analysis) {
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
  }
}])
.controller('ListCtrl', ['$rootScope', '$scope', '$mdDialog', 'platforms', function($rootScope, $scope, $mdDialog, platforms) {
  var vm = this;
  vm.groupby = 'letter';
  vm.search  = {};

  getPlatforms();
  $rootScope.$on('newCardCreated', reload);

  function getPlatforms() {
    vm.loading = true;

    platforms.get().then(function () {
      vm.buildList();
    }).finally(function () {
      vm.loading = false;
    });
  }

  function reload() {
    platforms.reload();
    getPlatforms();
  }

  vm.showAdd = function(ev) {
    $mdDialog.show({
      controller: 'NewPlatformCtrl as vm',
      parent: angular.element(document.body),
      templateUrl: '/partials/form-add',
      targetEvent: ev,
      locals: { searchValue: vm.search.name }
    });
  };

  vm.buildList = function () {
    if (!platforms.list) { return vm.list = null; }

    var groups  = {};
    vm.list = [];

    platforms.list.forEach(function (el) {
      var group = '#';

      switch (vm.groupby) {
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
        vm.list.push({ name: group, list: groups[group] = [] });
      }
      groups[group].push(el);
    });
  }
}])
.controller('NewPlatformCtrl', [
  '$mdDialog',
  '$mdToast',
  'ezAlert',
  'TrelloService',
  '$q',
  'APIService',
  '$rootScope',
  'searchValue',
  function($mdDialog, $mdToast, ezAlert, TrelloService, $q, APIService, $rootScope, searchValue) {
  var vm = this;

  vm.platform = { longName: searchValue };

  vm.hide   = function() { $mdDialog.hide(); };
  vm.cancel = function() { $mdDialog.cancel(); };
  vm.submit = function(valid) {

    if (!valid) { return; }

    var descLines = [];

    if (vm.platform.homeUrl) {
      descLines.push('Url de la page d\'accueil de la plateforme :');
      descLines.push(vm.platform.homeUrl);
    }
    if (vm.platform.githubUrl) {
      descLines.push('Code source de la plateforme (PKB / scrapeur / parseur) :');
      descLines.push(vm.platform.githubUrl);
    }

    var card = {
      name: vm.platform.longName + ' [' + vm.platform.shortName + ']',
      idList: vm.platform.list,
      desc: descLines.join('\n')
    };

    vm.loading = true;

    APIService.createCard(card)
    .then(function (res) {
      $rootScope.$emit('newCardCreated');

      $mdDialog.hide();
      $mdToast.show({
        template: '<md-toast><span flex>Plateforme sauvegardée</span></md-toast>',
        hideDelay: 3000,
        position: 'bottom right'
      });
    })
    .finally(function () { vm.loading = false; })
    .catch(function (res) {
      ezAlert({
        title: "Erreur",
        content: "Une erreur est survenue pendant la création de la plateforme",
        ariaLabel: "Erreur création de plateforme"
      });
    });
  };

  vm.getLists = function () {
    var deferred = $q.defer();

    if (vm.lists) {
      deferred.resolve();
    } else {
      TrelloService.getLists().then(function (lists) {
        vm.lists = lists;
        deferred.resolve();
      });
    }

    return deferred.promise;
  };
}]);