(function () {

    L.mapbox.accessToken = 'pk.eyJ1Ijoicmdkb25vaHVlIiwiYSI6Im5Ua3F4UzgifQ.PClcVzU5OUj17kuxqsY_Dg';
  
    var map = L.mapbox.map('map', 'mapbox.light', {
            zoomSnap: .1,
            center: [45.5231, -122.6765],
            zoom: 11,
            minZoom: 10,
            maxZoom: 14,
        });
    
    var censusTracts = L.mapbox.featureLayer()
      .loadURL('data/or_census_tracts.geojson')
      .addTo(map);

    
})();