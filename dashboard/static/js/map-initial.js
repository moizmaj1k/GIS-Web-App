let currentValue = 0; // Default value
// var map = L.map('map').setView([30.3753, 69.3451], 6); // Centered on Pakistan

// Add a tile layer

// FREE OPTION NORMAL

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 18,
//     attribution: '© OpenStreetMap contributors'
// }).addTo(map);

// FREE AT FIRST AND THEN PAID

// L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibW9pejEyMzkyMzQiLCJhIjoiY20zNXNscDg5MGQwYTJrc2Y0aXk2d3Y3dyJ9.CMvUjmJzxmYP-jnHTdvk4g', {
//     maxZoom: 18,
//     attribution: '© Mapbox © OpenStreetMap'
// }).addTo(map);

// FREE OPTION SATELLITE

// L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
//     maxZoom: 18,
//     attribution: '© Esri, Maxar, Earthstar Geographics, and the GIS User Community'
// }).addTo(map);


// Define the OpenStreetMap and Esri World Imagery layers
const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
});

const esriImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: '© Esri, Maxar, Earthstar Geographics, and the GIS User Community'
});

// Initialize the map with one of the layers, e.g., OpenStreetMap
const map = L.map('map', {
    center: [30.3753, 69.3451], // Set initial center (e.g., Pakistan region)
    zoom: 6, // Set a starting zoom level
    layers: [openStreetMap]  // Set the default layer to display on load
});

// Create an object with the base layers for the toggle control
const baseMaps = {
    "OpenStreetMap": openStreetMap,
    "Satellite": esriImagery
};

// Add the layer control to the map
L.control.layers(baseMaps).addTo(map);

// Function to fetch and display administrative boundaries
function fetchBoundaries() {
    fetch(`/api/admin-boundaries/${currentValue}/`)  // Use currentValue for fetch URL
        .then(response => response.json())
        .then(data => {
            // Clear existing GeoJSON layers if needed
            map.eachLayer(function (layer) {
                if (layer instanceof L.GeoJSON || layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            data.forEach(item => {
                // Create GeoJSON layer for each item and set up the style
                var geoJsonLayer = L.geoJSON(JSON.parse(item.geometry), {
                    style: {
                        color: "blue",
                        weight: 2
                    }
                });

                // Bind popup to display region name on click
                geoJsonLayer.bindPopup(item.name);

                // Attach a click event to each feature in the GeoJSON layer
                geoJsonLayer.eachLayer(function (layer) {
                    layer.on('click', function() {
                        if (item && item.id) {
                            const regionId = item.id; // Access the region ID

                            // Fetch data for the clicked region using currentValue
                            fetch(`/get-region-data/${regionId}/${currentValue}/`)
                                .then(response => response.json())
                                .then(region_data => updateTable(region_data)) // Update the table
                                .catch(error => console.error('Error fetching data:', error));
                        }
                    });
                });

                // Add GeoJSON layer to the map
                geoJsonLayer.addTo(map);
            });
        })
        .catch(error => console.error('Error loading boundaries:', error));
}

// Call fetchBoundaries initially
fetchBoundaries();

// Function to update table with fetched data
function updateTable(data, isKpkRoad = false, isPkha, isKpkBridge = false) {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = ''; // Clear previous data
    let hardcodedFields = [];
    if (isKpkRoad) {
        if (isPkha) {
            // Define your own hardcoded field names
            hardcodedFields = [
                "Road length",
                "Highway Name"
            ];
        } else {
            // Define your own hardcoded field names
            hardcodedFields = [
                "Road length",
                "Black-top width (m)",
                "Shoulder type",
                "Shoulder width left",
                "Shoulder width right",
                "Year built",
                "Pavement condition",
                "No. of lanes",
                "Traffic load",
                "Strategic importance",
                "Feeding population",
                "Condition of culverts",
                "Length of drains",
                "Condition of drains",
                "Trees along roadside",
                "Basic amenities",
                "Administrative boundary",
                "Carriage way",
                "Median type",
                "Last Repaired",
                "Type of Last repair",
                "Road sign (boards intact)",
                "Road name",
                "District",
                "BT width (compared to 6m)",
                "Road class",
                "Pavement type",
                "Right of way",
            ];
        }
        // Ensure data is in an array or adjust this if data is an object with corresponding values
        hardcodedFields.forEach((field, index) => {
            const row = document.createElement('tr');
            const fieldCell = document.createElement('td');
            const valueCell = document.createElement('td');

            // Use hardcoded field names
            const strongElement = document.createElement('strong');
            strongElement.textContent = field;
            fieldCell.appendChild(strongElement); // Append the strong element to the field cell

            // Get the corresponding value from data by index or key if it’s an object
            const value = Object.values(data)[index]; // Adjust if needed based on data structure
            valueCell.textContent = value || 'N/A';

            row.appendChild(fieldCell);
            row.appendChild(valueCell);
            tableBody.appendChild(row);
        });
    } else if (isKpkBridge) {
        hardcodedFields = [
            "Bridge ID",
            "Road ID",
            "Segment No",
            "Latitude",
            "Longitude",
            "RD",
            "width (m)",
            "length (m)",
            "No of span",
            "height (m)",
            "Foundation",
            "Bridge type",
            "District",
            "Remarks",
            "Road No",
            "Road Name",
            "Year of completion",
            "Segment name",
            "Bridge name",
            "Contractor",
            "Executing",
            "Classification",
        ];
        hardcodedFields.forEach((field, index) => {
            const row = document.createElement('tr');
            const fieldCell = document.createElement('td');
            const valueCell = document.createElement('td');

            // Use hardcoded field names
            const strongElement = document.createElement('strong');
            strongElement.textContent = field;
            fieldCell.appendChild(strongElement); // Append the strong element to the field cell

            // Get the corresponding value from data by index or key if it’s an object
            const value = Object.values(data)[index]; // Adjust if needed based on data structure
            valueCell.textContent = value || 'N/A';

            row.appendChild(fieldCell);
            row.appendChild(valueCell);
            tableBody.appendChild(row);
        });
    } else {
        // Default handling when isKpkRoad is false
        for (const [key, value] of Object.entries(data)) {
            const row = document.createElement('tr');
            const fieldCell = document.createElement('td');
            const valueCell = document.createElement('td');

            // Create a strong element for the key
            const strongElement = document.createElement('strong');
            strongElement.textContent = key;
            fieldCell.appendChild(strongElement); // Append the strong element to the field cell

            valueCell.textContent = value;

            row.appendChild(fieldCell);
            row.appendChild(valueCell);
            tableBody.appendChild(row);
        }
    }
}

// Listen for button clicks to update currentValue and fetch new boundaries
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const buttonValue = button.getAttribute('data-value');
        if (buttonValue !== null) {
            currentValue = parseInt(buttonValue); // Get the value from data attribute
            map.setView([30.3753, 69.3451], 6);
            fetchBoundaries(); // Fetch boundaries based on the new currentValue
        }
    });
});

// kpk-div-button CODE here
document.getElementById('kpk-div-button').addEventListener('click', () => {
    map.setView([34.2, 72.3311], 7); // Slightly lower center for KPK

    currentValue = 2;

    fetch(`/api/admin-boundaries/${currentValue}/?filter='N.W.F.P.', 'F.A.T.A.'&division=True`)  // Use filter parameter for KPK
        .then(response => response.json())
        .then(data => {
            // Clear existing GeoJSON layers if needed
            if (!stickLayers) {
                // Clear all layers from the map
                map.eachLayer(function(layer) {
                    if (layer instanceof L.GeoJSON || layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });
            } 

            data.forEach(item => {
                // Create GeoJSON layer for each item and set up the style
                var geoJsonLayer = L.geoJSON(JSON.parse(item.geometry), {
                    style: {
                        color: "red",
                        weight: 2
                    }
                });

                // Bind popup to display region name on click
                geoJsonLayer.bindPopup(item.name);

                // Attach a click event to each feature in the GeoJSON layer
                geoJsonLayer.eachLayer(function (layer) {
                    layer.on('click', function() {
                        if (item && item.id) {
                            const regionId = item.id; // Access the region ID

                            // Fetch data for the clicked region using currentValue
                            fetch(`/get-region-data/${regionId}/${currentValue}/`)
                                .then(response => response.json())
                                .then(region_data => updateTable(region_data)) // Update the table
                                .catch(error => console.error('Error fetching data:', error));
                        }
                    });
                });

                // Add GeoJSON layer to the map
                geoJsonLayer.addTo(map);
            });
        })
        .catch(error => console.error('Error loading KPK Division boundaries:', error));
});

// kpk-dis-button CODE here
document.getElementById('kpk-dis-button').addEventListener('click', () => {
    map.setView([34.2, 72.3311], 7); // Slightly lower center for KPK

    currentValue = 3;

    fetch(`/api/admin-boundaries/${currentValue}/?filter='N.W.F.P.', 'F.A.T.A.'&district=True`)  // Use filter parameter for KPK
        .then(response => response.json())
        .then(data => {
            // Clear existing GeoJSON layers if needed
            if (!stickLayers) {
                // Clear all layers from the map
                map.eachLayer(function(layer) {
                    if (layer instanceof L.GeoJSON || layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });
            } 

            data.forEach(item => {
                // Create GeoJSON layer for each item and set up the style
                var geoJsonLayer = L.geoJSON(JSON.parse(item.geometry), {
                    style: {
                        color: "purple",
                        weight: 2
                    }
                });

                // Bind popup to display region name on click
                geoJsonLayer.bindPopup(item.name);

                // Attach a click event to each feature in the GeoJSON layer
                geoJsonLayer.eachLayer(function (layer) {
                    layer.on('click', function() {
                        if (item && item.id) {
                            const regionId = item.id; // Access the region ID

                            // Fetch data for the clicked region using currentValue
                            fetch(`/get-region-data/${regionId}/${currentValue}/`)
                                .then(response => response.json())
                                .then(region_data => updateTable(region_data)) // Update the table
                                .catch(error => console.error('Error fetching data:', error));
                        }
                    });
                });

                // Add GeoJSON layer to the map
                geoJsonLayer.addTo(map);
            });
        })
        .catch(error => console.error('Error loading KPK District boundaries:', error));
});

// Special handling for the KPK button
document.getElementById('kpk-button').addEventListener('click', () => {
    map.setView([34.2, 72.3311], 7); // Slightly lower center for KPK

    currentValue = 1;

    fetch(`/api/admin-boundaries/${currentValue}/?filter='N.W.F.P.', 'F.A.T.A.'`)  // Use filter parameter for KPK
        .then(response => response.json())
        .then(data => {
            // Clear existing GeoJSON layers if needed
            if (!stickLayers) {
                // Clear all layers from the map
                map.eachLayer(function(layer) {
                    if (layer instanceof L.GeoJSON || layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });
            } 

            data.forEach(item => {
                // Create GeoJSON layer for each item and set up the style
                var geoJsonLayer = L.geoJSON(JSON.parse(item.geometry), {
                    style: {
                        color: "blue",
                        weight: 2
                    }
                });

                // Bind popup to display region name on click
                geoJsonLayer.bindPopup(item.name);

                // Attach a click event to each feature in the GeoJSON layer
                geoJsonLayer.eachLayer(function (layer) {
                    layer.on('click', function() {
                        if (item && item.id) {
                            const regionId = item.id; // Access the region ID

                            // Fetch data for the clicked region using currentValue
                            fetch(`/get-region-data/${regionId}/${currentValue}/`)
                                .then(response => response.json())
                                .then(region_data => updateTable(region_data)) // Update the table
                                .catch(error => console.error('Error fetching data:', error));
                        }
                    });
                });

                // Add GeoJSON layer to the map
                geoJsonLayer.addTo(map);
            });
        })
        .catch(error => console.error('Error loading KPK boundaries:', error));
});
