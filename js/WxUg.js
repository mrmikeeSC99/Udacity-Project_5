/**
 * WxUg namespace.
 */
if (typeof WxUg == "undefined") {
    var WxUg = {
        // Initialize the WxUg object.
        init : function() {
            this._APIKey = '17fcf3f7583d36c8';
        },

        getImage: function(width, height, map) {
            var bounds = map.getBounds();
            this._URL = 'http://api.wunderground.com/api/' +
                        this._APIKey +
                        '/radar/image.gif?' +
                        'maxlat=' + bounds.getNorthEast().lat() +
                        '&maxlon=' + bounds.getNorthEast().lng() +
                        '&minlat=' + bounds.getSouthWest().lat() +
                        '&minlon=' + bounds.getSouthWest().lng() +
                        '&width=' + width +
                        '&height=' + height +
                        '&rainsnow=1&timelabel=1&timelabel.x=525&timelabel.y=41&reproj.automerc=1';
            // console.log(this._URL);
            // console.log('w:' + width + ', h:' + height);

            var imageMapType = new google.maps.ImageMapType({
                getTileUrl: function(coord, zoom) {
                    console.log(WxUg._URL);
                    return WxUg._URL;
                },
                tileSize: new google.maps.Size(width, height)
            });
            map.overlayMapTypes.push(imageMapType);
        }
    };

    WxUg.init();
}
