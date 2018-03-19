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
    
    // set global variables for map layer,
    var attributeValue = "Rent_ch10_15";

    // create object to hold legend titles
    var labels = {
        "Rent_ch10_15": "Percent change in gross rent",
        "lowinc_ch10_15": "Percent change in low-income households",
        "af_ch_10_15": "Percent change in market rate affordable housing",
        "MHSP10_15": "Percent change in medium home sale price"
    }

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
        processData(data);
    } 
    
    function processData(data) {
            
        // data is array of our two datasets
        var censusTractData = data[0],
            rentData = data[1]
          
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

        drawMap(censusTractData)
        //drawLegend(breaks, colorize);

    } // end processData()
    
    function drawMap(censusTractData) {
        
        // create Leaflet object with geometry data and add to map
            var dataLayer = L.geoJson(censusTractData, {
                style: function(feature) {
                    return {
                        color: 'black',
                        weight: 1,
                        fillOpacity: 1,
                        fillColor: 'white'
                    };
                },
                onEachFeature: function(feature, layer) {

					// when mousing over a layer
					layer.on('mouseover', function() {

						// change the stroke color and bring that element to the front
						layer.setStyle({
							color: '#ff6e00',
                            weight: 2
						}).bringToFront();
					});

					// on mousing off layer
					layer.on('mouseout', function() {

						// reset the layer style to its original stroke color
						layer.setStyle({
							color: 'black',
                            weight: 1
						});
					});

                    // bind an empty tooltip to layer
                    layer.bindTooltip('', {
                        // sticky property so tooltip follows the mouse
                        sticky: true,
                        tooltipAnchor: [200, 200]
                    });
				} 
            }).addTo(map);
        
        updateMap(dataLayer);
        addUi(dataLayer);
        
    }
    
    function updateMap(dataLayer) {

        // get the class breaks
        var breaks = getClassBreaks(dataLayer)

        console.log(breaks)

        var colorizePositive = chroma.scale(chroma.brewer.OrRd).classes(breaks[0]).mode('lab'),
            colorizeNegative = chroma.scale(['navy', '#acc6ef']).classes(breaks[1]).domain([1,0]);
         
        // use leaflet method to iterate through each layer
        dataLayer.eachLayer(function(layer) {
               
            // create shortcut into properties
            var props = layer.feature.properties;
            if(props.data) {
                // console.log(props.data[attributeValue])
                if(props.data[attributeValue] < 0) {
                    layer.setStyle({
                        fillColor: colorizeNegative(props.data[attributeValue])
                    }); 
                } else {
                    layer.setStyle({
                        fillColor: colorizePositive(props.data[attributeValue])
                    }); 
                }
       
            }
    
            // assemble string sequence of info for tooltip (end line break with + operator)
            var tooltipInfo = "<b>" + props[attributeValue] + "</b>";
                
            //update tooltip content for each layer
            layer.setTooltipContent(tooltipInfo);
                
        });
        
        // call updateLegend here
        
    } // end updateMap()
    
    // adds UI and listens for user input
    function addUi(dataLayer) {
        // create the slider control
        var selectControl = L.control({ position: 'topright'} );

        // when control is added
        selectControl.onAdd = function(map) {
            // get the element with id attribute of ui-controls
            return L.DomUtil.get("ui-controls");
        }
          
        // add the control to the map
        selectControl.addTo(map);
            
        $('select[id="occupied"]').change(function() {

            attributeValue = this.value;
            updateMap(dataLayer);

        });    
    } // end addUi()

    function getClassBreaks(dataLayer) {
     
        var positiveValues = [],
            negativeValues = []

        dataLayer.eachLayer(function(layer) {

            var props = layer.feature.properties;
            if(props.data) {
                if(+props.data[attributeValue] > 0) {
                    positiveValues.push(+props.data[attributeValue])
                } else {
                    negativeValues.push(+props.data[attributeValue]) 
                }
                
            }

        })

        return [chroma.limits(positiveValues, 'q', 5),  chroma.limits(negativeValues, 'q', 5)]

    }
    
    
})();