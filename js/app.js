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
    var censusTractJson = d3.json('data/or_census_tracts.json'),
        rentJson= d3.csv('data/aff_housing_data.csv');

    // use the Promise to wait until all data files are loaded
    Promise.all([censusTractJson, rentJson]).then(ready);

    // function fired if there is an error
    function error(error) {
        console.log(error)
    }

    // function called when data is ready
    function ready(data) {

        // data are ready to send to be joined or processed
        // add to map to test
        // L.geoJSON(data[0]).addTo(map);
        
        processData(data);

    } 
    
    function processData(data) {
            
        // data is array of our two datasets
        var censusTractData = data[0],
            rentData = data[1]
        
        console.log(rentData)

        // loop through all the census tracts
        for (var i = 0; i < censusTractData.features.length; i++) {

            // short-hand reference to census tract properties
            var props = censusTractData.features[i].properties;

            // for each of the CSV data rows
            for (var j = 0; j < rentData.length; j++) {

                // if the census tract codes match
                if (props.geoid == rentData[j].GEOID) {
 
                    // reassign census tract properties using data
                    censusTractData.features[i].properties.data = rentData[j];
        
                    // stop loop after value is found
                    break;
                }
            }
        }
            
        console.log(censusTractData);
        
        // create array to hold property values associated with census tracts
        var housingData = [];
        
        // loops through counties to get properties
        censusTractData.features.forEach(function(censusTract) {
            // if data has been added to a tract
            if(censusTract.properties.data) {
                
                // these are features with data joined from CSV
                console.log(censusTract)
            }  
        });
        
        console.log(housingData);
        
    
            
     /*   // create breaks using rates array data
        var breaks = chroma.limits(rates, 'q', 5);

        // create colorize function
        var colorize = chroma.scale(chroma.brewer.OrRd).classes(breaks).mode('lab');
            
        drawMap(counties, colorize);
        drawLegend(breaks, colorize);*/

    } // end processData()
    
    
    



})();