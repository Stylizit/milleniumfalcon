

$(document).ready(function () {
  var $map = $('#map');
  var $iframe = $('#f4map');

  var baseurl = 'http://demo.f4map.com/#';
  var interval;
// http://demo.f4map.com/#lat=51.5288794&lon=-0.0839835&zoom=18&camera.theta=80&camera.phi=1.719

  var f4map;
  var flight_number = "swr318";
  var ANIMATION_TIME = 5000;
  var lastPoint;
  var counter = 0;


  function toRadians(n) { 
    return n * Math.PI / 180;
  }

  function toDegrees(n) {
    return (180 / Math.PI) * n;
  }

  function destinationPoint(distance, bearing, radius) {
      radius = (radius === undefined) ? 6371e3 : Number(radius);

      // see http://williams.best.vwh.net/avform.htm#LL

      var δ = Number(distance) / radius; // angular distance in radians
      var θ = toRadians(Number(bearing));

      var φ1 = toRadians(lastPoint[1]);
      var λ1 = toRadians(lastPoint[0]);

      var φ2 = Math.asin( Math.sin(φ1)*Math.cos(δ) +
                          Math.cos(φ1)*Math.sin(δ)*Math.cos(θ) );
      var λ2 = λ1 + Math.atan2(Math.sin(θ)*Math.sin(δ)*Math.cos(φ1),
                               Math.cos(δ)-Math.sin(φ1)*Math.sin(φ2));
      λ2 = (λ2+3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180°

      return [toDegrees(λ2), toDegrees(φ2)];
  };



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

      queryData(flight_number, function(res) {
        var obj = res.data[Object.keys(res.data)[0]];
        console.log(obj);

        var points = findEnRoute(obj.activityLog.flights).track;
        var currentPoint = points[points.length - 1];
        lastPoint = [currentPoint.coord[0], currentPoint.coord[1]];

        console.log(lastPoint);

        var point = obj.activityLog.flights[0].origin.coord;
        var heading = obj.heading;
        var speed = obj.groundspeed;
        var distance = obj.distance;

        center(point, heading, speed, distance);
      });

    }, 3000);
  }

  function queryData(flight, cb) {
    var api = 'http://localhost:3001/flightdata?flightCode=' + flight;

    $.get(api, function (data) {
      cb(data);
    });
  }

  function center (point, heading, speed, distance) {
    window.f4map.panToBounds(new f4.map.LatLngBounds(f4.map.geometry.spherical.computeOffset([point[1], point[0]], 10, 200), new f4.map.geometry.spherical.computeOffset([point[1], point[0]], 100, 50)));
    prepareFlight(distance, speed, heading);

    
  }

  function prepareFlight(distance, speed, heading) {
    setTimeout(function () {
      window.f4map._renderer.setHeading(heading);
      window.f4map._renderer.setTilt(80);

      setTimeout(function () {
        window.f4map._renderer.setZoomFromApi(20);

        //panToBounds(getFlightPoints()[1], getFlightPoints()[2]);

        //queryDataAtIntervals(flight_number);

        animate(speed, heading, ANIMATION_TIME);
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

  function animate (speed, heading, time) {
    var distance, cur;

    setInterval(function () {
      window.f4map._renderer.setHeading(heading + 180);
      distance = speed * time / 5000;
      console.log(distance);
      console.log(speed);
      cur = destinationPoint(distance, heading);

      console.log(cur);
      
      
      counter++;


      if (true) {
        panToBounds({
          latitude: lastPoint[1],
          longitude: lastPoint[0]
        }, {
          latitude: cur[1],
          longitude: cur[0]
        });
        lastPoint = cur;
      }
    }, time);
  }

  function queryDataAtIntervals(flightname, time) {
    setInterval(function () {
      queryData(flightname, function(res) {
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

function initFlight(event) {
  flightCode = document.getElementById("flight-code").value;
  document.getElementById("flight-input").style = "display: none;";
  return false;
}







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
