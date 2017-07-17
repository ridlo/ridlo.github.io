/**
* QiblaFinder.js
* version 0.1 embed
* Ref: "Google Maps Javascript API"
* Copyright (c) 2015 - Ridlo W. Wibowo
* Icons by Arif Ridwan Abriyanto
*
* LICENSE
* QiblaFinder.js is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* QiblaFinder.js is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details <http://www.gnu.org/licenses/>.
*/

/****************** Qibla Finder on google maps *****************/
// kaaba coordinates
var kaabaLat = 21.4225; // N
var kaabaLng = 39.8262; // E
var geoPoly;
var kaabaMarker;
var locMarker;
var qiblaMap;

// default position
var pos = { 
  lat: -7.7409531,
  lng: 109.5590196
};


// kaaba icon setting
var iconKaaba = {
    url: "static/images/icon-kaaba.png",
    title: "Kaaba Position",
    scale: 0.5
};

var iconLoc = {
    url: 'static/images/icon-shalat2.gif',
    scale: 1
};

// init function for google maps
function initialize(){

    var contentString = '<strong>Hello</strong>, this is Mas Jo!<br>Have you prayed?';
    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });

    // maps Options
    var mapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(pos),
        mapTypeId:google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        fullscreenControl: true,
        fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
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
        icon: iconLoc,
        crossOnDrag: false,
        draggable: true,
        position: new google.maps.LatLng(pos)
    });

    // minimum "bound" between two coordinates
    var defaultBounds = new google.maps.LatLngBounds(kaabaMarker.getPosition(), locMarker.getPosition());
    qiblaMap.fitBounds(defaultBounds);

    // event listener
    // always draw great circle
    google.maps.event.addListener(locMarker, 'position_changed', update); 

    google.maps.event.addListener(locMarker, 'click', function(){
        qiblaMap.panTo(locMarker.getPosition());
    }); // left click on marker: map center

    google.maps.event.addListener(locMarker, 'rightclick', function(){
        infowindow.open(qiblaMap, locMarker);
    }); // right click on marker: info window

    google.maps.event.addListener(kaabaMarker, 'click', function(){
        qiblaMap.panTo(kaabaMarker.getPosition());
        // console.log(kaabaMarker.getPosition());
    }); // left click on kaaba marker: map center

    google.maps.event.addListener(qiblaMap, 'rightclick', function(event){
        locMarker.setPosition(event.latLng);
        qiblaMap.panTo(event.latLng);
    }); // right click on map: change marker position


    // geodesic polygon options
    var geoPolyOptions = {
        strokeColor: '#0BD900',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        geodesic: true,
        map: qiblaMap
    };
    geoPoly = new google.maps.Polyline(geoPolyOptions);

    // search box
    var input = (document.getElementById('pac-input'));
    var searchBox = new google.maps.places.SearchBox(input);
    // push input controls position on Map
    qiblaMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards places that are within the bounds of the
    // current map's viewport.
    google.maps.event.addListener(qiblaMap, 'bounds_changed', function(){
        searchBox.setBounds(qiblaMap.getBounds());
    });

    // search event handler
    google.maps.event.addListener(searchBox, 'places_changed', function(){
        var places = searchBox.getPlaces();
        
        if (places.length == 0){return;}

        for (var i=0, place; place=places[i]; i++){
            locMarker.setPosition(place.geometry.location); // get location of place
            qiblaMap.panTo(locMarker.getPosition()); // move to the center
            qiblaMap.setZoom(15);} // change zoom 
    });


    /* ---------------------- */
    // add exit full screen botton
    var efsControldiv = document.createElement('div');
    var efsControl = new exitFSControl(efsControldiv, qiblaMap); 
    qiblaMap.controls[google.maps.ControlPosition.TOP_LEFT].push(efsControldiv);

    // add legend panel
    var legend = document.getElementById('legend');
    qiblaMap.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);

    update();
}

// update function for position_changed event
function update(){
    var greatCirclePath = [locMarker.getPosition(), kaabaMarker.getPosition()];
    geoPoly.setPath(greatCirclePath);

    var direction = google.maps.geometry.spherical.computeHeading(greatCirclePath[0], greatCirclePath[1]);
    var distance = google.maps.geometry.spherical.computeDistanceBetween(greatCirclePath[0], greatCirclePath[1]);

    var lat = degToMinsec(greatCirclePath[0].lat());
    var lng = degToMinsec(greatCirclePath[0].lng());

    /* full screen mode */
    document.getElementById('lat').innerHTML = '<td><strong>Latitude</strong></td><td>' + lat[0] + '&deg; ' + lat[1] + "&#39; " + lat[2] + "&#39;&#39;</td>";
    document.getElementById('lng').innerHTML = '<td><strong>Longitude</strong></td><td>' +lng[0] + '&deg; ' + lng[1] + "&#39; " + lng[2] + "&#39;&#39;</td>";
    document.getElementById('distance').innerHTML = '<td><strong>Distance</strong></td><td>' + (distance/1000.0).toFixed(2) + ' km</td>';

    var azimuthText;
    if (direction > 0.0){
        azimuthText = " E of N";}
    else{
        azimuthText = " W of N";}
    document.getElementById('direction').innerHTML = '<td><strong>Qibla Direction</strong></td><td>' + '<strong style="color: #AA5544">' + Math.abs(direction.toFixed(3))  + '&deg;</strong>' + azimuthText + '</td>';
}


/* add exit full screen button in map */
function exitFSControl(controlDiv, map){
    // CSS for the control border
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '2px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginTop = '10px';
    controlUI.style.marginLeft = '16px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'exit full screen';
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
    controlText.innerHTML = '<span class="glyphicon glyphicon-resize-small" aria-hidden="true">';
    controlUI.appendChild(controlText);

    google.maps.event.addDomListener(controlUI, 'click', function(){
        window.open("./", "_self");
    });
}


// Try HTML5 geolocation.
function getloc(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            console.log(pos);
            initialize();
        }, function (error) { 
            if (error.code == error.PERMISSION_DENIED)
                console.log("you denied me :-(");
                initialize();
        });
    } else {
      // Browser doesn't support Geolocation
      console.log("Browser doesn't support Geolocation");
      initialize();
    }
}


// add DOM Listener on window load
// google.maps.event.addDomListener(window, 'load', getloc);
// google.maps.event.addDomListener(window, 'load', initialize);


/************** Own Calculator: Spherical Earth ************/
function findQibla(lat, lng){
    // kaaba coordinates in radian
    var kaabaLat = 0.37389315900848524;
    var kaabaLng = 0.6950983185577657;

    lat = lat*0.017453292519943295; // convert to radian
    lng = lng*0.017453292519943295;

    // S. Kamal Abdali: http://www.geomete.com/abdali/papers/qibla.pdf
    // A.E. Roy & D. Clarke, Astronomy: Principles & Practices (four-parts formula)
    var dLng = kaabaLng - lng;
    var angleQibla = Math.atan2(Math.sin(dLng), Math.cos(lat) * Math.tan(kaabaLat) - Math.sin(lat) * Math.cos(dLng));

    return angleQibla*180.0/Math.PI // return in degree
}

// WGS84: http://en.wikipedia.org/wiki/Vincenty%27s_formulae
// function findQiblaEllipsoid(lat, lng){
//     pass;
// }

function getQibla(){
    var qiblainfo = document.getElementById('qiblaMessage');
    var lat = document.getElementById('latdeg').value;
    var lng = document.getElementById('longdeg').value;
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
        console.log(findQibla(lat, lng));
        locMarker.setPosition(new google.maps.LatLng(lat, lng));
        qiblaMap.panTo(locMarker.getPosition());
        return qiblainfo.innerHTML = "";
    }
}

function getQiblaMin(){
    var qiblainfo = document.getElementById('qiblaMessageMin');
    var latDeg = document.getElementById('latDeg').value; // string
    var latMin = document.getElementById('latMin').value; 
    var latSec = document.getElementById('latSec').value;

    var lonDeg = document.getElementById('lonDeg').value; 
    var lonMin = document.getElementById('lonMin').value; 
    var lonSec = document.getElementById('lonSec').value;

    lat = minsecToDeg(latDeg, latMin, latSec);
    lng = minsecToDeg(lonDeg, lonMin, lonSec);

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
        console.log(findQibla(lat, lng));
        locMarker.setPosition(new google.maps.LatLng(lat, lng));
        qiblaMap.panTo(locMarker.getPosition());
        return qiblainfo.innerHTML = "";
    }
}

// convert degree to (deg, min, sec)
function degToMinsec(angle){ // input as number
    var absAngle = Math.abs(angle); 
    var degFloor = Math.floor(absAngle);
    var min = (absAngle - degFloor)*60.0; 
    var minFloor = Math.floor(min);
    var sec = (min - minFloor)*60.0;
    degFloor = degFloor.toString(); minFloor = minFloor.toString(); sec = sec.toFixed(1).toString();
    if (angle < 0.0){degFloor = "-"+degFloor;}
    return [degFloor, minFloor, sec]; // return as string
}

// convert (deg, min, sec) to degree
function minsecToDeg(deg, min, sec){ // input as string
    var degree = Math.abs(parseFloat(deg)) + Math.abs(parseFloat(min))/60.0 + Math.abs(parseFloat(sec))/3600.0;
    if (deg[0] == '-'){degree = -1.0*degree;}
    return degree; // return as number
}

// flip panel CSS
$('.flip').click(function(){
    $('.card').toggleClass('flipped');
});

// Clear Button
function resetForm(){
    $('#formPanelDeg').trigger('reset');
    $('#formPanelMin').trigger('reset');
    document.getElementById('qiblaMessageMin').innerHTML = "";
    document.getElementById('qiblaMessage').innerHTML = "";
}