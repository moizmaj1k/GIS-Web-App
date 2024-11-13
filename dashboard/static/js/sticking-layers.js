// Variable to track whether layers should stick to the map
let stickLayers = false;
const addedLayers = [];

// Custom "Stick All Layers" checkbox control
const stickLayersControl = L.control({ position: 'topright' });
stickLayersControl.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    div.innerHTML = `
        <label style="display: flex; align-items: center; padding: 0px; margin: 0px;">
            <input type="checkbox" id="stickLayersCheckbox" style="margin-right: 3px;">
            <strong>Stick layers</strong>
        </label>`;
    div.style.backgroundColor = '#fff';
    div.style.padding = '3px';

    // Add event listener for checkbox
    div.querySelector('#stickLayersCheckbox').addEventListener('change', (event) => {
        stickLayers = event.target.checked;
    });

    return div;
};
stickLayersControl.addTo(map);

// Custom "Clear Layers" button control
const clearLayersButton = L.control({ position: 'topright' });
clearLayersButton.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    div.innerHTML = '<button>Clear Layers</button>';
    div.style.backgroundColor = '#fff';
    div.style.padding = '0px';

    // Style the button
    const button = div.querySelector('button');
    button.style.padding = '4px';
    button.style.backgroundColor = '#e74c3c'; // Customize color
    button.style.color = '#FFF';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';

    // Add click event for the "Clear Layers" button
    button.onclick = function() {
        const tableBody = document.querySelector('#data-table tbody');
        tableBody.innerHTML = ''; // Clear previous data
        map.eachLayer(function(layer) {
            if (layer instanceof L.GeoJSON) {
                map.removeLayer(layer);
            }
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
    };

    return div;
};
clearLayersButton.addTo(map);
