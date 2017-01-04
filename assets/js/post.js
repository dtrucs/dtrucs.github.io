---
---
// Commentaires
var $buttonComment = document.getElementById("js-comments__button");
!!$buttonComment && $buttonComment.addEventListener("click", function() {
    var d = document, s = d.createElement('script');
    s.src = '//{{site.disqus-shortname}}.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    d.body.appendChild(s);
    this.classList.add("u-fade");
});

// Map
/**
 * Map Icons created by Scott de Jonge
 *
 * @version 3.0.0
 * @url http://map-icons.com
 *
 */

// Define Marker Shapes
var MAP_PIN = 'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z';
var SQUARE_PIN = 'M22-48h-44v43h16l6 5 6-5h16z';
var SHIELD = 'M18.8-31.8c.3-3.4 1.3-6.6 3.2-9.5l-7-6.7c-2.2 1.8-4.8 2.8-7.6 3-2.6.2-5.1-.2-7.5-1.4-2.4 1.1-4.9 1.6-7.5 1.4-2.7-.2-5.1-1.1-7.3-2.7l-7.1 6.7c1.7 2.9 2.7 6 2.9 9.2.1 1.5-.3 3.5-1.3 6.1-.5 1.5-.9 2.7-1.2 3.8-.2 1-.4 1.9-.5 2.5 0 2.8.8 5.3 2.5 7.5 1.3 1.6 3.5 3.4 6.5 5.4 3.3 1.6 5.8 2.6 7.6 3.1.5.2 1 .4 1.5.7l1.5.6c1.2.7 2 1.4 2.4 2.1.5-.8 1.3-1.5 2.4-2.1.7-.3 1.3-.5 1.9-.8.5-.2.9-.4 1.1-.5.4-.1.9-.3 1.5-.6.6-.2 1.3-.5 2.2-.8 1.7-.6 3-1.1 3.8-1.6 2.9-2 5.1-3.8 6.4-5.3 1.7-2.2 2.6-4.8 2.5-7.6-.1-1.3-.7-3.3-1.7-6.1-.9-2.8-1.3-4.9-1.2-6.4z';
var ROUTE = 'M24-28.3c-.2-13.3-7.9-18.5-8.3-18.7l-1.2-.8-1.2.8c-2 1.4-4.1 2-6.1 2-3.4 0-5.8-1.9-5.9-1.9l-1.3-1.1-1.3 1.1c-.1.1-2.5 1.9-5.9 1.9-2.1 0-4.1-.7-6.1-2l-1.2-.8-1.2.8c-.8.6-8 5.9-8.2 18.7-.2 1.1 2.9 22.2 23.9 28.3 22.9-6.7 24.1-26.9 24-28.3z';
var SQUARE = 'M-24-48h48v48h-48z';
var SQUARE_ROUNDED = 'M24-8c0 4.4-3.6 8-8 8h-32c-4.4 0-8-3.6-8-8v-32c0-4.4 3.6-8 8-8h32c4.4 0 8 3.6 8 8v32z';

// Function to do the inheritance properly
// Inspired by: http://stackoverflow.com/questions/9812783/cannot-inherit-google-maps-map-v3-in-my-custom-class-javascript
var inherits = function(childCtor, parentCtor) {
    /** @constructor */
    function tempCtor() {};
    tempCtor.prototype = parentCtor.prototype;
    childCtor.superClass_ = parentCtor.prototype;
    childCtor.prototype = new tempCtor();
    childCtor.prototype.constructor = childCtor;
};

function Marker(options){
    google.maps.Marker.apply(this, arguments);

    if (options.map_icon_label) {
        this.MarkerLabel = new MarkerLabel({
            map: this.map,
            marker: this,
            text: options.map_icon_label
        });
        this.MarkerLabel.bindTo('position', this, 'position');
    }
}

// Apply the inheritance
inherits(Marker, google.maps.Marker);

// Custom Marker SetMap
Marker.prototype.setMap = function() {
    google.maps.Marker.prototype.setMap.apply(this, arguments);
    (this.MarkerLabel) && this.MarkerLabel.setMap.apply(this.MarkerLabel, arguments);
};

// Marker Label Overlay
var MarkerLabel = function(options) {
    var self = this;
    this.setValues(options);

    // Create the label container
    this.div = document.createElement('div');
    this.div.className = 'map-icon-label';

    // Trigger the marker click handler if clicking on the label
    google.maps.event.addDomListener(this.div, 'click', function(e){
        (e.stopPropagation) && e.stopPropagation();
        google.maps.event.trigger(self.marker, 'click');
    });
};

// Create MarkerLabel Object
MarkerLabel.prototype = new google.maps.OverlayView;

// Marker Label onAdd
MarkerLabel.prototype.onAdd = function() {
    var pane = this.getPanes().overlayImage.appendChild(this.div);
    var self = this;

    this.listeners = [
        google.maps.event.addListener(this, 'position_changed', function() { self.draw(); }),
        google.maps.event.addListener(this, 'text_changed', function() { self.draw(); }),
        google.maps.event.addListener(this, 'zindex_changed', function() { self.draw(); })
    ];
};

// Marker Label onRemove
MarkerLabel.prototype.onRemove = function() {
    this.div.parentNode.removeChild(this.div);

    for (var i = 0, I = this.listeners.length; i < I; ++i) {
        google.maps.event.removeListener(this.listeners[i]);
    }
};

// Implement draw
MarkerLabel.prototype.draw = function() {
    var projection = this.getProjection();
    var position = projection.fromLatLngToDivPixel(this.get('position'));
    var div = this.div;

    this.div.innerHTML = this.get('text').toString();

    div.style.zIndex = this.get('zIndex'); // Allow label to overlay marker
    div.style.position = 'absolute';
    div.style.display = 'block';
    div.style.left = (position.x - (div.offsetWidth / 2)) + 'px';
    div.style.top = (position.y - div.offsetHeight) + 'px';

};

function initMap() {

    var map,
        geocoder = new google.maps.Geocoder(),
        bounds = new google.maps.LatLngBounds(),
        $coordinates = document.querySelector('.js-map-coordinates');

    if (!$coordinates) {
        return;
    }

    var from = $coordinates.dataset.from || false,
        to = $coordinates.dataset.to || false,
        polylines = $coordinates.dataset.polylines || false;

    function codeAddress(address, step) {
        geocoder.geocode( { 'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                step(results[0].geometry.location);
            }
        });
    }

    function step1(lngLat) {
        map = new google.maps.Map(document.getElementById('map'), {
            center: lngLat,
            scrollwheel: false,
            zoom: 8,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            styles: [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#e9e9e9"},{"lightness":17}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":21}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]}]
        });
        from = lngLat;
        bounds.extend(from);

        if (!to) {
            new Marker({
                map: map,
                position: from,
                icon: {
                    path: MAP_PIN,
                    fillColor: '#9d9c95',
                    fillOpacity: 1,
                    strokeColor: '',
                    strokeWeight: 0
                },
                map_icon_label: '<span class="u-map-icon u-map-icon--walking"></span>'
            });
            return;
        }
        codeAddress(to, step2);
    }

    function step2(lngLat) {
        to = lngLat;


        if (polylines) {
            var path = [from, to];

            var flightPath = new google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: '#33d996',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });

            for (var i = 0; i < path.length; i++) {
                new Marker({
                    map: map,
                    position: path[i],
                    icon: {
                        path: SQUARE_PIN,
                        fillColor: '#47dbb4',
                        fillOpacity: 1,
                        strokeColor: '',
                        strokeWeight: 0
                    },
                    map_icon_label: '<span class="u-map-icon u-map-icon--airport"></span>'
                });
            }

            flightPath.setMap(map);

        } else {

            var directionsDisplay = new google.maps.DirectionsRenderer({
                map: map
            });

            // Set destination, origin and travel mode.
            var request = {
              destination: to,
              origin: from,
              travelMode: 'TRANSIT'
            };

            // Pass the directions request to the directions service.
            var directionsService = new google.maps.DirectionsService();
            directionsService.route(request, function(response, status) {
              if (status == 'OK') {
                // Display the route on the map.
                directionsDisplay.setDirections(response);
              }
            });
        }

        bounds.extend(to);
        map.fitBounds(bounds);
    }


    if (!from) {
        return;
    }

    codeAddress(from, step1);

    google.maps.event.addDomListener(window, 'resize', function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
    });

}
google.maps.event.addDomListener(window, 'load', initMap);
