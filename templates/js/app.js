var map;

// Create a new blank array for all the listing markers.
var markers = [];

//Create a new blank variable for infoWindow
var infoWindow;

//Defalt center for map (Center of Berlin)
var defaultCenterMap = {lat: 52.52000659999999, lng: 13.404954};

// Create placemarkers array to use in multiple functions to have control
// over the number of places that show.
var placeMarkers = [];

// Create placemarkers array for foursquare data.
var foursquareRating = 0;

// Chundo style by Adan for Google Map (https://snazzymaps.com/style/167/chundo-style)
var styles = [
    {
    "featureType": "landscape",
    "stylers": [
        {"hue": "#a4edff"},
        {"saturation": 34.48275862068968},
        {"lightness": -1.490196078431353},
        {"gamma": 1}
    ]},
    {"featureType": "road.highway",
    "stylers": [
        {"hue": "#f7b694"},
        {"saturation": -2.970297029703005},
        {"lightness": -17.815686274509815},
        {"gamma": 1}
    ]},
    {"featureType": "road.arterial",
    "stylers": [
        {"hue": "#FFE100"},
        {"saturation": 8.600000000000009},
        {"lightness": -4.400000000000006},
        {"gamma": 1}
    ]},
    {"featureType": "road.local",
    "stylers": [
        {"hue": "#00C3FF"},
        {"saturation": 29.31034482758622},
        {"lightness": -38.980392156862735},
        {"gamma": 1}
    ]},
    {"featureType": "water",
    "stylers": [
        {"hue": "#0078FF"},
        {"saturation": 0},
        {"lightness": 0},
        {"gamma": 1}
    ]},
    {"featureType": "poi",
    "stylers": [
        {"hue": "#00FF19"},
        {"saturation": -30.526315789473685},
        {"lightness": -22.509803921568633},
        {"gamma": 1}
    ]}
];


function initMap() {
    // Constructor creates a new map
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 52.52000659999999, lng: 13.404954},
      zoom: 12,
      styles: styles,
      mapTypeControl: false
    });

    ko.applyBindings(new ViewModel());
}

// Handle google map load failure
function ErrorMethod() {
    window.alert('Google Maps has failed to load');
}

// Location constructor
var Location = function(data) {
    var self = this;

    this.name = data.name;
    this.lat = data.lat;
    this.lng = data.lng;
    this.place_id = data.place_id;
    this.address = data.address;
    this.category = data.category;
    this.foursquare_id = data.foursquare_id;

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('checked');

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(this.lat, this.lng),
        foursquare_id: this.foursquare_id,
        map: map,
        icon: makeMarkerIcon(this.category),
        title: this.name,
        animation: google.maps.Animation.DROP,
        id: this.place_id,
        category: this.category,
        adress: this.address,
        visible: data.visible,
    });

    this.marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
    });

    this.marker.addListener('mouseout', function() {
        this.setIcon(makeMarkerIcon(this.category));
    });


    function makeMarkerIcon(category) {
        var iconBase = 'images/map-marker_';
        var markerImage = new google.maps.MarkerImage(
            iconBase + category + ".svg",
            // This marker is 40 pixels wide by 40 pixels high.
            new google.maps.Size(40, 40),
            // The origin for this image is (0, 0).
            new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (40, 40).
            new google.maps.Point(40, 40),
            new google.maps.Size(40,40));
        return markerImage;
    }

    markers.push(this.marker);




};

// Creating View model to apply knockout js
var ViewModel = function() {

    var self = this;

    this.placeList = ko.observableArray([]);

    //Add list of location to HTML
    berlinLocations.forEach(function(item){
        this.placeList.push(new Location(item));
    }, this);

    //Create an observable for filter input
    this.filter = ko.observable("");

    // button for responsive menu mode
    this.detailsEnabled = ko.observable(false);
    this.hideLocations = function() {
        if ($(window).width() < 991) {
            self.detailsEnabled(false);
        }
    };
    this.showLocations = function() {
        self.detailsEnabled(true);
    };

    if ($(window).width() > 991) {
        self.detailsEnabled(true);
    }

    this.hideMarkers = function () {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setVisible(false);
            map.setCenter(defaultCenterMap);
            map.setZoom(12);
        }
    };

    this.showAllMarkers = function () {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setVisible(true);
            map.setCenter(defaultCenterMap);
            map.setZoom(12);
        }
    };

    self.showCategoryMarkers = function (category) {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].category == category) {
                markers[i].setVisible(true);
                map.setCenter(defaultCenterMap);
                map.setZoom(12);
            } else {markers[i].setVisible(false);}
        }
    };

    self.showItemMarkers = function (name) {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].title == name.name) {
                markers[i].setVisible(true);
                map.setCenter(markers[i].position);
                map.setZoom(14);
                populateInfoWindow(markers[i], largeInfowindow);
                getPlacesDetails(markers[i], largeInfowindow);
            } else {markers[i].setVisible(false);}
        }
    };

    // In case the status is OK, which means the pano was found, compute the
    // position of the streetview image, then calculate the heading, then get a
    // panorama from that and set the options
    function getStreetView(marker, infowindow, status) {
        if (status == google.maps.StreetViewStatus.OK) {
            var nearStreetViewLocation = data.location.latLng;
            var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
            var panoramaOptions = {
                position: nearStreetViewLocation,
                pov: {
                    heading: heading,
                    pitch: 30
                }
            };
            var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
        }
    }


    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            // Clear the infowindow content to give the streetview time to load.
            infowindow.setContent('');
            infowindow.marker = marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
                marker.setAnimation(null);
            });
            var streetViewService = new google.maps.StreetViewService();
            var radius = 50;
            if (getStreetView(marker, infowindow, status)) {
                infowindow.setContent('<div><h4 id="location_title">' +
                                      marker.title + '</h4><p id="location_address">' +
                                      marker.adress + '</p></div><div id="pano"></div>');
            } else {infowindow.setContent('<div>' + marker.title + '</div>' +
                                        '<p id="location_address">' +
                                        marker.adress + '</p><div>No Street View Found</div>');}
            // Use streetview service to get the closest streetview image within
            // 50 meters of the markers position
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
            // Open the infowindow on the correct marker
            //Add animation to marker chosen
            for (var i = 0; i < markers.length; i++) {
                markers[i].setAnimation(null);
            }
            infowindow.open(map, marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }

    var largeInfowindow = new google.maps.InfoWindow();

    // Create an onclick event to open the large infowindow at each marker.
    function eventOnClickMArker (marker) {
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
            getPlacesDetails(this, largeInfowindow);
    });
    }

    for (var i = 0; i < markers.length; i++) {
        eventOnClickMArker (markers[i]);
    }

    // This is the PLACE DETAILS search - it's the most detailed so it's only
    // executed when a marker is selected, indicating the user wants more
    // details about that place.
    function getPlacesDetails(marker, infowindow) {
        foursquareInfo(marker, infowindow);


        var placeInfoWindow = new google.maps.InfoWindow();
        // If a marker is clicked, do a place details search on it in the next function.
            marker.addListener('click', function() {
                if (placeInfoWindow.marker == this) {
                    console.log("This infowindow already is on this marker!");
                } else {getPlacesDetails(this, placeInfoWindow);
                    }
            });

        placeMarkers.push(marker);
    }

    // Create a searchbox in order to execute a places search
    var searchBox = new google.maps.places.SearchBox(
        document.getElementById('places-search')
        );

    // Bias the searchbox to within the bounds of the map.
    searchBox.setBounds(map.getBounds());

    // This function firest when the user select "go" on the places search.
    // It will do a nearby search using the entered query string or place.
    this.textSearchPlaces = function () {
        var bounds = map.getBounds();
        var placesService = new google.maps.places.PlacesService(map);
        placesService.textSearch({
            query: self.filter(),
            bounds: bounds
        }, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                createMarkersForPlaces(results);
            } else {
                window.alert('We did not find any places matching that search!');
            }
        });
    };

    // This function fires when the user selects a searchbox picklist item.
    // It will do a nearby search using the selected query string or place.
    this.searchBoxPlaces = function (searchBox) {
        var places = searchBox.getPlaces();
        if (places.length === 0) {
            window.alert('We did not find any places matching that search!');
        } else {
        // For each place, get the icon, name and location.
            createMarkersForPlaces(places);
        }
    };

    // Listen for the event fired when the user selects a prediction from the
    // picklist and retrieve more details for that place.
    searchBox.addListener('places_changed', function() {
        self.searchBoxPlaces(this);
    });

// If a marker is clicked, do a place details search on it in the next function.
function markerListener(marker, placeInfoWindow) {
    marker.addListener('click', function() {
        if (placeInfoWindow.marker == this) {
            console.log("This infowindow already is on this marker!");
        } else {
            getPlacesDetails(this, placeInfoWindow);
        }
    });
}

    // This function creates markers for each place found in either places search.
    function createMarkersForPlaces(places) {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < places.length; i++) {
            var place = places[i];
            var icon = {
                url: 'images/map-marker_checked.svg',
                size: new google.maps.Size(40, 40),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(40, 40),
                scaledSize: new google.maps.Size(40, 40)
            };
        // Create a marker for each place.
            var marker = new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location,
                id: place.place_id
            });
            // Create a single infowindow to be used with the place details information
            // so that only one is open at once.
            var placeInfoWindow = new google.maps.InfoWindow();
            markerListener(marker, placeInfoWindow);
            placeMarkers.push(marker);
            if (place.geometry.viewport) {
            // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        }
        map.fitBounds(bounds);
    }

    this.filteredItems = ko.computed(function() {
        var filter = self.filter().toLowerCase();
        if (!filter) {
            self.showAllMarkers();
            return self.placeList();
        } else {
            self.hideMarkers();
            return ko.utils.arrayFilter(self.placeList(), function(item) {
                var match = (item.name.toLowerCase().indexOf(filter) != -1);
                item.marker.setVisible(match);
                return match;

            });
        }
    });

    function foursquareInfo(marker, infowindow) {
        var apiURL = 'https://api.foursquare.com/v2/venues/';
        var foursquareId = marker.foursquare_id;
        var foursquareClientID = 'BB2UQCLD41GAZFZH0QAC4UYIZ2ICEYAFJZQ1CW2CCVGMEM1S';
        var foursquareSecret ='HYGRHRIVCBJEPKCBAHDV05VUCFKNRDTHOEABZNEUY2QEPZP1';
        var foursquareVersion = '20170718';
        var venueFoursquareID = foursquareId;
        var foursquareURL = apiURL + venueFoursquareID +
                            '?client_id=' + foursquareClientID +
                            '&client_secret=' + foursquareSecret +
                            '&v=' + foursquareVersion;
        var foursquareLink = 'https://ru.foursquare.com/v/' + marker.foursquare_id;
        //var rating4sq = foursquareInfo(marker);
        var service = new google.maps.places.PlacesService(map);

        if (marker.foursquare_id) {
            $.ajax({
            url: foursquareURL,
            success: function(data) {
                foursquareRating = data.response.venue.rating;
                console.log(foursquareRating);
                dataToHTML (marker, infowindow, foursquareRating, foursquareLink);

            },
            error: function (jqXHR, exception) {
                if (jqXHR.status === 0) {
                    window.alert('Not connect.\n Verify Network.');
                } else if (jqXHR.status == 404) {
                    window.alert('Requested page not found. [404]');
                } else if (jqXHR.status == 500) {
                    window.alert('Internal Server Error [500].');
                } else if (exception === 'parsererror') {
                    window.alert('Requested JSON parse failed.');
                } else if (exception === 'timeout') {
                    window.alert('Time out error.');
                } else if (exception === 'abort') {
                    window.alert('Ajax request aborted.');
                } else {
                    window.alert('Uncaught Error.\n' + jqXHR.responseText);
                }
            },
            });
        } else {
            dataToHTML (marker, infowindow, foursquareRating, foursquareLink);
        }

    }


    function dataToHTML (marker, infowindow, foursquareRating, foursquareLink) {
        var service = new google.maps.places.PlacesService(map);
        service.getDetails({
            placeId: marker.id
        }, function(place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Set the marker property on this infowindow so it isn't created again.
                infowindow.marker = marker;
                var innerHTML = '<div>';
                if (place.name) {
                    innerHTML += '<strong>' + place.name + '</strong>';
                }
                if (place.formatted_address) {
                    innerHTML += '<br>' + place.formatted_address;
                }
                if (place.formatted_phone_number) {
                    innerHTML += '<br>' + place.formatted_phone_number;
                }
                if (place.website) {
                    innerHTML += '<br><br><a href="' + place.website +
                                 '">' + "Go to website!" + '</a>';
                }
                if (place.opening_hours) {
                    if (place.opening_hours.open_now === true) {
                        innerHTML += '<br><strong>It is open now!</strong><br>';
                    } else {
                        innerHTML += '<br><strong>Sorry, it is closed now!</strong><br>';}
                }
                if (marker.foursquare_id && foursquareRating > 0) {
                    innerHTML += '<br><a href=' + foursquareLink +
                                 ' target="_blank"><strong>Foursquare rating: ' +
                                 foursquareRating + '</strong></a><br>';
                } else {
                    innerHTML += '<br><strong>Sorry, there is no data on Foursquare rating' +
                                 '</strong></a><br>';
                }

                if (place.photos) {
                    innerHTML += '<br><img src="' + place.photos[1].getUrl(
                    {maxHeight: 100, maxWidth: 200}) + '">';
                }
                innerHTML += '</div>';
                infowindow.setContent(innerHTML);
                infowindow.open(map, marker);
                // Make sure the marker property is cleared if the infowindow is closed.
                infowindow.addListener('closeclick', function() {
                    infowindow.marker = null;
                });
            }
        });
    }


};
