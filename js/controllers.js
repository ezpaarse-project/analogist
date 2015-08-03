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
        "url": "http://www.google.fr/somewhere?id=1234&issn=1234-5678",
        "mime": "pdf",
        "rtype": "article",
        "identifiers": [
          "title_id => 1234",
          "online_identifier => 1234-5678"
        ],
        "pathParams": [
          { value: 'somewhere', comment: 'ce commentaire est plutôt long et surtout parfaitement inutile...\n...et il comporte des sauts de lignes !' },
        ],
        "queryParams": [
          { name: 'id', value: '1234', comment: '' },
          { name: 'issn', value: '1234-5678', comment: '' }
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
        ],
        "pathParams": [
          { value: 'article-abcd', comment: 'indique un article dont l\'identifiant est abcd' }
        ],
        "queryParams": []
      },
      {
        "id": 3,
        "title": "Consultation d'un résumé",
        "url": "http://www.google.fr/some/thing?foo=bar",
        "mime": "html",
        "rtype": "abstract",
        "comment": "A quoi bon analyser ça ? Cette URL ne correspond à rien !\nC'est pas demain qu'on va pouvoir intégrer google...",
        "identifiers": [],
        "pathParams": [
          { value: 'some', comment: '' },
          { value: 'thing', comment: '' }
        ],
        "queryParams": [
          { name: 'foo', value: 'bar', comment: 'ce truc ne sert à rien' }
        ]
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
        $scope.analysis.splice(i, 1);
        if ($scope.index >= $scope.analysis.length) {
          $scope.index = $scope.analysis.length - 1;
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