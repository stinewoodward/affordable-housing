(function () {

    L.mapbox.accessToken = 'pk.eyJ1Ijoicmdkb25vaHVlIiwiYSI6Im5Ua3F4UzgifQ.PClcVzU5OUj17kuxqsY_Dg';

        var map = L.mapbox.map('map', 'mapbox.light', {
            zoomSnap: .1,
            center: [45.5231, -122.6765],
            zoom: 11,
            minZoom: 10,
            maxZoom: 14,
        }); 
    
    // AJAX request for GeoJSON data
    $.getJSON("data/or_census_tracts.geojson", function(censusTracts) {
            
        Papa.parse('data/aff_housing_data.csv', {

            download: true,
            header: true,
            complete: function(data) {

                processData(censusTracts, data);

            }
        }); // end of Papa.parse()
            
    })
    .fail(function() {
            
        // the data file failed to load
        console.log("Ruh roh! An error has occurred." );

    });
    
    function processData(censusTracts, data) {
            
            // loop through all the counties
            for (var i = 0; i < censusTracts.features.length; i++) {

                // short-hand reference to county properties
                var props = censusTracts.features[i].properties;

                // for each of the CSV data rows
                for (var j = 0; j < data.data.length; j++) {

                    // if the county fips code and data fips code match
                    if (props.geoid == data.data[j].GEOID) {

                        // reassign county properties using data
                        censusTracts.features[i].properties = data.data[j];
        
                        // stop loop after value is found
                        break;
                    }
                }
            }
            
            // create array to hold property values associated with counties
            var rates = [];
        
            // loops through counties to get properties
            censusTracts.features.forEach(function(censusTract) {

                // loop through properties object in counties
                for (var prop in censusTract.properties) {
                    
                    // if statement checks if property value can be turned numeric to filter out text strings
                    if(+prop) {
                        // push properties into rates array
                        rates.push(+county.properties[prop]);
                    }
                    
                }

            });
            
            // create breaks using rates array data
            var breaks = chroma.limits(rates, 'q', 5);

            // create colorize function
            var colorize = chroma.scale(chroma.brewer.OrRd).classes(breaks).mode('lab');
            
            drawMap(censusTracts, colorize);
            drawLegend(breaks, colorize);

        } // end processData
       
        
        function drawMap(censusTracts, colorize) {

            // create Leaflet object with geometry data and add to map
            var dataLayer = L.geoJson(counties, {
                style: function(feature) {
                    return {
                        color: 'black',
                        weight: 1,
                        fillOpacity: 1,
                        fillColor: '#1f78b4'
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

            // set map center and initial zoom
            map.setView([39.8283, -94.5795], 4.2);
            
            updateMap(dataLayer, colorize, '2001');
            
            createSliderUI(dataLayer, colorize);

        } // end drawMap

        function updateMap(dataLayer, colorize, currentYear) {
            
            // use leaflet method to iterate through each layer
            dataLayer.eachLayer(function(layer) {
               
                // create shortcut into properties
                var props = layer.feature.properties;
                
                // set layer style using selected year property
                layer.setStyle({
                    fillColor: colorize(props[currentYear])
                });
                
                // assemble string sequence of info for tooltip (end line break with + operator)
				var tooltipInfo = "<b>" + props["NAME"] + 
				                  "</b></br>" + props[currentYear] + "% Unemployment";
                
                //update tooltip content for each layer
                layer.setTooltipContent(tooltipInfo);
                
            });   

        } // end updateMap

        function drawLegend(breaks, colorize) {
            
            
            // create leaflet control for legend
            var legendControl = L.control({
                position: 'topright'
            });

            // when the control is added to the map
            legendControl.onAdd = function(map) {

                // create a new div with class legend and return legend
                var legend = L.DomUtil.create('div', 'legend');
                return legend;

            };

            // add legend to map
            legendControl.addTo(map);
            
            // create legend html, including unordered list for classes
            var legend = $('.legend').html("<h3><span>2001</span> Unemployment Rates</h3><ul>");

            for (var i = 0; i < breaks.length - 1; i++) {

                // create color variable with call to colorize function
                var color = colorize(breaks[i], breaks);

                // create list item 
                var classRange = '<li><span style="background:' + color + '"></span> ' +
                    breaks[i].toLocaleString() + ' &mdash; ' +
                    breaks[i + 1].toLocaleString() + '</li>'
                
                // append list item to list
                $('.legend ul').append(classRange);
            }

            // close unordered list
            legend.append("</ul>");
            
        } // end drawLegend

        function createSliderUI(dataLayer, colorize) {

            // create leaflet control for the slider
            var sliderControl = L.control({ position: 'bottomleft'} );

            // when added to the map
            sliderControl.onAdd = function(map) {

                // select existing DOM element with id "ui-controls"
                var slider = L.DomUtil.get("ui-controls");

                // disable scrolling of map while using controls
                L.DomEvent.disableScrollPropagation(slider);

                // disable click events while using controls
                L.DomEvent.disableClickPropagation(slider);

                // return the slider from the onAdd method
                return slider;
                
            }

            // add control to map
            sliderControl.addTo(map);
            
            // select the form element
            $(".year-slider")
                .on("input change", function() {
                    var currentYear = this.value;
                    $('.legend h3 span').html(currentYear);
                    updateMap(dataLayer, colorize, currentYear);

                });
            
        } // end createSliderUI

    
})();