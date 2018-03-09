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
        rentCSV= d3.csv('data/aff_housing_data.csv');

    // use the Promise to wait until all data files are loaded
    Promise.all([censusTractJson, rentCSV]).then(ready);

    // function fired if there is an error
    function error(error) {
        console.log(error)
    }

    // function called when data is ready
    function ready(data) {
        console.log(data) // data is an array of all datasets

        // data are ready to send to be joined or processed
        // add to map to test
        L.geoJSON(data[0]).addTo(map);
        
        processData(data);

    } 
    
    function processData(data) {
            
        // data is array of our two datasets
        var censusTractData = data[0],
            rentData = data[1]
        
        console.log(censusTractData);
        console.log(rentData);
        
        // loop through all the census tracts
        for (var i = 0; i < censusTractData.features.length; i++) {

            // short-hand reference to census tract properties
            var props = censusTractData.features[i].properties;

            // for each of the CSV data rows
            for (var j = 0; j < rentData.data.length; j++) {

                // if the census tract codes match
                if (props.geoid == rentData.data[j].GEOID) {

                    // reassign census tract properties using data
                    censusTractData.features[i].properties = rentData.data[j];
        
                    // stop loop after value is found
                    break;
                }
            }
        }
            
        // create array to hold property values associated with census tracts
        var rents = [];
        
        // loops through counties to get properties
        censusTractData.features.forEach(function(censusTractData) { //don't know if inside function is correct

            // loop through properties object in census tracts
            for (var prop in censusTractData.properties) {
                    
                // if statement checks if property value can be turned numeric to filter out text strings
                if(+prop) {
                    // push properties into rates array
                    rents.push(+censusTractData.properties[prop]);
                }
                    
            }

        });
        
        console.log(rents);
            
     /*   // create breaks using rates array data
        var breaks = chroma.limits(rates, 'q', 5);

        // create colorize function
        var colorize = chroma.scale(chroma.brewer.OrRd).classes(breaks).mode('lab');
            
        drawMap(counties, colorize);
        drawLegend(breaks, colorize);*/

    } // end processData()
    
    
    



})();