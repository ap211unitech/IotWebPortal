
// Function to automatically trigger the Number Tag, after seeing changes.
; (function ($) {
    $.fn.extend({
        donetyping: function (callback, timeout) {
            timeout = timeout || 800; // 1 second default timeout
            var timeoutReference,
                doneTyping = function (el) {
                    if (!timeoutReference) return;
                    timeoutReference = null;
                    callback.call(el);
                };
            return this.each(function (i, el) {
                var $el = $(el);
                // Chrome Fix (Use keyup over keypress to detect backspace)
                // thank you @palerdot
                $el.is(':input') && $el.on('keyup keypress paste', function (e) {
                    // This catches the backspace button in chrome, but also prevents
                    // the event from triggering too preemptively. Without this line,
                    // using tab/shift+tab will make the focused element fire the callback.
                    if (e.type == 'keyup' && e.keyCode != 8) return;

                    // Check if timeout has been set. If it has, "reset" the clock and
                    // start over again.
                    if (timeoutReference) clearTimeout(timeoutReference);
                    timeoutReference = setTimeout(function () {
                        // if we made it here, our timeout has elapsed. Fire the
                        // callback
                        doneTyping(el);
                    }, timeout);
                }).on('blur', function () {
                    // If we can, fire the event since we're leaving the field
                    doneTyping(el);
                });
            });
        }
    });
})(jQuery);

// Function to create a new marker on the map.
function createMarker(lat, lon) {
    if (lat <= 90 && lat >= -90 && lon <= 180 && lon >= -180) {
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom',
        })
            .setLngLat([lon, lat])
            .addTo(map);
        // alert(lat + "---" + lon);


        map.flyTo({
            center: [lon, lat],
            zoom: 15,
            bearing: 0,

            // These options control the flight curve, making it move
            // slowly and zoom out almost completely before starting
            // to pan.
            speed: 1.4, // make the flying slow
            curve: 1.8, // change the speed at which it zooms out
            easing: function (t) {
                return t;
            },

            // this animation is considered essential with respect to prefers-reduced-motion
            essential: true
        });
    }
}

// Some Basic Logic.
var lat = 999;
var lon = 999;

$('#latitude').donetyping(function () {
    lat = document.getElementById('latitude').value;
    createMarker(lat, lon);
});


$('#longitude').donetyping(function () {
    lon = document.getElementById('longitude').value;
    createMarker(lat, lon);
});



//Access token yhaan dalo
mapboxgl.accessToken = 'pk.eyJ1IjoiYXJ5YW4wMTQxIiwiYSI6ImNrc21zbzJwaTBhMTYyb3A3MWpsd2M3eWQifQ.vH9l7ustzfMTQxOAcpfDww';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [75.778885, 26.922070],
    zoom: 10
});


//const bounds = new mapboxgl.LngLatBounds();

// locations.forEach((loc) => {
// Create marker
const el = document.createElement('div');
el.className = 'marker';

// Add marker
new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
})
    .setLngLat([75.7489, 26.9048])
    .addTo(map);

// Add popup
// new mapboxgl.Popup({
//   offset: 35,
// })
//   .setLngLat([75.7489, 26.9048])
//   .setHTML(`<p>Vaishali Nagar</p>`)
//   .addTo(map);




// It takes the slider form exactly in the center of the frame.
var w = -1 * ($("#content").width() / 2);
var len = w.toString() + "px";
document.getElementById('content').style.marginLeft = len;

var h = -1 * ($("#content").height() / 2);
len = h.toString() + "px";
document.getElementById('content').style.marginTop = len;
