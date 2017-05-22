app.service('IssuesService', ['AuthService', '$q', '$http', '$window', 'WEBSERVICE', '$rootScope',
    function(AuthService, $q, $http, $window, WEBSERVICE, $rootScope) {

    var service = this;
   
    //*************************************************************************
    //***** VARIABLES *********************************************************
    //*************************************************************************

    service.issues = [];
    service.issuesNumber = 0;
    service.issuesTypes = {};
    service.issueActive = [];
    service.issueActiveId = null;
    service.issuesFilter = '';

    service.newIssue = {
        point: [],
        description: '',
        tags: '',
        type: ''
    };

    service.requestStates = null;
    service.requestTypes = null;
    service.requestTypeHref = [];
    service.requestBounds = { polygon : [[46.791842, 6.627938], 
                                         [46.767753, 6.627938],
                                         [46.767753, 6.671556],
                                         [46.791842, 6.671556],
                                         [46.791842, 6.627938]] };
    
    service.newIssueToggle = null;
    service.detailActiveToggle = null;

    //*************************************************************************
    //***** METHODS ***********************************************************
    //*************************************************************************

    /**
     * General method for database queries used for issues
     * Update the variable service.issues
     * @return {Promise}
     */
    service.getIssues = function(page = 0) { 

        if(page == 0) {service.issues= []};  // empty the issues array

        var body = { $and : [] };

        // states selector
        var states = [];
        for(var k in service.requestStates) { 
            if(service.requestStates[k].checked) {states.push(service.requestStates[k].name)}
        }
        body.$and.push({ "state": { "$in": states }});

        // types selector
        var types = [];
        for(var k in service.requestTypes) {
            if(service.requestTypes[k].checked) {types.push(service.requestTypes[k].id)}
        }
        body.$and.push({ "issueType": { "$in": types }});

        // geographic zone selector
        body.$and.push({ "location": { $geoWithin: { $polygon : service.requestBounds.polygon }}}); 

        // string selector
        if(service.issuesFilter != '') {
            body.$and.push({ "description": { "$regex": service.issuesFilter, "$options": 'i' }});
        }
        
        return $http({
           headers : {
                'Authorization' : 'Bearer ' + AuthService.token,
                'Content-Type' : 'application/json' },     
            method : 'POST',
            url : WEBSERVICE.apiUrl + 'issues/searches?page='+page+'&pageSize=50&sort=updatedAt&include=creator&include=issueType',
            data : body
        }).then(function(res) {
            service.issues = service.issues.concat(res.data);
            service.issuesNumber = service.issues.length;
            console.log('page: '+page+', length: '+res.data.length+', length tot: '+service.issuesNumber);
            if(res.data.length == 50) {
                page++; 
                return service.getIssues(page);
            }
   
        }).catch(function(error) {
            console.log('getIssues ERROR:');
            console.log('http error: ' + error.status);
        })
    };
    // end of getIssues()



    /**
     * Method for database query used for types of issues
     * Update the variable service.issuesTypes
     * @return {Promise}
     */
    service.getIssuesTypes = function() {
        console.log('get issues types IS');
        return $http({
            headers : 'Bearer ' + AuthService.token,       
            method : 'GET',
            url : WEBSERVICE.apiUrl + 'issueTypes'
        }).then(function(res) {
            service.issuesTypes = res.data;
        }).catch(function(error) {
            console.log('getIssuesTypes');
            console.log('http error: ' + error.status);
        })
    };
    // end of getIssuesTypes()



    /**
     * Method for database query used for comments
     * Update the variable service.issueComments
     * @return {Promise}
     */
    service.getComments = function() {
        console.log('get comments');
        return $http({
            headers : 'Bearer ' + AuthService.token,       
            method : 'GET',
            url : WEBSERVICE.apiUrl + 'issues/'+service.issueActiveId+'/comments?include=author&sort=-updatedAt'
        }).then(function(res) {
            service.issueComments = res.data;
        }).catch(function(error) {
            console.log('getComments');
            console.log('http error: ' + error.status);
        })
    };
    // end of getComments()


    /**
     * Method to set new comment
     * @return {Promise}
     */
    service.addNewComment = function() {
        var body = service.newComment;
        return $http({
            headers : {
                'Authorization' : 'Bearer ' + AuthService.token,
                'Content-Type' : 'application/json' },        
            method : 'POST',
            url : WEBSERVICE.apiUrl + 'issues/'+service.issueActiveId+'/comments',
            data : body
        }).catch(function(error) {
            console.log('addNewComment');
            console.log('http error:' + error.status);
        });
    }



    /**
     * Method for new issue introduction in the databse
     * @param {Object} - New issues data
     * @return {Promise}
     */
    service.addIssue = function() {
        console.log('add issue');

        body = {
            description : service.newIssue.description,
            imageUrl : '',
            additionalImageUrls : [],
            issueTypeHref : "/api/issueTypes/"+service.newIssue.type,
            location : {
                coordinates : [service.newIssue.point.lng,
                               service.newIssue.point.lat],
                type : "Point"
            },
            tags : service.newIssue.tags
        };

        return $http({
            headers : {
                'Authorization' : 'Bearer ' + AuthService.token,
                'Content-Type' : 'application/json' 
            }, 
            method : 'POST',
            url : WEBSERVICE.apiUrl + 'issues',
            data : body
        }).then(function() {
            service.getIssues().then(function() {
                $rootScope.$broadcast('mapUpdate');
                $rootScope.$broadcast('filterUpdate');
                console.log('intro ok');
            });
        }).catch(function() {
            console.log('setNewIssue');
            console.log('http error:' + error.status);
        })
    };
    // end of setNewIssue()
    

    /**
     * Method to set the selected issue active
     * @param {Object} - The issue selected
     */
    service.setIssueActive = function() {
        console.log('set issue active');
        service.issues.map(function(i) { 
            if(i.id === service.issueActiveId) { service.issueActive = i; }
        });
        service.newIssueToggle = false;
        service.detailActiveToggle = true;
    }
    // End of setIssueActive()



    /**
     * Method to set bounds points
     * @param {float} lng1 - Longitude of top left point
     * @param {float} lat1 - Latitude of top left point
     * @param {float} lng2 - Longitude of bottom right point
     * @param {float} lat2 - Latitude of bottom right point
     */
    service.setBounds = function(lng1,lat1,lng2,lat2) {
        console.log('set bounds');
        var b = 1-(500/$window.innerWidth);
        var lng1_ = lng2-Math.abs(lng2-lng1)*b;
        service.requestBounds = {
            polygon :  [
                { lng: lng1_, lat: lat1 },
                { lng: lng1_, lat: lat2 },
                { lng: lng2, lat: lat2 },
                { lng: lng2, lat: lat1 },
                { lng: lng1_, lat: lat1 }]
        }
    }
    // End of setBounds()

}])