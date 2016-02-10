angular.module('WebApp')
.controller('AppCtrl', ['$scope', '$window', 'analysesFactory', function ($scope, $window, analysesFactory) {
  $scope.auth.checkSession();

  $window.onbeforeunload = function (e) {
    if (analysesFactory.hasUnsavedChanges()) {
      e = e || $window.event;
      var message = 'Les analyses non enregistrées seront perdues.';

      if (e) { e.returnValue = message; }
      return message;
    }
  };
}])
.controller('ToolbarCtrl', ['$scope', '$mdDialog', 'boardID', function ($scope, $mdDialog, boardID) {
  var vm = this;

  vm.links = [
    {
      href: 'http://analogist.couperin.org/',
      target: '_blank',
      icon: 'action:home',
      label: 'AnalogIST'
    },{
      href: 'http://trello.com/b/' + boardID,
      target: '_blank',
      icon: 'mdi:trello',
      label: 'Tableau Trello'
    }
  ];

  vm.actions = [
    { trigger: $scope.auth.login, icon: 'mdi:login', label: 'Connexion' },
    { trigger: $scope.auth.logout, icon: 'mdi:logout', label: 'Déconnexion' }
  ];

  vm.showAboutDialog = function (ev) {
    $mdDialog.show({
      parent: angular.element(document.body),
      clickOutsideToClose: true,
      templateUrl: '/partials/about',
      targetEvent: ev
    });
  };

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
  'boardID',
  function ($mdDialog, $http, $mdToast, ezAlert, boardID) {
  var vm = this;
  vm.boardID = boardID;

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
  'APIService',
  'analysesFactory',
  '$mdToast',
  '$filter',
  '$stateParams',
  '$mdDialog',
  'cards',
  'ezAlert',
  'Session',
  function($scope, APIService, analysesFactory, $mdToast, $filter, $stateParams, $mdDialog, cards, ezAlert, Session) {
  var vm = this;
  var cardID = vm.cardID = $stateParams.id;

  getCard();

  $scope.select = function (index) {
    vm.analysis = vm.analyses[index];
  };

  vm.newAnalysis = function () {
    if (!vm.analyses) { return; }
    vm.analyses.push(analysesFactory.wrapAnalysis(vm.cardID));
  };

  vm.save = function () {
    if (!vm.analyses || !Session.user) { return; }

    var user = Session.user;
    vm.saving = true;

    analysesFactory.save(vm.analyses)
    .then(function () {
      if (!vm.card || !angular.isArray(vm.card.idMembers)) { return; }

      if (vm.card.idMembers.indexOf(user.id) === -1) {
        return APIService.addUserToCard(vm.card, user);
      }
    })
    .then(function success() {
      vm.saving = false;

      $mdToast.show({
        template: '<md-toast><span flex>Analyses sauvegardées</span></md-toast>',
        hideDelay: 2000,
        position: 'bottom right'
      });
    })
    .catch(function fail() {
      vm.saving = false;

      ezAlert({
        title: "Erreur",
        content: "Une erreur est survenue pendant la sauvegarde",
        ariaLabel: "Erreur sauvegarde des analyses"
      });
    });
  };

  vm.updateComment = function (text) {
    vm.savingComment = true;

    APIService.updateComment(cardID, text)
    .then(function success() {
      vm.savingComment = false;

      $mdToast.show({
        template: '<md-toast><span flex>Remarques sauvegardées</span></md-toast>',
        hideDelay: 2000,
        position: 'bottom right'
      });
    }, function fail() {
      vm.savingComment = false;

      ezAlert({
        title: "Erreur",
        content: "Une erreur est survenue pendant la sauvegarde",
        ariaLabel: "Erreur sauvegarde des remarques"
      });
    });
  };

  vm.remove = function (analysis) {
    if (!analysis || analysis.isLoading()) { return; }

    $mdDialog.show($mdDialog.confirm({
      content: "Êtes-vous sûr de vouloir supprimer cette URL ?",
      ariaLabel: "Confirmer la suppression de l'URL",
      ok: "Supprimer",
      cancel: "Annuler"
    })).then(function deleteAnalysis() {

      analysis.remove()
      .then(function success() {
        // Remove from local analyses
        for (var i = vm.analyses.length - 1; i >= 0; i--) {
          if (vm.analyses[i] === analysis) {
            vm.analyses.splice(i, 1);
            break;
          }
        };

        if (vm.analysis === analysis) { vm.analysis = null; }

        $mdToast.show({
          template: '<md-toast><span flex>Analyse supprimée</span></md-toast>',
          hideDelay: 2000,
          position: 'bottom right'
        });
      })
      .catch(function fail() {
        ezAlert({
          title: "Erreur",
          content: "Une erreur est survenue pendant la suppression",
          ariaLabel: "Erreur suppression de l'analyse"
        });
      });
    });
  };

  vm.showUpdateForm = function(ev) {
    $mdDialog.show({
      controller: 'UpdatePlatformCtrl as vm',
      parent: angular.element(document.body),
      templateUrl: '/partials/form-update',
      targetEvent: ev,
      locals: { platform: vm.card }
    });
  };

  function getCard() {
    vm.loading = true;

    cards.get(cardID).then(function (card) {
      if (!card) {
        vm.loading = false;

        return ezAlert({
          title: "Introuvable",
          content: "La plateforme d'identifiant " + cardID + " n'existe pas.",
          ariaLabel: "Erreur plateforme introuvable"
        });
      }

      vm.card = card;
      vm.links = [
        { label: 'Page d\'accueil', icon: 'action:home', href: vm.card.homeUrl },
        { label: 'Code source', icon: 'mdi:github', href: vm.card.githubUrl },
        { label: 'Carte Trello', icon: 'mdi:trello', href: vm.card.url }
      ];

      $scope.$watchCollection('vm.analyses', function () {
        angular.forEach(vm.analyses, function (analysis, i) {
          analysis.order = i + 1;
        });
      });

      analysesFactory.get(vm.card.id)
      .then(function (analyses) {
        vm.loading  = false;
        vm.analyses = $filter('orderBy')(analyses, 'order');
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
  '$mdDialog',
  '$http',
  function($mdDialog, $http) {

  var vm = this;
  $http.get('https://raw.githubusercontent.com/ezpaarse-project/ezpaarse-platforms/master/fields.json').then(function (response) {
    if (angular.isObject(response.data)) {
      vm.ezFields = response.data;
      vm.ezFields.possibleFields = (vm.ezFields.rid || []).concat(vm.ezFields.other || []);
    }
  });

  /**
   * Add an element in an array
   */
  vm.addElement = function (analysis, field) {
    if (!analysis) { return; }
    if (!angular.isArray(analysis[field])) { analysis[field] = []; }

    analysis[field].push({});
  };

  /**
   * Remove an element from an array
   */
  vm.removeElement = function (analysis, field, i) {
    if (!analysis) { return; }
    if (!angular.isArray(analysis[field])) { return; }

    analysis[field].splice(i, 1);
  };

  vm.parseUrl = function (analysis) {
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
}])
.controller('ListCtrl', ['$rootScope', '$mdDialog', 'cards', function($rootScope, $mdDialog, cards) {
  var vm = this;
  vm.groupby = 'letter';
  vm.search  = {};

  getPlatforms();
  $rootScope.$on('newCardCreated', reload);

  function getPlatforms() {
    vm.loading = true;

    cards.get().then(function () {
      vm.buildList();
    }).finally(function () {
      vm.loading = false;
    });
  }

  function reload() {
    cards.reload();
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
    if (!cards.list) { return vm.list = null; }

    var groups = {};
    vm.list = [];

    cards.list.forEach(function (el) {
      var group = '#';

      switch (vm.groupby) {
      case 'letter':
        if (typeof el.name === 'string' && /^[a-z]/i.test(el.name)) {
          group = el.name.charAt(0).toUpperCase();
        }
        break;
      case 'status':
        if (typeof el.listName === 'string') {
          group = el.listName;
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
  'APIService',
  '$q',
  '$rootScope',
  'searchValue',
  function($mdDialog, $mdToast, ezAlert, APIService, $q, $rootScope, searchValue) {
  var vm = this;

  getLists();

  vm.domainCheck = {};
  vm.platform    = { longName: searchValue };
  vm.getLists    = getLists;

  vm.hide   = function() { $mdDialog.hide(); };
  vm.cancel = function() { $mdDialog.cancel(); };
  vm.submit = function(valid) {

    if (!valid) { return; }

    var desc = '';

    if (vm.platform.homeUrl) {
      desc += 'Url de la page d\'accueil de la plateforme :\n';
      desc += vm.platform.homeUrl;
    }

    var card = {
      name: vm.platform.longName + ' [' + vm.platform.shortName + ']',
      idList: vm.platform.list,
      desc: desc
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

  vm.checkDomain = function (url) {
    vm.domainCheck.error = null;
    vm.domainCheck.info  = null;
    vm.domainCheck.proxy = null;

    if (!url) { return; }
    if (!/https?:\/\//.test(url)) { url = 'http://' + url; }

    var link = document.createElement('a');
    link.href = url;

    APIService.checkDomain(link.hostname, function (err, data) {
      if (err) { vm.domainCheck.error = err; }
      vm.domainCheck.info = data;

      var match = /\.(net|org|com|fr)(\..*)/i.exec(link.hostname);
      vm.domainCheck.proxy = match && match[2];
    });
  }

  function getLists() {
    var deferred = $q.defer();

    if (vm.lists) {
      deferred.resolve();
    } else {
      APIService.getLists().then(function (lists) {
        vm.lists = lists;
        deferred.resolve();
      });
    }

    return deferred.promise;
  };
}])
.controller('UpdatePlatformCtrl', [
  '$mdDialog',
  '$mdToast',
  'ezAlert',
  'APIService',
  '$q',
  'platform',
  function ($mdDialog, $mdToast, ezAlert, APIService, $q, platform) {
  var vm = this;

  getLists();

  vm.platform = angular.copy(platform);
  vm.getLists = getLists;

  vm.hide   = function() { $mdDialog.hide(); };
  vm.cancel = function() { $mdDialog.cancel(); };
  vm.submit = function(valid) {

    if (!valid) { return; }

    var changes = {
      idList: vm.platform.idList,
      desc: vm.platform.desc,
      name: vm.platform.name
    };

    /**
     * Add or replace the GitHub URL
     */
    if (vm.platform.githubUrl !== platform.githubUrl) {
      var regexGithub = new RegExp('(code[^\n]+source[^\n]+\n)[^ $\n]*', 'i');

      if (regexGithub.test(changes.desc)) {
        changes.desc = changes.desc.replace(regexGithub, '$1' + vm.platform.githubUrl);
      } else {
        changes.desc += '\nCode source de la plateforme (PKB / scrapeur / parseur) :\n';
        changes.desc += vm.platform.githubUrl;
      }
    }

    /**
     * Add or replace the home URL
     */
    if (vm.platform.homeUrl !== platform.homeUrl) {
      var regexHome = new RegExp('(page[^\n]+accueil[^\n]+\n)[^ $\n]*', 'i');

      if (regexHome.test(changes.desc)) {
        changes.desc = changes.desc.replace(regexHome, '$1' + vm.platform.homeUrl);
      } else {
        changes.desc += '\nUrl de la page d\'accueil de la plateforme :\n';
        changes.desc += vm.platform.homeUrl;
      }
    }

    vm.loading = true;

    APIService.updateCard(platform.id, changes)
    .then(function (res) {
      platform.name      = vm.platform.name;
      platform.homeUrl   = vm.platform.homeUrl;
      platform.githubUrl = vm.platform.githubUrl;
      platform.idList    = changes.idList;
      platform.desc      = changes.desc;

      if (vm.lists) {
        for (var i = vm.lists.length - 1; i >= 0; i--) {
          if (vm.lists[i].id == platform.idList) {
            platform.listName = vm.lists[i].name.replace(/\s*\([^\)]+\)/, '');
            break;
          }
        };
      }

      $mdDialog.hide();
      $mdToast.show({
        template: '<md-toast><span flex>Plateforme sauvegardée</span></md-toast>',
        hideDelay: 3000,
        position: 'bottom right'
      });
    })
    .finally(function () { vm.loading = false; })
    .catch(function () {
      ezAlert({
        title: 'Erreur',
        content: 'Une erreur est survenue pendant la modification de la plateforme',
        ariaLabel: 'Erreur modification de plateforme'
      });
    });
  };

  function getLists() {
    var deferred = $q.defer();

    if (vm.lists) {
      deferred.resolve();
    } else {
      APIService.getLists().then(function (lists) {
        vm.lists = lists;
        deferred.resolve();
      });
    }

    return deferred.promise;
  };
}]);