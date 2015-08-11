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
}]);
