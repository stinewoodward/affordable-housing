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
    $.getJSON("data/or_census_tracts.geojson", function(counties) {
            
        Papa.parse('data/aff_housing_data.csv', {

            download: true,
            header: true,
            complete: function(data) {

                processData(counties, data);

            }
        }); // end of Papa.parse()
            
    })
    .fail(function() {
            
        // the data file failed to load
        console.log("Ruh roh! An error has occurred." );

    });

    
})();