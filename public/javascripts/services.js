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
    var callbackUrl = encodeURIComponent('/callback' + $window.location.pathname);
    $window.location.href = '/connect/trello?host=' + $window.location.host + '&callback=' + callbackUrl;
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
  var baseUrl    = 'https://api.trello.com';
  var boardUrl   = baseUrl + '/1/boards/' + TRELLO.boardID;
  var listsURL   = boardUrl + '/lists?cards=open';
  var membersURL = boardUrl + '/members';

  trelloService.getLists = function () {
    return $http.get(listsURL).then(function (res) { return res.data; });
  };

  trelloService.getMembers = function () {
    return $http.get(membersURL).then(function (res) { return res.data; });
  };

  trelloService.getPlatforms = function () {

    var deferred = $q.defer();

    trelloService.getLists()
    .then(function (lists) {

      trelloService.getMembers()
      .then(function (members) {
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

            var regexGithub = new RegExp('(https://github.com/ezpaarse-project/ezpaarse-platforms/[^ $\n]+)', 'i');
            if (match = card.desc.match(regexGithub)) {
              platform.githubUrl = match[1];
            }

            var regexHome = new RegExp('page[^\n]+accueil[^\n]+\n(https?://[^ $\n]+)', 'i');
            if (match = card.desc.match(regexHome)) {
              platform.homeUrl = match[1];
            }

            platforms.push(platform);
          });
        });

        deferred.resolve(platforms);
      })
      .catch(function (response) { deferred.reject(); });
    })
    .catch(function (response) { deferred.reject(); });

    return deferred.promise;
  };

  return trelloService;
}])
.factory('APIService', ['$http', function ($http) {
  var apiService = {};

  apiService.createCard = function (card) {
    return $http.post('/api/platforms', card);
  };

  return apiService;
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
      service.reload().then(deferred.resolve).catch(deferred.reject);
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
      deferred.reject();
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

  /**
   * Add some methods to a raw analysis object
   */
  factory.wrapAnalysis = function (cardID, analysis) {
    if (!angular.isString(cardID)) { return; }
    if (!angular.isObject(analysis)) { analysis = {}; }

    var baseUrl = '/api/platforms/' + cardID + '/analyses';
    var saved   = angular.copy(analysis);
    var loading = false;

    var insert = function () {
      return $http.post(baseUrl, analysis).then(function (response) {
        if (!angular.isObject(response.data)) {
          return $q.reject('got an invalid response');
        }
        analysis.id = saved.id = response.data.id;
      });
    };

    var update = function () {
      return $http.put(baseUrl + '/' + analysis.id, analysis).then(function () {
        saved = angular.copy(analysis);
      });
    };

    analysis.save = function () {
      if (!angular.equals(saved, analysis)) {
        return analysis.id ? update() : insert();
      }

      var deferred = $q.defer();
      deferred.resolve();
      return deferred.promise;
    };
    analysis.remove = function () {
      if (analysis.id) {
        return $http.delete(baseUrl + '/' + analysis.id);
      }

      var deferred = $q.defer();
      deferred.resolve();
      return deferred.promise;
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
    };

    return analysis;
  };

  /**
   * Save a list of analyses
   */
  factory.save = function (analyses) {
    return $q.all(analyses.map(function (analysis) { return analysis.save(); }));
  };

  factory.get = function (cardID) {
    return $http.get('/api/platforms/' + cardID + '/analyses').then(function (response) {
      if (!angular.isArray(response.data)) {
        return $q.reject('could not get analyses');
      }

      return response.data.map(function (analysis) {
        return factory.wrapAnalysis(cardID, analysis);
      });
    });
  };

  return factory;
}]);
