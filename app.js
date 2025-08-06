const map = L.map('map').setView([9.7489, -83.7534], 8);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Create a layer group to hold all markers
const markersLayer = new L.LayerGroup();
map.addLayer(markersLayer);

// Load station data
fetch('./data/stations.json')
  .then(response => response.json())
  .then(stations => {
    stations.forEach(station => {
      const markerIcon = L.icon({
        iconUrl: station.batteries
          ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
          : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([station.lat, station.lng], {
        icon: markerIcon,
        title: station.name // Required for search plugin
      }).bindPopup(`
        <strong>${station.name}</strong><br>
        ${station.address}<br>
        <b>${station.batteries ? 'Gas LP Available' : 'No Gas LP Available'}</b>
      `);

      markersLayer.addLayer(marker);
    });

    // Add Search Control
    const searchControl = new L.Control.Search({
      layer: markersLayer,
      propertyName: 'title',
      marker: false,
      moveToLocation: function (latlng, title, map) {
        map.setView(latlng, 14); // Zoom to the marker
      }
    });

    searchControl.on('search:locationfound', function (e) {
      e.layer.openPopup(); // Open popup on match
    });

    map.addControl(searchControl);
  });
