// Initialize the map
const map = L.map('map').setView([9.7489, -83.7534], 8); // Center of Costa Rica

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load station data
fetch('data/stations.json')
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

      const marker = L.marker([station.lat, station.lng], { icon: markerIcon }).addTo(map);

      marker.bindPopup(`
        <strong>${station.name}</strong><br>
        ${station.address}<br>
        <b>${station.batteries ? 'GAS LP Available' : 'GAS LP Not Available'}</b>
      `);
    });
  });
