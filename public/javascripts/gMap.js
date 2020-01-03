function initMap() {
    var myLatLng = { lat: 49.16152, lng: -123.159214 };

    var map = new google.maps.Map(document.getElementById('gMap'), {
        zoom: 17,
        center: myLatLng,
        disableDefaultUI: true
    });

    var contentString = '<div id="content">' +
        '<div id="siteNotice">' +
        '</div>' +
        '<h3 id="firstHeading" class="firstHeading">Skyline Church</h2>' +
        '<div id="bodyContent">' +
        '<div><i class="material-icons">home</i><div>#110-12830 Clarke Place, Richmond</div></div>' +        
        '<div><i class="material-icons">email</i><a href="mailto:contact@skylinechurch.ca" target="_top">contact@skylinechurch.ca</a></p>' + 
    '</div></div>';
    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });

    var icon = 'https://maps.google.com/mapfiles/kml/pal2/icon10.png';

    var marker = new google.maps.Marker({
        position: myLatLng,
        icon: icon,
        map: map,
        title: 'Skyline Church'
    });
    marker.addListener('click', function () { infowindow.open(map, marker); });
    infowindow.open(map, marker);
}