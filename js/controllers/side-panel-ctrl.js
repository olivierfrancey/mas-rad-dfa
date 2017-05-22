app.controller('SidePanelCtrl', ['IssuesService', 'AuthService', 'HelpService', '$rootScope', '$scope', '$uibModal',
    function(IssuesService, AuthService, HelpService, $rootScope, $scope, $uibModal){

    var item = this;

    //*************************************************************************
    //***** VARIABLES *********************************************************
    //*************************************************************************

    item.issuesNumber = 0;
    
    item.active = false;

    item.issuesTypes = [];
    item.issuesStates = [ 
        {label: "New", name: "new", checked: true}, 
        {label: "In progress", name: "inProgress", checked: false}, 
        {label: "Resolved", name: "resolved", checked: false}, 
        {label: "Rejected", name: "rejected", checked: false} ];

    $scope.issuesStates = item.issuesStates; // point to item.issuesStates, required for $watch
    
    $scope.issuesFilter = ''; 

    item.comments = [];
    item.commentsNumber = 0;
    item.newComment = { text: '' };
    item.editComment = false;

    //*************************************************************************
    //***** METHODS ***********************************************************
    //*************************************************************************

    /**
     * Method to filter the data from the filter (item.issuesFiltered)
     * before to call IssuesService.getIssues() with the correct 
     * parameters.
     * Update the value of IssuesService.requestState
     * Update the value of IssuesService.requestType
     */
    item.getIssues = function() {
        console.log('get issues');
        item.loader = true;

        IssuesService.getIssues().then(function() {
            item.loader = false;
            item.issuesNumber = IssuesService.issuesNumber;
            console.log('number: '+item.issuesNumber);
            $rootScope.$broadcast('filterUpdate');
        });
    }
    // end of getIssues()



    /**
     * Method to get the issues' types
     * It calls the IssuesService method getIssuesTypes()
     * Updates the value of item.issuesTypes
     * And calls the internal method item.mergeIssueFilters()
     */
    item.getIssuesTypes = function() {
        console.log('get issues types');
        IssuesService.getIssuesTypes().then(
            function() { 
                item.issuesTypes = IssuesService.issuesTypes;
                item.issuesTypes.map(function(a) {
                    a.checked = true;
                })
                $scope.issuesTypes = item.issuesTypes;   // point to item.issuesTypes, required for $watch
                console.log('issuesTypes-2');
                console.log(item.issuesTypes);
            }         
        );
    }
    // end of getIssuesTypes()



    /**
     * Method called from the view to make a specific issue active
     * Broadcast the event 'issueSelected'
     * @param {String} id - ID of the issue selected
     */
    item.makeActive = function(id) {
        IssuesService.issueActiveId = id;
        item.setIssueActive();
        $rootScope.$broadcast('issueSelected');
    } 
    // end of makeActive()



    /**
     * Method the set an issue active
     * This method is called from the side-bar or from
     * the listener focused on 'markerSelected'
     */
    item.setIssueActive = function() {
        item.issueActive = IssuesService.issueActive;
        item.active = IssuesService.detailActiveToggle;
        item.setComments();   
    }
    // end of setIssueActive()



    /**
     * Method to set the comments list of the current issue
     * Give the muber of comments too
     */
    item.setComments = function() {
        item.comments = IssuesService.issueComments.reverse();
        item.commentsNumber = item.comments.length;
    }
    // end of setComments()



    /**
     * Method to manage Help modal openning
     */
    item.openHelpModal = function() {
        HelpService.modalInstance = $uibModal.open({
            templateUrl: './templates/help.html',
            controller: "HelpCtrl as h"
        });

        HelpService.modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }
    // end of openHelpModal()



    /**
     * Mathod to initiate search into the issues
     */
    item.issuesSearch = function() {
        IssuesService.issuesFilter = item.issuesFilter;
        item.getIssues();
        //$rootScope.$broadcast('updateFilter');
    }
    // end of issuesSearch()

    

    /**
     * Method to create new comment into the database
     */
    item.sendNewComment = function() {
        IssuesService.newComment = item.newComment;
        IssuesService.addNewComment().then(function() {
            IssuesService.getComments().then(function() {
                item.setComments();
            })
        });
    }
    // end of sendNewComment()



    /**
     * Method for initialisation of the map
     */
    item.init = function() {
        item.getIssuesTypes();
        item.getIssues();
        //item.userId = AuthService.userId;
        console.log(item.issuesTypes);
    }
    // end of init()


    //*************************************************************************
    //***** LISTENERS *********************************************************
    //*************************************************************************

    //*** Filter listeners ****************************************************

    /**
     * Look after $scope.issuesTypes changes
     */
    $scope.$watch('issuesTypes', function() {
        IssuesService.requestTypes = item.issuesTypes;
        item.getIssues()
    }, true);
    // end of listener



    /**
     * Look after $scope.issuesStates changes
     */
    $scope.$watch('issuesStates', function() {
        IssuesService.requestStates = item.issuesStates;
        item.getIssues();
    }, true);
    // end of listener



    /**
     * Look after $scope.issuesFilter changes
     */
    $scope.$watch('issuesFilter', function() {
        console.log($scope.issuesFilter);
        IssuesService.issuesFilter = $scope.issuesFilter;
        item.getIssues();
    }, true);
    // end of listener

    


    //*** $rootScope listeners ************************************************

    /**
     * Listener on the $rootScope('mapUpdate')
     */
    $scope.$on('mapUpdate', function() {
        item.issuesNumber = IssuesService.issuesNumber; 
    });
    // end of listener



    /**
     * Listener on the $rootScope('markerSelected') from MapCtrl controller
     */
    $scope.$on('markerSelected', function() {
        if(IssuesService.detailActiveToggle) {
            item.setIssueActive();
        } else {
            item.active = false;
        }
        
    });
    // end of listener


    $scope.$on('newIssueToggle', function() {
        item.active = false;
    })

}])