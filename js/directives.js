angular.module('WebApp')
.directive('ezAnalyzer', function () {
  return {
    restrict: 'E',
    templateUrl: '/views/analyzer.html',
    scope: { analysis: '=' },
    controller: 'AnalyzerCtrl'
  };
});