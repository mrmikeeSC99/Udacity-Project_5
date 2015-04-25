// points.name Filter logic
//     http://adripofjavascript.com/blog/drips/determining-if-a-string-contains-another-string-in-javascript-three-approaches.html
function aContainsB(a, b) {
    return a.indexOf(b) >= 0;
}

// * Returns a random integer between min and max *
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// API call to Google Places for pictures of point
function getPlaceData(point) {
    var request = {
      placeId: point.gPlaceId
    };
    function callback(place, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        if (place.photos.length > 0) {
            for (var i = 0; i < place.photos.length; i++) {
                point.pictures.push(place.photos[i].getUrl({'maxWidth': 200, 'maxHeight': 200}) );
            }
        }
        if (place.website.length > 0) {
            point.website = place.website;
        }
        point.rating = place.rating;
        point.phone = place.formatted_phone_number;
        //console.log(place);
      }
    }
    service = new google.maps.places.PlacesService(map);
    service.getDetails(request, callback);
}

// builds Info Window for each point
function getInfoWindow(point) {
    var imgTag = "No Pictures Loaded";
    var picLen = point.pictures.length;
    if (picLen > 0){
        var randInt = getRandomInt(0, picLen-1);
        imgTag = "<img src=\""+ point.pictures[randInt] + "\" />";
    };
    point.infoWindow = new google.maps.InfoWindow({
        content: '<h4><a href="' + point.website +'">' +
                point.name + ' (' + point.rating + ')</a></h4> ' +
                point.phone + '<hr>' + imgTag
    });
    point.infoWindow.open(map, point.marker);
}

// initialize point and creates marker and events
var point = function(place) {
    var self = this;
    self.name = place.name;
    self.gPlaceId = place.gID
    self.lat = ko.observable(place.lat);
    self.long = ko.observable(place.lon);
    self.showPoint = ko.observable(place.vis);
    self.website = "#";
    self.pictures = [];

    self.marker = new google.maps.Marker({
        position: new google.maps.LatLng(place.lat, place.lon),
        title: name,
        draggable: false
    });
    getPlaceData(self); // query Google Places for data
    google.maps.event.addListener(self.marker, 'click', function(){
        getInfoWindow(self);
    });
}

// If document is wider than 480px, isDraggable = true, else isDraggable = false
// This helps small touch screen devices scroll the page and not the map
var mapIsDraggable = $(document).width() > 480 ? true : false;

var map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 9,
    center: new google.maps.LatLng(28.1, -81.65),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    draggable: mapIsDraggable,
    // Prevent users to start zooming the map when scrolling down the page
    scrollwheel: false,
});

var places = [
    {name:'Bahama Breeze Rest.', lat:28.374862, lon:-81.503276, vis:true, gID:'ChIJMzBnSzqA3YgRxUjTjYitEmo'},
    {name:'T-Rex', lat:28.371230, lon:-81.516516, vis:true, gID:'ChIJO3vjMIF_3YgRqb3SdwzbyII'},
    {name:'Ghirardelli Chocolate', lat:28.371714, lon:-81.514727, vis:true, gID:'ChIJO3vjMIF_3YgRr722QH2ejWA'},
    {name:'Krispy Kreme Donuts', lat:28.331984, lon:-81.496378, vis:true, gID:'ChIJjxbTcOuB3YgRoj_mN2fV8n4'},
    {name:'LegoLand', lat:27.989059, lon:-81.690988, vis:true, gID:'ChIJ38rlfogN3YgRGic46M9dbLw'},
    {name:'Orlando Airport', lat:28.544487, lon:-81.335126, vis:true, gID:'ChIJO3IVTy5l54gRj2XJrRHH13Y'},
];

var viewModel = function() {
    var self = this;
    self.points = ko.observableArray([]);
    // load the place data
    places.forEach(function(place){
        self.points.push(new point(place));
    });
    self.listClick = function(point){
        getInfoWindow(point);
    };
    // WRITEABLE KO computed observable
    //     http://knockoutjs.com/documentation/computed-writable.html
    //     http://knockoutjs.com/documentation/computed-reference.html
    self.toggleShow = ko.computed({
        read: function () {
            for (point in self.points()){
                if(self.points()[point].showPoint()){
                    self.points()[point].marker.setMap(map);
                } else {
                    self.points()[point].marker.setMap(null);
                }
            }
        },
        write: function (value) {
            var lValue = value.toLowerCase();
            for (point in self.points()){
                if(aContainsB(self.points()[point].name.toLowerCase(), lValue)){
                    self.points()[point].showPoint(true);
                    self.points()[point].marker.setMap(map);
                } else {
                    self.points()[point].marker.setMap(null);
                    self.points()[point].showPoint(false);
                }
            }
        }
    });
}
ko.applyBindings(viewModel);
