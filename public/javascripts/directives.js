angular.module('WebApp')
.directive('ezAnalyzer', function () {
  return {
    restrict: 'E',
    templateUrl: '/partials/analyzer',
    scope: { analyses: '=ezAnalyses', authorized: '=ezAuthorized' },
    controller: 'AnalyzerCtrl'
  };
})
.directive('ezAvatar', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: { user: '=avatarUser' },
    template: '<div class="avatar">'
            +'<span ng-hide="::user.avatarHash" title="{{ ::user.fullName }} (@{{ ::user.username }})" class="initials">{{ ::user.initials }}</span>'
            + '<img ng-show="::user.avatarHash" title="{{ ::user.fullName }} (@{{ ::user.username }})" ng-src="https://trello-avatars.s3.amazonaws.com/{{ ::user.avatarHash }}/{{ ::(size == \'small\' ? 30 : 50) }}.png">'
            + '</div>'
  };
});