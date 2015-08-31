angular.module('WebApp')
.service('Session', ['TRELLO', function (TRELLO) {
  this.create = function (user) {
    if (!angular.isObject(user)) { return this.destroy(); };

    this.user = user;
    this.isAuthorized = false;

    if (angular.isArray(user.idBoards)) {
      this.isAuthorized = user.idBoards.some(function (id) {
        return (id == TRELLO.boardID);
      });
    }
  };

  this.destroy = function () {
    this.user = null;
    this.isAuthorized = false;
  };
}])
.factory('AuthService', ['$http', 'Session', '$window', function ($http, Session, $window) {
  var authService = {};

  authService.checkSession = function () {
    authService.loadingSession = true;

    return $http.get('/api/loggedin').then(function (res) {
      if (res.status == 200) {
        Session.create(res.data);
      } else {
        Session.destroy();
      }
    }).finally(function () {
      authService.loadingSession = false;
    });
  };

  authService.login = function () {
    $window.location.href = '/connect/trello';
  };

  authService.logout = function () {
    return $http.get('/api/logout').then(function (res) {
      Session.destroy();
    });
  };

  authService.isAuthenticated = function () {
    return !!Session.user;
  };

  authService.isAuthorized = function () {
    return Session.isAuthorized;
  };

  return authService;
}])
.factory('TrelloService', ['$http', '$q', 'TRELLO', function ($http, $q, TRELLO) {
  var trelloService = {};
  var baseUrl = 'https://api.trello.com';
  var boardUrl = baseUrl + '/1/boards/' + TRELLO.boardID;

  trelloService.getPlatforms = function () {
    var listsURL   = boardUrl + '/lists?cards=open&key=' + TRELLO.apiKey;
    var membersURL = boardUrl + '/members?key=' + TRELLO.apiKey;

    var deferred = $q.defer();

    $http.get(listsURL)
    .catch(function (response) { deferred.reject(); })
    .then(function (res1) {
      var lists = res1.data;

      $http.get(membersURL)
      .catch(function (response) { deferred.reject(); })
      .then(function (res2) {
        var members = res2.data;
        var indexedMembers = {};
        members.forEach(function (m) { indexedMembers[m.id] = m.fullName; });

        var platforms = [];

        lists.forEach(function (list) {
          list.cards.forEach(function (card) {
            if (!angular.isArray(card.idMembers)) { card.idMembers = []; }

            card.members = card.idMembers.map(function (member) {
              return indexedMembers[member];
            });

            // Remove the example card
            if (card.id === TRELLO.exampleCardID) { return; }

            var platform = {
              status:       list.name.replace(/\s*\([^\)]+\)/, ''),
              lastActivity: new Date(card.dateLastActivity).toLocaleDateString(),
              name:         card.name,
              contacts:     card.members.join(', '),
              card:         card
            };

            var regexpGitHubPlatform = new RegExp('(https://github.com/ezpaarse-project/ezpaarse-platforms/[^ $\n]+)');
            if (match = card.desc.match(regexpGitHubPlatform)) {
              platform.gitHubUrl = match[1];
            }

            platforms.push(platform);
          });
        });

        deferred.resolve(platforms);
      });
    });

    return deferred.promise;
  };

  return trelloService;
}])
.factory('ezAlert', ['$mdDialog', function ($mdDialog) {
  return function (opt) {
    opt    = opt || {};
    opt.ok = opt.ok || 'OK';

    $mdDialog.show(
      $mdDialog.alert(opt).parent(angular.element(document.body))
    );
  }
}])
.factory('platforms', ['ezAlert', '$q', 'TrelloService', function(ezAlert, $q, TrelloService) {
  var service = {};
  var promise;

  service.get = function () {
    var deferred = $q.defer();
    if (service.list) {
      deferred.resolve(service.list);
    } else {
      service.reload().then(deferred.resolve);
    }
    return deferred.promise;
  };

  service.reload = function () {
    if (promise) { return promise; }

    var deferred = $q.defer();
    promise = deferred.promise;

    service.loading = true;
    service.list    = null;

    TrelloService.getPlatforms()
    .finally(function () {
      promise = null;
      service.loading = false;
    })
    .then(function (platforms) {
      service.list = platforms;
      deferred.resolve(service.list);
    })
    .catch(function () {
      deferred.reject(err);
      return ezAlert({
        title: "Erreur",
        content: "Une erreur est survenue lors de la récupération de la liste des plateformes.",
        ariaLabel: "Erreur récupération des plateformes"
      });
    });

    return promise;
  };

  service.reload();

  return service;
}])
.factory('analysesFactory', ['$http', 'ezAlert', '$q', function($http, ezAlert, $q) {
  var factory = {};

  factory.create = function (cardID, analysis) {
    if (!angular.isString(cardID)) { return; }
    if (!angular.isObject(analysis)) { analysis = {}; }

    var baseUrl = '/api/platforms/' + cardID + '/analyses';

    // workaround for chips, but chips should be replaced with something more convenient
    analysis.identifiers = analysis.identifiers || [];

    var state = {};

    analysis.setDirty  = function (bool) { state.dirty = bool; };
    analysis.isDirty   = function () { return state.dirty; };
    analysis.isLoading = function () { return state.loading; };

    var insert = function () {
      state.loading = true;

      return $http.post(baseUrl, analysis).then(function (response) {
        if (!angular.isObject(response.data)) {
          return $q.reject('got an invalid response');
        }
        analysis.id = response.data.id;
        state.dirty = false;
      }).finally(function () {
        state.loading = false;
      });
    };

    var update = function () {
      state.loading = true;

      return $http.post(baseUrl + '/' + analysis.id, analysis).then(function () {
        state.dirty = false;
      }).finally(function () {
        state.loading = false;
      });
    };

    analysis.save = function () {
      return analysis.id ? update() : insert();
    };
    analysis.remove = function () {
      state.loading = true;

      return $http.delete(baseUrl + '/' + analysis.id).finally(function () {
        state.loading = false;
      });
    };

    analysis.parseUrl = function () {
      if (!analysis.url) { return; }

      analysis.pathParams  = [];
      analysis.queryParams = [];

      var link = document.createElement('a');
      link.href = analysis.url;

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

      analysis.setDirty(true);
    };

    return analysis;
  };

  factory.get = function (cardID) {
    return $http.get('/api/platforms/' + cardID + '/analyses').then(function (response) {
      if (!angular.isArray(response.data)) {
        return $q.reject('could not get analyses');
      }

      return response.data.map(function (analysis) {
        return factory.create(cardID, analysis);
      });
    });
  };

  return factory;
}]);
