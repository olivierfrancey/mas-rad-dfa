app.controller('MapCtrl', ['IssuesService', 'leafletMapEvents', 'leafletMarkersHelpers', '$scope', '$rootScope', '$uibModal', '$log',
    function(IssuesService, leafletMapEvents, leafletMarkersHelpers, $scope, $rootScope, $uibModal, $log) {

    var map = this;

    //*************************************************************************
    //***** VARIABLES *********************************************************
    //*************************************************************************

    var icon = {
        iconUrl: "./img/marker3.svg",
        iconSize: [30, 50],
        iconAnchor: [15, 50],
        popupAnchor: [0, -42],
    };

    var iconNew = {
        iconUrl: "./img/marker3_black.svg",
        iconSize: [30, 50],
        iconAnchor: [15, 50],
        popupAnchor: [0, -42],
    };

    map.issues = [];
    map.issuesTypes = [];
    map.issuesFilter = '';
    map.markers = [];
    map.newMarker = null;
    map.toggle = false;
    map.test = 'asdfjsif';
    map.newIssueAuth = true;

    map.bounds = {
        southWest: {
            lat: 46.791842,
            lng: 6.627938,
        },
        northEast: {
            lat: 46.767753,
            lng: 6.671556,
        }
    };

    map.center = {
        lng: 6.645626,
        lat: 46.781094, 
        zoom: 15
    };

    map.defaults = {
        zoomControlPosition: 'bottomright',
        layerOptions: { },
        tileLayerOptions: {
            opacity: 1,
            detectRetina: true,
            reuseTiles: true
        }
    }
        
    map.layers = {
        baselayers: {
            citizen_engagement: {
                name: 'Carte',
                url: "http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
                type: 'xyz'
            }
        },
        overlays: {
            markers: {
                type: 'group',
                name: 'Issues',
                visible: true
            },
            newmarker: {
                type: 'group',
                name: 'New issue',
                visible: true
            }
        }
    };

    map.polyline = {
        activeZone: {
            type: "polyline",
            color: '#FFFFFF',
            weight: 5,
            opacity: 0.7,
            latlngs: []
        }
    };



    //*************************************************************************
    //***** METHODS ***********************************************************
    //*************************************************************************

    /**
     * Method to set the markers
     * Create a new scope for the popover
     * The popover opens when the use click on the marker
     * @param {Object} obj - Objects to transform for marker requirement match
     */
    map.setMarkers = function() {
        console.log('set markers');
        map.polyline.activeZone.latlngs = IssuesService.requestBounds.polygon;
        map.markers = [];
        console.log(map.issues);
        map.issues.forEach(function(o) {
            var element = {
                id : o.id,
                layer: 'markers',
                lng : o.location.coordinates[0],
                lat : o.location.coordinates[1],
                //data : o,
                icon : icon
            };
            map.markers.push(element);
        })
        if(map.newMarker) { map.markers.push(map.newMarker); }
    }
    // end of setMarkers()



    /**
     * Method to re-init new marker array
     */
    map.clearNewMarker = function() {
        map.newMarker = null;
        map.newIssueAuth = true;
    }
    // end of clearNewMarker()



    /**
     * Method to automaticaly recenter the map
     * @param {float} lng - Longitude
     * @param {float} lat - Latitude
     */
    map.centerMap = function(lng, lat) {
        console.log('centerMap');
        map.center.lng = lng;
        map.center.lat = lat;
    }
    // end of centerMap()



    /**
     * Method to initiate new issue's insertion into Citizen Engagement
     */
    map.addIssueMode = function() {
        console.log('add issue mode');
        map.toggle = !map.toggle;
    }
    // end of addIssue()


    /**
     * 
     */
    map.addNewMarker = function() {
        console.log('newIssueAuth: '+map.newIssueAuth);
        if(map.newIssueAuth) {
            if(IssuesService.newIssue.point) {
                var element = {
                    id : 0,
                    layer: 'newmarker',
                    lng : IssuesService.newIssue.point.lng,
                    lat : IssuesService.newIssue.point.lat,
                    //data : o,
                    icon : iconNew,
                    draggable: true
                };
                map.markers.push(element);
                map.newIssueAuth = false;
            }   
        }  
    }
    // end of addNewMarker()

    /**
     * 
     */
    map.cancelNewMarker = function() {
        var k = -1;
        map.markers.forEach(function(m, key) {
            if(m.id === 0) { k = key; }
        })
        if(k != -1) { map.markers.splice(k, 1); }
    }


    //*************************************************************************
    //***** LISTENERS *********************************************************
    //*************************************************************************

    //*** Map listeners *******************************************************

    /**
     * Listener for map boundary update
     * Called when the map boundaries change
     */
    $scope.$on('leafletDirectiveMap.moveend', function() {
        IssuesService.setBounds(map.bounds.southWest.lng,map.bounds.southWest.lat,map.bounds.northEast.lng,map.bounds.northEast.lat);
        IssuesService.getIssues().then(function() {
            map.issues = IssuesService.issues;
            map.setMarkers();
            $rootScope.$broadcast('mapUpdate');
        });
    });
    // end of listener


    /**
     * Listener for new issue process activation
     */
    $scope.$on('leafletDirectiveMap.click', function (e, wrap) {
        IssuesService.issueActiveId = null;
        if(IssuesService.newIssueToggle) {
            IssuesService.issueActiveId = null;
            IssuesService.newIssue.point = wrap.leafletEvent.latlng;
            console.log(wrap.leafletEvent.latlng);
            map.addNewMarker();
        } else {
            //IssuesService.newIssueToggle = false;
            map.newIssueAuth = true;
            IssuesService.detailActiveToggle = false;
            $rootScope.$broadcast('markerSelected');
        }
    });
    // end of listener


    $scope.$on('leafletDirectiveMarker.move', function(e, wrap) {
        IssuesService.newIssue.point = wrap.leafletEvent.latlng;
        $rootScope.$broadcast('moveMarker');
    })


    /**
     * Listener for list and markers activation
     */
    $scope.$on('leafletDirectiveMarker.click', function(e, wrap) {
        console.log(wrap);
        IssuesService.issueActiveId = wrap.model.id;
        IssuesService.setIssueActive();
        IssuesService.newIssueToggle = false;
        //map.centerMap(wrap.model.lng, wrap.model.lat);
        IssuesService.getComments().then(function() {
            $rootScope.$broadcast('markerSelected');
        });
    });
    // end of listener






    //*** $rootScope listeners ************************************************

    /**
     * Listener for markers' list update
     * Listen $rootScope('filterUpdate') of SideListCtrl controller
     */
    $scope.$on('filterUpdate', function() {
        map.issues = IssuesService.issues;
        map.setMarkers();
    })
    // end of listener


    /**
     * Listener on the $rootScope('issueSelected')
     */
    $scope.$on('issueSelected', function() {
        map.setMarkerActive();
    })
    // end of listener


}])