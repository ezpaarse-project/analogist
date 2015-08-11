angular.module('WebApp')
.directive('ezAnalyzer', function () {
  return {
    restrict: 'E',
    templateUrl: '/partials/analyzer',
    scope: { analyses: '=' },
    controller: 'AnalyzerCtrl'
  };
});