(function () {

  // load basemap from mapbox
  var map = L.map('map', {
    zoomSnap: .1,
    center: [45.5231, -122.6765],
    zoom: 11,
    minZoom: 10,
    maxZoom: 14,
  });

  // Choropleth colors from http://colorbrewer2.org/
  // You can choose your own range (or different number of colors)
  // and the code will compensate.
  /*var hues = [
      '#eff3ff',
      '#bdd7e7',
      '#6baed6',
      '#3182bd',
      '#08519c'];

  // The names of variables that we'll show in the UI for
  // styling. These need to match exactly.
  var variables = [
      '2000',
      '2010',
      '2015'];

  // Collect the range of each variable over the full set, so
  // we know what to color the brightest or darkest.
  var ranges = {};
  /*var $select = $('<select></select>')
      .appendTo($('#variables'))
      .on('change', function() {
          setVariable($(this).val());
      });
  for (var i = 0; i < variables.length; i++) {
      ranges[variables[i]] = { min: Infinity, max: -Infinity };
      // Simultaneously, build the UI for selecting different
      // ranges
      $('<option></option>')
          .text(variables[i])
          .attr('value', variables[i])
          .appendTo($select);
  }*/

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

  // load in census tracts and add to map
    // var censusTracts = L.mapbox.featureLayer()
    //   .loadURL('data/or_census_tracts.json')
    //   .addTo(map)
    //   .on('ready', loadData);

  // Grab the spreadsheet of data as JSON. If you have CSV
  // data, you should convert it to JSON with
  // http://shancarter.github.io/mr-data-converter/
  // function loadData() {
  //   $.getJSON('data/median-gross-rent.json')
  //     .done(function (data) {
  //       joinData(data, usLayer);
  //       console.log(data);
  //     });
  // }


  /*var rentData = Papa.parse('data/median_gross_rent.csv', {

      download: true,
      header: true,
      complete: function(results) {

          console.log(results.data);
          return results.data;

          }
  }); // end of Papa.parse()
  */

  // join
  function joinData(data, censusTracts) {



    // First, get the census tract GeoJSON data for reference.
    var portGeoJSON = censusTracts.getGeoJSON(),
      byTract = {};

    // Rearrange it so that instead of being a big array,
    // it's an object that is indexed by geoid,
    // that we'll use to join on.
    for (var i = 0; i < portGeoJSON.features.length; i++) {
      byTract[portGeoJSON.features[i].properties.geoid] =
        portGeoJSON.features[i];
    }

    for (i = 0; i < data.length; i++) {
      // Match the GeoJSON data (byTract) with the tabular data
      // (data), replacing the GeoJSON feature properties
      // with the full data.
      byTract[data[i].GEOID].properties = data[i];
      for (var j = 0; j < variables.length; j++) {
        // Simultaneously build the table of min and max
        // values for each attribute.
        var n = variables[j];
        ranges[n].min = Math.min(data[i][n], ranges[n].min);
        ranges[n].max = Math.max(data[i][n], ranges[n].max);
      }
    }

    // Create a new GeoJSON array of features and set it
    // as the new usLayer content.
    var newFeatures = [];
    for (i in byTract) {
      newFeatures.push(byTract[i]);
    }
    portLayer.setGeoJSON(newFeatures);
    // Kick off by filtering on an attribute.
    //setVariable(variables[1]);

  } // end joinData()

  // Excuse the short function name: this is not setting a JavaScript
  // variable, but rather the variable by which the map is colored.
  // The input is a string 'name', which specifies which column
  // of the imported JSON file is used to color the map.
  function setVariable(GEOID) {
    var scale = ranges[GEOID];
    portLayer.eachLayer(function (layer) {
      // Decide the color for each state by finding its
      // place between min & max, and choosing a particular
      // color as index.
      var division = Math.floor(
        (hues.length - 1) *
        ((layer.feature.properties[GEOID] - scale.min) /
          (scale.max - scale.min)));
      // See full path options at
      // http://leafletjs.com/reference.html#path
      layer.setStyle({
        fillColor: hues[division],
        fillOpacity: 0.8,
        weight: 0.5
      });
    });
  } // end setVariable()


})();