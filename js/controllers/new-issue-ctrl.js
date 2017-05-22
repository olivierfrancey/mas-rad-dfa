app.controller('NewIssueCtrl', ['IssuesService', '$scope',
    function(IssuesService, $scope) {

    var issue = this;

    issue.data = {
        description: null,
        type: null,
        tags: null,
        point: {
            lng: null,
            lat: null
        }
    };
    issue.active = false;

    issue.addIssue = function(){
        IssuesService.newIssue.description = issue.data.description;

        if(issue.data.tags) { var tags = issue.data.tags.split(/[\s,;:.]+/); }
        
        IssuesService.newIssue.tags = tags;
        IssuesService.newIssue.type = issue.data.type;
        IssuesService.addIssue();
        issue.active = false;
    };

    /*issue.activeMode = function() {
        console.log('active');
        issue.issuesTypes = IssuesService.issuesTypes;
        issue.active = !issue.active;
        console.log(issue.active);
    }*/

    issue.close = function() {
        console.log('close');
        IssuesService.newIssueToggle = false;
        issue.active = IssuesService.newIssueToggle;
    };


    $scope.$on('newIssueToggle', function() {
        console.log('active');
        issue.issuesTypes = IssuesService.issuesTypes;
        issue.active = IssuesService.newIssueToggle;
    });

    $scope.$on('markerSelected', function() {
        issue.close();
    })

    $scope.$on('moveMarker', function() {
        issue.data.point.lng = IssuesService.newIssue.point.lng;
        issue.data.point.lat = IssuesService.newIssue.point.lat;
    })


}])