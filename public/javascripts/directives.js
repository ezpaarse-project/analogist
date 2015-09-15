angular.module('WebApp')
.directive('ezAnalyzer', function () {
  return {
    restrict: 'E',
    templateUrl: '/partials/analyzer',
    scope: { analyses: '=ezAnalyses', authorized: '=ezAuthorized' },
    controller: 'AnalyzerCtrl'
  };
});