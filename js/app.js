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
var getInfoWindow = function(point) {
    var imgTag = "No Pictures Loaded";
    var articleHtml = '<br><div><h5>Nearby Wikipedia articles:</h5></div><div id="wiki">Loading wiki articles.</div>';
    point.articles = ko.observableArray(wiki.getWikiArticles(point));
    var picLen = point.pictures.length;
    if (picLen > 0){
        var randInt = getRandomInt(0, picLen-1);
        imgTag = "<img src=\""+ point.pictures[randInt] + "\" />";
    };
    if (point.articles().length > 0){
        articleHtml = '<ul>';
        for (var i = point.articles.length - 1; i >= 0; i--) {
            articleHtml += '<li>' + point.articles[i].title + '</li>';
        };
        articleHtml += '</ul>';
    }

    var infoHtml = '<div id=' + point.name + '><h4><a href="' +
                point.website + '">' + point.name +
                '</a></h4>Google Places Rating:(' + point.rating +') <br>' +
                point.phone + '<hr>' + imgTag + articleHtml

    point.infoWindow = new google.maps.InfoWindow({
        content: infoHtml
    });
    // open infoWindow
    point.infoWindow.open(map, point.marker);
}

// initialize point and creates marker and events
var point = function(place) {
    var self = this;
    self.name = place.name;
    self.gPlaceId = place.gID
    self.lat = ko.observable(place.lat);
    self.lon = ko.observable(place.lon);
    self.showPoint = ko.observable(place.vis);
    self.website = "#";
    self.pictures = [];
    self.articles = ko.observableArray([]);

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
            self.points().forEach(function(point){
                if(point.showPoint()){
                    point.marker.setMap(map);
                } else {
                    point.marker.setMap(null);
                }
            })
        },
        write: function (value) {
            var lValue = value.toLowerCase();
            self.points().forEach(function(point){
                if(aContainsB(point.name.toLowerCase(), lValue)){
                    point.showPoint(true);
                    point.marker.setMap(map);
                } else {
                    point.marker.setMap(null);
                    point.showPoint(false);
                }
            })
        }
    });
}
ko.applyBindings(viewModel);
