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
.factory('platforms', ['$rootScope', 'ezAlert', function($rootScope, ezAlert) {
  var service = {};

  service.refresh = function () {
    service.loading = true;
    $rootScope.$apply();

    getTrelloPlatformsList(function displayPlatformsTable(err, platforms) {
      service.loading = false;
      if (err) {
        return ezAlert({
          title: "Erreur",
          content: "Une erreur est survenue lors de la récupération de la liste des plateformes.",
          ariaLabel: "Erreur récupération des plateformes"
        });
      }

      service.list = platforms;
      $rootScope.$apply();
    });
  };

  service.refresh();

  return service;
}]);
