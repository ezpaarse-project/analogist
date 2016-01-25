angular.module('WebApp')
.service('Session', function () {
  this.create = function (user) {
    if (!angular.isObject(user)) { return this.destroy(); };

    this.user = user;
    this.isAuthorized = user.isAuthorized;
  };

  this.destroy = function () {
    this.user = null;
    this.isAuthorized = false;
  };
})
.factory('AuthService', ['$http', 'Session', '$window', function ($http, Session, $window) {
  var authService = {};

  authService.checkSession = function () {
    authService.loadingSession = true;

    return $http.get('/auth/loggedin').then(function (res) {
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
    return $http.get('/auth/logout').then(function (res) {
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
.factory('APIService', ['$http', function ($http) {
  var apiService = {};

  apiService.createCard = function (card) {
    return $http.post('/api/platforms', card);
  };

  apiService.updateComment = function (cardID, text) {
    return $http.patch('/api/platforms/' + cardID + '/comment', { text: text });
  };

  apiService.updateCard = function (cardID, changes) {
    return $http.patch('/api/trello/cards/' + cardID, changes);
  };

  apiService.getLists = function () {
    return $http.get('/api/trello/lists').then(function (res) { return res.data; });
  };

  apiService.getCards = function () {
    return $http.get('/api/trello/cards').then(function (res) { return res.data; });
  };

  apiService.getPlatforms = function () {
    return $http.get('/api/platforms').then(function (res) { return res.data; });
  };

  apiService.addUserToCard = function (card, user) {
    return $http.post('/api/trello/cards/' + card.id + '/members', {
      id: user.id
    }).then(function (res) {
      card.idMembers.push(user.id);
      card.members.push(user);
      return res.data;
    });
  };

  apiService.checkDomain = function (domain, callback) {
    $http.get('http://ezpaarse-preprod.couperin.org/info/domains/' + domain)
    .then(function (res) {
      callback(null, res.data);
    }).catch(function (res) {
      callback(res.status == 404 ? null : res, null);
    });
  };

  /**
   * Get trello cards and extend them with their list name and platform data
   */
  apiService.getExtendedCards = function () {
    // Get trello cards
    return apiService.getCards().then(function (cards) {
      // Get trello lists
      return apiService.getLists().then(function (lists) {
        // Get platforms
        return apiService.getPlatforms().then(function (platforms) {
          var listNames = {};
          var platformsMap = {};

          lists.forEach(function (list) { listNames[list.id] = list.name; });
          platforms.forEach(function (p) { platformsMap[p.cardID] = p; });

          return cards.map(function (card) {

            card.platform = platformsMap[card.id];
            card.listName = (listNames[card.idList] || '').replace(/\s*\([^\)]+\)/, '');

            // Select the latest date between trello and analogist
            if (card.platform && card.platform.lastModified > card.dateLastActivity) {
              card.lastActivity = card.platform.lastModified;
            } else {
              card.lastActivity = card.dateLastActivity;
            }

            var match;
            var regexGithub = new RegExp('code[^\n]+source[^\n]+\n(https?://[^ $\n]+)', 'i');
            var regexHome   = new RegExp('page[^\n]+accueil[^\n]+\n(https?://[^ $\n]+)', 'i');

            if (match = regexGithub.exec(card.desc)) { card.githubUrl = match[1]; }
            if (match = regexHome.exec(card.desc))   { card.homeUrl   = match[1]; }

            return card;
          });
        });
      });
    });
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
.factory('cards', ['ezAlert', '$q', 'APIService', function(ezAlert, $q, APIService) {
  var service = {};
  var promise;

  service.get = function (cardID) {
    var deferred = $q.defer();

    if (service.list) {
      resolve();
    } else {
      service.reload()
      .then(function (list) { resolve(); })
      .catch(deferred.reject);
    }

    function resolve() {
      if (cardID) {
        for (var i = service.list.length - 1; i >= 0; i--) {
          if (service.list[i].id == cardID) { return deferred.resolve(service.list[i]); }
        };
        return deferred.resolve(null);
      }

      return deferred.resolve(service.list);
    }

    return deferred.promise;
  };

  service.reload = function () {
    if (promise) { return promise; }

    var deferred = $q.defer();
    promise = deferred.promise;

    service.loading = true;
    service.list    = null;

    APIService.getExtendedCards()
    .finally(function () {
      promise = null;
      service.loading = false;
    })
    .then(function (cards) {
      service.list = cards;
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
      loading = true;
      return $http.post(baseUrl, analysis).then(function (response) {
        if (!angular.isObject(response.data)) {
          return $q.reject('got an invalid response');
        }
        analysis.id = response.data.id;
        saved = angular.copy(analysis);
      }).finally(function () {
        loading = false;
      });
    };

    var update = function () {
      loading = true;
      return $http.put(baseUrl + '/' + analysis.id, analysis).then(function () {
        saved = angular.copy(analysis);
      }).finally(function () {
        loading = false;
      });
    };

    analysis.isLoading = function () {
      return loading;
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
        loading = true;
        return $http.delete(baseUrl + '/' + analysis.id).finally(function () { loading = false; });
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
