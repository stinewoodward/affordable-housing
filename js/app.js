(function () {

    L.mapbox.accessToken = 'pk.eyJ1Ijoicmdkb25vaHVlIiwiYSI6Im5Ua3F4UzgifQ.PClcVzU5OUj17kuxqsY_Dg';
  
    // load basemap from mapbox
    var map = L.mapbox.map('map', 'mapbox.light', {
            zoomSnap: .1,
            center: [45.5231, -122.6765],
            zoom: 11,
            minZoom: 10,
            maxZoom: 14,
        });
    
    // Choropleth colors from http://colorbrewer2.org/
    // You can choose your own range (or different number of colors)
    // and the code will compensate.
    var hues = [
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
        });*/
    for (var i = 0; i < variables.length; i++) {
        ranges[variables[i]] = { min: Infinity, max: -Infinity };
        // Simultaneously, build the UI for selecting different
        // ranges
       /* $('<option></option>')
            .text(variables[i])
            .attr('value', variables[i])
            .appendTo($select);*/
    }
    
    // load in census tracts and add to map
    var censusTracts = L.mapbox.featureLayer()
      .loadURL('data/or_census_tracts.geojson')
      .addTo(map)
      .on('ready', loadData); // calls loadData function to load in json data
    
    // loads json rent data and joins
    function loadData() {
        $.getJSON('data/median-gross-rent.json')
            .done(function(rentData) {
                joinData(rentData, censusTracts); // calls joinData function
            });
    } // end loadData()
    
    // joins 
    function joinData(rentData, censusTracts) {
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
                    
        for (i = 0; i < rentData.length; i++) {
            // Match the GeoJSON data (byTract) with the tabular data
            // (rentData), replacing the GeoJSON feature properties
            // with the full data.
            byTract[rentData[i].GEOID].properties = rentData[i];
            for (var j = 0; j < variables.length; j++) {
                // Simultaneously build the table of min and max
                // values for each attribute.
                var n = variables[j];
                ranges[n].min = Math.min(rentData[i][n], ranges[n].min);
                ranges[n].max = Math.max(rentData[i][n], ranges[n].max);
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
        setVariable(variables[1]);
        
    } // end joinData()
    
    // Excuse the short function name: this is not setting a JavaScript
    // variable, but rather the variable by which the map is colored.
    // The input is a string 'name', which specifies which column
    // of the imported JSON file is used to color the map.
    function setVariable(GEOID) {
        var scale = ranges[GEOID];
        portLayer.eachLayer(function(layer) {
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