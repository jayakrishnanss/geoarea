var map;
var dataMap = new google.maps.Data();
var markerLatlng;
var lineCoordinates;
var polygonCoordinates;
var rectangleCoordinates;
var geoJson = '';
var linestring;
var polygonArea;
$(document).ready(function() {
    initMap();
});

function initMap() {
    var starPointLatLon = new google.maps.LatLng(38.889931, -77.009003);
    var mapOptions = {
        zoom: 13,
        center: starPointLatLon,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.BOTTOM_RIGHT
        },
        mapTypeControl: true
    };
    map = new google.maps.Map($('#map-view')[0], mapOptions);
    $(".draw-btn").bind("click", onButtonClick);
}

function onButtonClick(evt) {
    switch (evt.target.id) {
        case 'btn-edit':
            setEditMode();
            break;
        case 'btn-save':
            $('#geojson-span').text(geoJson)
            break;
        case 'btn-buffer':
            if(lineCoordinates){
              setLineBuffer(linestring);
            }
            if(markerLatlng && $('#buffer-val').val()){
              setBufferForMarker( markerLatlng, $('#buffer-val').val() );
            }
            if(polygonCoordinates){
              setLineBuffer(polygonArea);
            }
            break;
    }
}

function setEditMode() {
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.MARKER,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['marker', 'polygon', 'polyline', 'rectangle']
        },
        markerOptions: {
            icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
        },
        circleOptions: {
            fillColor: '#ffff00',
            fillOpacity: 1,
            strokeWeight: 5,
            clickable: false,
            editable: true,
            zIndex: 1
        }
    });
    drawingManager.setMap(map);
    // Polygon draw complete event
    google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
      debugger
        polygonCoordinates = (polygon.getPath().getArray());
        var polyArr = [];
        for (var i = 0; i < polygonCoordinates.length; i++) {
            polyArr.push([polygonCoordinates[i].lng(), polygonCoordinates[i].lat()]);
        }
        polygonArea = turf.linestring(polyArr, {
            line: '1'
        });
        geoJson = JSON.stringify(polygonArea);
    });
    // Line draw complete event
    google.maps.event.addListener(drawingManager, 'polylinecomplete', function(polyline) {
        lineCoordinates = (polyline.getPath().getArray());
        var lineArr = [];
        for (var i = 0; i < lineCoordinates.length; i++) {
            lineArr.push([lineCoordinates[i].lng(), lineCoordinates[i].lat()]);
        }
        linestring = turf.linestring(lineArr, {
            line: '1'
        });
        geoJson = JSON.stringify(linestring, undefined, 4);
    });
    // marker draw complete event
    google.maps.event.addListener(drawingManager, 'markercomplete', function(marker) {
        markerLatlng = marker.position;
        var turfPoint = turf.point([markerLatlng.lng(), markerLatlng.lat()]);
        geoJson = JSON.stringify(turfPoint);
    });
    google.maps.event.addListener(drawingManager, 'rectanglecomplete', function(rectangle) {
      debugger
        //rectangleCoordinates = (rectangle.getPath().getArray());
    });
}

function setLineBuffer(area) {
    var buffered = [];    
    var meter = parseInt($('#buffer-val').val(), 10);
    dataMap.setMap(null);
    dataMap = new google.maps.Data();
    setStyle();
    if (meter > 0) {
        buffered = turf.buffer(area, meter, "kilometers");
        geoJson = JSON.stringify(buffered);
        dataMap.addGeoJson(buffered);
    }
    dataMap.setMap(map);
}
var setStyle = function() {
    dataMap.setStyle(function(feature) {
        /*if( feature.getProperty('name') ){
          return { icon: new google.maps.MarkerImage("https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=train|FFFF88") };
        }
        else */
        if (feature.getProperty('line')) {
            return {
                strokeWeight: 1,
                strokeColor: '#000'
            };
        } else {
            return {
                strokeWeight: 1,
                strokeColor: '#000',
                fillOpacity: 0.25,
                fillColor: '#000'
            };
        }
    });
}
function setBufferForMarker(point, unit){
  unit = parseInt(unit, 10);
  var turfPoint = turf.point([point.lng(), point.lat()]);
  var buffered = turf.buffer(turfPoint, unit, "kilometers");
  geoJson = JSON.stringify(buffered);
  dataMap.setMap(null);
  dataMap = new google.maps.Data();
  dataMap.addGeoJson(buffered);
  dataMap.setMap(map);
}
