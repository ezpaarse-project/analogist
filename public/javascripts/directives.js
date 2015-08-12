angular.module('WebApp')
.directive('ezAnalyzer', function () {
  return {
    restrict: 'E',
    templateUrl: '/partials/analyzer',
    controller: 'AnalyzerCtrl'
  };
});