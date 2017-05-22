app.controller('ToggleCtrl', ['IssuesService', '$rootScope', '$scope', 
  function(IssuesService, $rootScope, $scope) {

  var toggle = this;

  toggle.active = false;

  toggle.activeMode = function() {
    toggle.active = !toggle.active;
    IssuesService.newIssueToggle = toggle.active;
    IssuesService.detailActiveToggle = false;
    $rootScope.$broadcast('newIssueToggle');
  }

  $scope.$on('markerSelected', function() {
    toggle.active = IssuesService.newIssueToggle;
  })
  
}])