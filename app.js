// ---------------------------------------------------------------------------
// Basemap & layers
// ---------------------------------------------------------------------------
const map = L.map('map', { scrollWheelZoom: true })
             .setView([9.7489, -83.7534], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const markersLayer = L.markerClusterGroup();   // marker clusters + search layer
map.addLayer(markersLayer);

// ---------------------------------------------------------------------------
// Load stations & build markers
// ---------------------------------------------------------------------------
fetch('./data/stations.json')
  .then(r => r.json())
  .then(stations => {
    stations.forEach(st => {
      const icon = L.icon({
        iconUrl : st.batteries
          ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
          : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        iconSize    : [32, 32],
        iconAnchor  : [16, 32],
        popupAnchor : [0,  -32]
      });

      L.marker([st.lat, st.lng], { icon, title: st.name })   // title → searchable
        .bindPopup(
          `<strong>${st.name}</strong><br>
           ${st.address}<br>
           <b>${st.batteries ? 'Gas LP Available' : 'No Gas LP Available'}</b>`
        )
        .addTo(markersLayer);
    });

    // ---------------------------------------------------------------------
    // Search control
    // ---------------------------------------------------------------------
    const search = new L.Control.Search({
      layer        : markersLayer,
      propertyName : 'title',     // matches the marker option above
      marker       : false,       // keep the original marker
      position     : 'topleft',
      textPlaceholder : 'Buscar estación…',
      moveToLocation(latlng, title, map) {
        map.flyTo(latlng, 14);    // smooth zoom-in
      }
    });

    search.on('search:locationfound', e => e.layer.openPopup());
    map.addControl(search);
  })
  .catch(err => console.error('Error loading stations:', err));
