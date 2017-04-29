

$(document).ready(function () {
  var $map = $('#map');
  var $iframe = $('#f4map');

  var baseurl = 'http://demo.f4map.com/#';
  var interval;
// http://demo.f4map.com/#lat=51.5288794&lon=-0.0839835&zoom=18&camera.theta=80&camera.phi=1.719

  var f4map;

var lastPoint;
  //init();
  createMap();
  
  //panToBounds();

  function constructURL(obj) {
    var url = baseurl + 'lat=' + obj.lat + '&lon=' + obj.lon + '&zoom=18&camera.theta=80&camera.phi=1.719';
    return url;
  }

  function getFlightPoints() {
    var points = [
      {
        latitude: 51.5288794,
        longitude: -0.0839835
      },
      {
        latitude: 51.525564,
        longitude: -0.086898,
        rotation: 0,
        zoom: 17,
        phi: 1.719
      },
      {
        latitude: 51.5254,
        longitude: -0.086888,
        rotation: -30,
        zoom: 17.2,
        phi: 1.719
      }
    ];

    return points;
  }

  function createMap() {
    var points = getFlightPoints();
    setTimeout(function () {
      window.f4map = new f4.map.Map($('#map').get(0), {});
      center();
    }, 3000);
  }




  function queryData(flight, cb) {
    var api = 'http://192.168.1.86:3001/flightdata?flightCode=' + flight;

    $.get(api, function (data) {
      cb(data);
    });
  }

  function center () {
    var from = getFlightPoints()[0];
    window.f4map.panToBounds(new f4.map.LatLngBounds(f4.map.geometry.spherical.computeOffset([from.latitude, from.longitude], 10, 200), new f4.map.geometry.spherical.computeOffset([from.latitude, from.longitude], 100, 50)));
    setTimeout(function () {
      window.f4map._renderer.setTilt(80);
      
      setTimeout(function () {
        window.f4map._renderer.setZoomFromApi(20);

        panToBounds(getFlightPoints()[1], getFlightPoints()[2]);

        queryDataAtIntervals();

      }, 500);
    }, 3000);
  }

  function panToBounds (from, to) {
    window.f4map.panToBounds(new f4.map.LatLngBounds(f4.map.geometry.spherical.computeOffset([from.latitude, from.longitude], 10, 200), new f4.map.geometry.spherical.computeOffset([to.latitude, to.longitude], 100, 50)));
  }

  function init () {
    getFlightPoints().forEach(function (obj) {
      console.log(obj);

        var url = constructURL({
          lat: obj.latitude,
          lon: obj.longitude
        });
        console.log(url);
        changeSrc($iframe, url);
    });
  }

  function queryDataAtIntervals(time) {
    setInterval(function () {
      queryData('exs670', function(res) {
        var obj = res.data[Object.keys(res.data)[0]];
        console.log(obj);

        var points = findEnRoute(obj.activityLog.flights).track;
        var currentPoint = points[points.length - 1];
        lastPoint = currentPoint;

        console.log(currentPoint);
        console.log(currentPoint.coord);

        panToBounds({
          latitude: currentPoint.coord[1],
          longitude: currentPoint.coord[0]
        }, {
          latitude: currentPoint.coord[1],
          longitude: currentPoint.coord[0]
        });
      });
    }, 10000);
  }

  function stopQueryingData () {
    clearInterval(interval);
  }

  function findEnRoute(flights) {
    return flights.find(function (obj) {
      return obj._state === 'enroute';
    });
  }

  function getPoints () {
    return points;
  }

  function changeSrc (iframe, url) {
    
    iframe.ready(function () {
      iframe.attr('src', url);
    });

  }
});







/*

var pointData = {
  start: function(){
    return {
      latitude: 51.525564,
      longitude: -0.086898,
      rotation: 0,
      zoom: 17,
      tilt: 60
    };
  },
  end: function(){
    return {
      latitude: 52.516, longitude: 13.349, rotation: -30, zoom: 17.2, tilt: 60
    };
  }
};
// map creation

var initMapConfig = pointData.start();
var map = new GLMap(map[0], {
  position: {
    latitude: initMapConfig.latitude,
    longitude: initMapConfig.longitude
  },
  zoom: initMapConfig.zoom,
  rotation: initMapConfig.rotation,
  tilt: initMapConfig.tilt,
  minZoom: 16,
  maxZoom: 22,
  attribution: ''
});

var osmb = new OSMBuildings({}).addTo(map);
// add tiles
osmb.addMapTiles('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png');
// add custom geojson (https://gist.github.com/moklick/9861cea20a97d7517365)
osmb.addGeoJSONTiles('http://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');


// button handling
var currentPoint = 'start';
var animationTime = 2500;
var buttons = document.querySelectorAll('button');
var tween = null;
var isAnimating = false;

[].forEach.call(buttons, function(button){
   button.addEventListener('click', handleButton, false);      
});

function handleButton(){
  var pointTo = this.getAttribute('data-point');
  var pointFrom = pointTo === 'a' ? 'b' : 'a';
  
  if(currentPoint === pointTo || isAnimating){
    return false;
  }
  
  currentPoint = pointTo;
  startAnimation(pointData[pointFrom](), pointData[pointTo]());
}

function startAnimation(valuesFrom, valuesTo){
  if(tween){
    tween.stop();
  }
  
  isAnimating = true;
  tween = new TWEEN.Tween(valuesFrom)
  .to(valuesTo, animationTime)
  .onUpdate(function() {
    map.setPosition({ latitude: this.latitude, longitude: this.longitude });
    map.setRotation(this.rotation);
    map.setZoom(this.zoom);
    map.setTilt(this.tilt);
  })
  .onComplete(function(){
    isAnimating = false;
  })
  .start();

  requestAnimationFrame(animate);
}

function animate(time) {
  requestAnimationFrame(animate);
  TWEEN.update(time);
}
*/