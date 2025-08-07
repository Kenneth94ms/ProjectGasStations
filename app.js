/* ---------- map bootstrap ---------- */
const map = L.map('map').setView([9.7489, -83.7534], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const markersLayer = L.markerClusterGroup().addTo(map);

/* ---------- state ---------- */
let stations   = [];   // array loaded from JSON
let markersRef = [];   // 1-to-1 marker reference by index

/* ---------- helpers ---------- */
function iconFor(st) {
  return L.icon({
    iconUrl   : st.batteries
      ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
      : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    iconSize  : [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
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

  const st     = stations[idx];
  const marker = L.marker([st.lat, st.lng], { icon: iconFor(st), title: st.name });
  marker.bindPopup(popupHtml(st));
  markersLayer.addLayer(marker);
  markersRef[idx] = marker;
}

/* ---------- initial load ---------- */
fetch('./data/stations.json')
  .then(r => r.json())
  .then(json => {
    stations = json.map((s, i) => ({ ...s, idx: i })); // stamp index
    stations.forEach((_, i) => rebuildMarker(i));

    // search bar
    const search = new L.Control.Search({
      layer            : markersLayer,
      marker           : false,
      position         : 'topleft',
      textPlaceholder  : 'Buscar estación…',
      moveToLocation   : (latlng, _title, m) => m.flyTo(latlng, 14)
    }).on('search:locationfound', e => e.layer.openPopup());

    map.addControl(search);
  })
  .catch(console.error);

/* ---------- form handlers ---------- */
const form      = document.getElementById('add-form');
const saveBtn   = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-edit');
const panel     = document.getElementById('add-panel');

function resetForm() {
  form.reset();
  form.idx.value = '';          // no index → add-mode
  saveBtn.textContent = 'Add to map';
  cancelBtn.style.display = 'none';
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const f   = new FormData(form);

  /* validate coords FIRST */
  const lat = Number(f.get('lat'));
  const lng = Number(f.get('lng'));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    alert('Latitude / longitude invalid'); return;
  }

  const st = {
    name      : f.get('name').trim(),
    address   : f.get('address').trim(),
    lat, lng,
    batteries : f.get('batteries') !== null
  };

  // add or edit?
  const idxRaw = f.get('idx');
  if (idxRaw === '') {          // ➕ add
    st.idx = stations.length;
    stations.push(st);
  } else {                      // ✏️ edit
    st.idx = Number(idxRaw);
    stations[st.idx] = st;
  }

  rebuildMarker(st.idx);
  alert('Saved ✔︎  – remember to download the new JSON.');
  resetForm();
});

/* ---------- edit link inside popups ---------- */
map.on('popupopen', e => {
  const link = e.popup.getElement().querySelector('.edit-link');
  if (!link) return;

  link.addEventListener('click', ev => {
    ev.preventDefault();
    const idx = Number(link.dataset.idx);
    const st  = stations[idx];

    form.name.value       = st.name;
    form.address.value    = st.address;
    form.lat.value        = st.lat;
    form.lng.value        = st.lng;
    form.batteries.checked = st.batteries;
    form.idx.value        = idx;            // switch to edit-mode
    saveBtn.textContent   = 'Save changes';
    cancelBtn.style.display = 'inline';
    panel.open = true;                      // auto-open accordion
  }, { once: true });
});

/* cancel button */
cancelBtn.addEventListener('click', resetForm);

/* ---------- JSON download ---------- */
document.getElementById('download-json').addEventListener('click', () => {
  const clean = stations.map(({ idx, ...s }) => s); // strip temp field
  const blob  = new Blob([JSON.stringify(clean, null, 2)],
                         { type: 'application/json' });
  const url   = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'stations.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
