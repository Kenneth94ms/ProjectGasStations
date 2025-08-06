let map;

async function initMap() {
  const response = await fetch('data/stations.json');
  const stations = await response.json();

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 9.934739, lng: -84.087502 },
    zoom: 8,
  });

  stations.forEach(station => {
    const marker = new google.maps.Marker({
      position: { lat: station.lat, lng: station.lng },
      map,
      icon: station.batteries
        ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
        : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      title: station.name
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div>
          <h3>${station.name}</h3>
          <p>${station.address}</p>
          <p><strong>${station.batteries ? "Batteries Available" : "No Batteries"}</strong></p>
        </div>
      `
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  });
}
