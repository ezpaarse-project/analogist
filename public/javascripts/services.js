angular.module('WebApp')
.factory('ezAlert', ['$mdDialog', function ($mdDialog) {
  return function (opt) {
    opt    = opt || {};
    opt.ok = opt.ok || 'OK';

    $mdDialog.show(
      $mdDialog.alert(opt).parent(angular.element(document.body))
    );
  }
}])
.factory('platforms', ['$rootScope', 'ezAlert', '$q', function($rootScope, ezAlert, $q) {
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

    // FIXME implement the angular way
    getTrelloPlatformsList(function displayPlatformsTable(err, platforms) {
      service.loading = false;

      if (err) {
        deferred.reject(err);
        return ezAlert({
          title: "Erreur",
          content: "Une erreur est survenue lors de la récupération de la liste des plateformes.",
          ariaLabel: "Erreur récupération des plateformes"
        });
      }

      service.list = platforms;

      deferred.resolve(service.list);
      promise = null;
      $rootScope.$apply();
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
