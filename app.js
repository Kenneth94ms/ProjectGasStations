/* ---------- map bootstrap unchanged ---------- */
const map          = L.map('map').setView([9.7489, -83.7534], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            { attribution:'© OpenStreetMap contributors' }).addTo(map);
const markersLayer = L.markerClusterGroup().addTo(map);

/* ---------- state ---------- */
let stations   = [];     // array loaded from json
let markersRef = [];     // one-to-one marker reference by index

/* ---------- helpers ---------- */
function iconFor(st) {
  return L.icon({
    iconUrl : st.batteries
      ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
      : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    iconSize: [32,32], iconAnchor:[16,32], popupAnchor:[0,-32]
  });
}

function popupHtml(st) {
  return `<strong>${st.name}</strong><br>${st.address}<br>
          <b>${st.batteries ? 'Gas LP Available' : 'No Gas LP Available'}</b><br>
          <a href="#" class="edit-link" data-idx="${st.idx}">✏️ Edit</a>`;
}

function rebuildMarker(idx) {
  // remove old & create new so cluster + search stay in sync
  if (markersRef[idx]) markersLayer.removeLayer(markersRef[idx]);

  const st      = stations[idx];
  const marker  = L.marker([st.lat, st.lng], { icon:iconFor(st), title: st.name });
  marker.bindPopup(popupHtml(st));
  markersLayer.addLayer(marker);
  markersRef[idx] = marker;
}

/* ---------- fetch initial data ---------- */
fetch('./data/stations.json')
  .then(r => r.json())
  .then(json => {
    stations = json.map((s, i) => ({ ...s, idx:i }));   // stamp index
    stations.forEach((s, i) => { rebuildMarker(i); });

    // search bar
    const search = new L.Control.Search({
      layer: markersLayer, marker:false,
      position:'topleft', textPlaceholder:'Buscar estación…',
      moveToLocation:(latlng, t, m)=>m.flyTo(latlng,14)
    }).on('search:locationfound', e => e.layer.openPopup());
    map.addControl(search);
  })
  .catch(console.error);

/* ---------- form handlers ---------- */
const form        = document.getElementById('add-form');
const saveBtn     = document.getElementById('save-btn');
const cancelBtn   = document.getElementById('cancel-edit');
const panel       = document.getElementById('add-panel');

function resetForm() {
  form.reset();
  form.idx.value = '';                       // no index → add-mode
  saveBtn.textContent = 'Add to map';
  cancelBtn.style.display = 'none';
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const f  = new FormData(form);
  const st = {
    name     : f.get('name').trim(),
    address  : f.get('address').trim(),
    lat      : parseFloat(f.get('lat')),
    lng      : parseFloat(f.get('lng')),
    batteries: f.get('batteries') !== null
  };

  if (!Number.isFinite(st.lat) || !Number.isFinite(st.lng)) {
    alert('Latitude / longitude invalid'); return;
  }

  // --- add or edit? ---
  const idx = f.get('idx');
  if (idx === '') {                     // add
    st.idx = stations.length;
    stations.push(st);
  } else {                              // edit existing
    st.idx = Number(idx);
    stations[st.idx] = st;
  }

  rebuildMarker(st.idx);
  alert('Saved!  Remember to download the new JSON.');
  resetForm();
});

/* ---------- click handler for “Edit” links inside popups ---------- */
map.on('popupopen', e => {
  const link = e.popup.getElement().querySelector('.edit-link');
  if (!link) return;

  link.addEventListener('click', ev => {
    ev.preventDefault();
    const idx = Number(link.dataset.idx);
    const st  = stations[idx];

    // populate form
    form.name.value     = st.name;
    form.address.value  = st.address;
    form.lat.value      = st.lat;
    form.lng.value      = st.lng;
    form.batteries.checked = st.batteries;
    form.idx.value      = idx;               // switch to edit-mode
    saveBtn.textContent = 'Save changes';
    cancelBtn.style.display = 'inline';
    panel.open = true;                       // auto-open accordion
  }, { once:true });
});

/* cancel button simply resets */
cancelBtn.addEventListener('click', resetForm);

/* ---------- JSON download ---------- */
document.getElementById('download-json').addEventListener('click', () => {
  const blob = new Blob(
    [JSON.stringify(stations.map(({idx, ...s}) => s), null, 2)],
    { type:'application/json' }
  );
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), {
    href:url, download:'stations.json'
  }).click();
  URL.revokeObjectURL(url);
});
