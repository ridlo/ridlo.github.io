// This example displays a marker at the center of Australia.
// When the user clicks the marker, an info window opens.
// The maximum width of the info window is set to 200 pixels.

function initMap() {
  var  = {lat: -2.760853, lng: 117.173719};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 3,
    center: uluru
  });

  var contentString = '<div id="content">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<div id="bodyContent">'+
      '<p><b>Palangkaraya</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
      'sandstone rock formation in the southern part of the '+
      'Northern Territory, central Australia. It lies 335 km (208 mi)</p>'+
      '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
      'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
      '(last visited June 22, 2009).</p>'+
      '</div>'+
      '</div>';

  var infowindow = new google.maps.InfoWindow({
    content: contentString,
    maxWidth: 350
  });

  var marker = new google.maps.Marker({
    position: uluru,
    map: map,
    title: 'Palangkaraya'
  });

  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });

    // add full screen botton
  var fsControldiv = document.createElement('div');
  var fsControl = new fullScreenControl(fsControldiv, map); 
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(fsControldiv);

}

// add full screen button on map
function fullScreenControl(controlDiv, map){
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

    // event
    google.maps.event.addDomListener(controlUI, 'click', function(){
        window.open("./embed.html", "_self");
    });
}