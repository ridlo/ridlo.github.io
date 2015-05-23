/**
* Qibla Finder using Google Maps Javascript API
* Copyleft (c) 2015 - Ridlo W. Wibowo
*/

/****************** Qibla finder map *****************/
// kaaba coordinates
var kaabaLat = 21.42251; // N
var kaabaLng = 39.826181; // E
var geoPoly;
var kaabaMarker;
var locMarker;
var qiblaMap;


var iconKaaba = {
    url: "static/images/kaaba.png",
    scaledSize: new google.maps.Size(35, 35),
    origin: new google.maps.Point(0,0),
    anchor: new google.maps.Point(20,20)
};

function initialize(){
    // maps Options
    var mapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(-7.7409531,109.5590196), // ! using Cookies?
        mapTypeId:google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
        }
    };

    // init map
    qiblaMap = new google.maps.Map(document.getElementById('qiblaMap'), mapOptions);

    // marker
    kaabaMarker = new google.maps.Marker({
        map: qiblaMap,
        draggable: false,
        icon: iconKaaba,
        position: new google.maps.LatLng(kaabaLat, kaabaLng)
    });

    locMarker = new google.maps.Marker({
        map: qiblaMap,
        title: 'Click to center!',
        icon: 'static/images/tuzki2.gif',
        crossOnDrag: false,
        draggable: true,
        position: new google.maps.LatLng(-7.7409531,109.5590196)
    });

    // minimum "bound" between two coordinates
    var defaultBounds = new google.maps.LatLngBounds(kaabaMarker.getPosition(), locMarker.getPosition());
    qiblaMap.fitBounds(defaultBounds);


    var contentString = '<strong>Hello</strong>, this is Tuzki!<br>Have you prayed?';

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });

    // event listener
    google.maps.event.addListener(locMarker, 'position_changed', update); // always draw great circle

    google.maps.event.addListener(locMarker, 'click', function(){
        qiblaMap.panTo(locMarker.getPosition());
    }); // left click on marker: map center

    google.maps.event.addListener(locMarker, 'rightclick', function(){
        infowindow.open(qiblaMap, locMarker);
    }); // right click on marker: info window

    google.maps.event.addListener(qiblaMap, 'rightclick', function(event){
        locMarker.setPosition(event.latLng);
        qiblaMap.panTo(event.latLng);
    }); // right click on map: change marker position


    // geodesic polygon options
    var geoPolyOptions = {
        strokeColor: '#0BD900',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        geodesic: true,
        map: qiblaMap
    };
    geoPoly = new google.maps.Polyline(geoPolyOptions);

    // search box
    var input = (document.getElementById('pac-input'));

    // push input controls position on Map
    qiblaMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var searchBox = new google.maps.places.SearchBox((input));

    // search event handler
    google.maps.event.addListener(searchBox, 'places_changed', function(){
        var places = searchBox.getPlaces();
        if (places.length == 0){return;}
        for (var i=0, place; place=places[i]; i++){
            locMarker.setPosition(place.geometry.location); // get location of place
            qiblaMap.panTo(locMarker.getPosition()); // move to the center
            qiblaMap.setZoom(15);} // change zoom 
    });

    // Bias the SearchBox results towards places that are within the bounds of the
    // current map's viewport.
    google.maps.event.addListener(qiblaMap, 'bounds_changed', function(){
        var bounds = qiblaMap.getBounds();
        searchBox.setBounds(bounds);
    });

    // add full screen botton
    var fsControldiv = document.createElement('div');
    var fsControl = new fullScreenControl(fsControldiv, qiblaMap); 
    qiblaMap.controls[google.maps.ControlPosition.TOP_LEFT].push(fsControldiv);

    update();
}

function update(){
    var greatCirclePath = [locMarker.getPosition(), kaabaMarker.getPosition()];
    geoPoly.setPath(greatCirclePath);

    var direction = google.maps.geometry.spherical.computeHeading(greatCirclePath[0], greatCirclePath[1]);
    var distance = google.maps.geometry.spherical.computeDistanceBetween(greatCirclePath[0], greatCirclePath[1]);

    var lat = degToMinsec(greatCirclePath[0].lat());
    var lng = degToMinsec(greatCirclePath[0].lng());

    document.getElementById('lat').innerHTML = lat[0] + '&deg; ' + lat[1] + "&#39; " + lat[2] + "&#39;&#39;";
    document.getElementById('lng').innerHTML = lng[0] + '&deg; ' + lng[1] + "&#39; " + lng[2] + "&#39;&#39;";
    document.getElementById('distance').innerHTML = (distance/1000.0).toFixed(2) + ' km';

    var azimuthText;
    if (direction > 0.0){
        azimuthText = " E of N";}
    else{
        azimuthText = " W of N";}
    document.getElementById('direction').innerHTML = '<strong style="color: #AA5544">' + Math.abs(direction.toFixed(3))  + '&deg;</strong>' + azimuthText;
}


// add full screnn button in map
function fullScreenControl(controlDiv, map){
    // CSS for the control border
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '2px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginTop = '16px';
    controlUI.style.marginLeft = '16px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'full screen mode';
    controlDiv.appendChild(controlUI);

    // CSS for the control interior
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto, Arial, san-serif';
    controlText.style.fontSize = '15px';
    controlText.style.lineHeight = '26px';
    controlText.style.paddingLeft = '7px';
    controlText.style.paddingRight = '7px';
    controlText.style.paddingTop = '2px';
    controlText.innerHTML = '<span class="glyphicon glyphicon-fullscreen" aria-hidden="true">';
    controlUI.appendChild(controlText);

    google.maps.event.addDomListener(controlUI, 'click', function(){
        window.open("./embed.html", "_self");
    });
}


// add DOM Listener
google.maps.event.addDomListener(window, 'load', initialize);


/************** My Calculator ************/
function findQibla(lat, lng){
    // kaaba coordinates in radian
    var kaabaLat = 0.37389333354;
    var kaabaLng = 0.69509798694;

    lat = lat*Math.PI/180.0; // convert to radian
    lng = lng*Math.PI/180.0;

    // S. Kamal Abdali: http://www.geomete.com/abdali/papers/qibla.pdf
    // A.E. Roy & D. Clarke, Astronomy: Principles & Practices (four-parts formula)
    var dLng = kaabaLng - lng;
    var angleQibla = Math.atan2(Math.sin(dLng), Math.cos(lat) * Math.tan(kaabaLat) - Math.sin(lat) * Math.cos(dLng));

    return angleQibla*180.0/Math.PI // return in degree
}

function getQibla(){
    var qiblainfo = document.getElementById('qiblaMessage');
    var lat = document.getElementById('latitude').value;
    var lng = document.getElementById('longitude').value;
    lat = parseFloat(lat); lng = parseFloat(lng);

    messageString = '<div class="alert alert-danger alert-dismissible" role="alert" style="font-family: Roboto">'+
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'+
                    '<span aria-hidden="true">&times;</span></button>';

    if (isNaN(lat) || isNaN(lng)){
        return qiblainfo.innerHTML = messageString + '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>' + "&nbsp;No/non-numeric entry/entries" + '</div>';} 
    else if (lat < -90.0 || lat > 90.0 || lng < -180.0 || lng > 180.0){
        return qiblainfo.innerHTML = messageString + '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>' + "&nbsp;Entry should be: <br>-90&deg; &lt; &phi; &lt; 90&deg; <br> -180&deg; &lt; &lambda; &lt; 180&deg;" + '</div>';}
    else if (lat == 90 || lat == -90) {
        return qiblainfo.innerHTML = messageString + "Ugh cold, face to 39.826&deg; E direction." + '</div>';} 
    else if (lat == 21.42251 && lng == 39.826181){
        return qiblainfo.innerHTML = messageString + "You are near Ka'aba!" + '</div>';} 
    else if (lat == -21.42251 && lng == -140.173819){
        return qiblainfo.innerHTML = messageString + "Any direction is correct." + '</div>';} 
    else{
        locMarker.setPosition(new google.maps.LatLng(lat, lng));
        qiblaMap.panTo(locMarker.getPosition());
        return qiblainfo.innerHTML = "";
    }
}

function degToMinsec(angle){
    var absAngle = Math.abs(angle); 
    var degFloor = Math.floor(absAngle);
    var min = (absAngle - degFloor)*60.0; 
    var minFloor = Math.floor(min);
    var sec = (min - minFloor)*60.0;
    if (angle < 0){degFloor = -1.0*degFloor;}
    return [degFloor, minFloor, sec.toFixed(1)]
}
