(function () {

  // map options
  var options = {
    scrollWheelZoom: true,
    zoomSnap: .1,
    dragging: true,
    center: [45.5231, -122.6765],
    zoom: 11,
    minZoom: 10,
    maxZoom: 14,
  }

  // create the Leaflet map
  var map = L.map('map', options);

  // request tiles and add to map
  var CartoDB_Positron = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
  }).addTo(map);

  // request data
  var censusTractData = d3.json('data/or_census_tracts.json'),
      rentData = d3.csv('data/aff_housing_data.csv');

  // use the Promise to wait until all data files are loaded
  Promise.all([censusTractData, rentData]).then(ready);

  // function called when data is ready
  function ready(data) {
    console.log(data) // data is an array of all datasets

    // data are ready to send to be joined or processed
    // add to map to test
    L.geoJSON(data[0]).addTo(map);
      
  } 


})();