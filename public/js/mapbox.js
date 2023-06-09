

export const displayMap = (locations)=>{
  mapboxgl.accessToken = 'pk.eyJ1Ijoib3JpY2UtYWNvIiwiYSI6ImNsZXgxM2p1eDJmbWozdXJ2dGF3eGplN24ifQ.hMa4jOWSDnZPec-XxYRMMw';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/orice-aco/clexx16gz00ld01o940svawkd',
    scrollZoom: false,
    // center:[-118.113491,34.111745],
    // zoom: 5,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc =>{
    // create marker
    const el = document.createElement('div');
    el.className = 'marker';

    //add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map)

    // add popup
    new mapboxgl
    .Popup({
      offset: 30
    })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description} </p>`)
    .addTo(map);
    //extends the map bounds to include the location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
    top: 200,
    bottom: 150,
    left:100,
    right:200
    }
  });


}

