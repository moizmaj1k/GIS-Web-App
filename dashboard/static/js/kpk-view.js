// WHEN CLICKING KPK BUTTON
document.getElementById("kpk-button").addEventListener("click", function() {
    // Set the display property of the specified buttons to "block"
    document.getElementById("goback-button").style.display = "block";
    document.getElementById("kpk-boundaries-dropdown").style.display = "block";
    document.getElementById("kpk-road-network-dropdown").style.display = "block"; 
    document.getElementById("kpk-bridges-dropdown").style.display = "block";
    // Set the display property of all other buttons to "none"
    document.querySelectorAll("#pk-button").forEach(button => {
        button.style.display = "none";
    });
});

// WHEN CLICKING GO BACK BUTTON
document.getElementById("goback-button").addEventListener("click", function() {
    // Set the display property of the specified buttons to "none"
    document.getElementById("goback-button").style.display = "none";
    document.getElementById("kpk-boundaries-dropdown").style.display = "none";
    document.getElementById("kpk-road-network-dropdown").style.display = "none";
    document.getElementById("kpk-bridges-dropdown").style.display = "none";

    // Set the display property of all other buttons to "block"
    document.querySelectorAll("#pk-button").forEach(button => {
        button.style.display = "block";
    });
    document.querySelector("#pk-button[data-value='0']").click();
});

// Attach click event listener to each dropdown item
document.querySelectorAll('.dropdown-item').forEach(function(item) {
    item.addEventListener('click', function() {
        // Remove the 'active' class from all dropdown items
        document.querySelectorAll('.dropdown-item').forEach(function(dropdownItem) {
            dropdownItem.classList.remove('active');
        });
        // Add the 'active' class to the clicked dropdown item
        this.classList.add('active');
    });
});

// ENABLING KPK DROPDOWNS
document.addEventListener('DOMContentLoaded', function () {
    // Enable dropdowns
    const dropdownSubmenus = document.querySelectorAll('.dropdown-submenu > button');
    dropdownSubmenus.forEach(function (submenuButton) {
        submenuButton.addEventListener('click', function (e) {
            // Toggle the submenu dropdown
            const submenu = submenuButton.nextElementSibling;
            submenu.classList.toggle('show');
        });
    });
});

// HANDLING ROAD NETWORK DATA
document.addEventListener("DOMContentLoaded", function () {
    // Store reference to side container and its child elements
    var action = '';
    const sideContainer = document.getElementById("side-container");
    const infoCard = document.getElementById("info-card");
    const tableContainer = document.getElementById("table-container");

    // Function to hide the side container and reset the table's height and card visibility
    function hideSideContainer() {
        sideContainer.style.display = "none"; // Hide the entire container
        tableContainer.style.height = "100%"; // Reset the table's height back to its max height
        infoCard.style.display = "none"; // Hide the card
    }

    // Target buttons with name="road_network_entry"
    document.querySelectorAll("[name='road_network_entry'], [name='pkha_road_network_entry'], [name='bridge_network_entry']").forEach(function(button) {
        button.addEventListener("click", function(event) {
            event.preventDefault();

            // If container is already displayed, hide it when clicking another button
            if (sideContainer.style.display === "block") {
                hideSideContainer();
            }

            // Show the side container when the button is clicked
            sideContainer.style.display = "flex"; // Display side container as a flexbox
            map.setView([33.4, 72.1311], 8);

            if (!stickLayers) {
                // Clear all layers from the map
                map.eachLayer(function(layer) {
                    if (layer instanceof L.GeoJSON || layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });
            } 

            // Get the district from the clicked button
            let roadNetworkDistrict = this.dataset.district || this.dataset.pkha;
            let roadNetworkPKHA = this.dataset.pkha;
            let bridgeNetworkDistrict = this.dataset.bridgedistrict;

            // Fetch geo data and update the card and table content
            fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    road_network_entry: roadNetworkDistrict,
                    pkha_road_network_entry: roadNetworkPKHA,
                    bridge_network_entry: bridgeNetworkDistrict
                })
            })
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data) && data.length && roadNetworkDistrict) {
                    const roadListContainer = document.createElement("div");
                    roadListContainer.classList.add("list-group");
                    let counter = 1;
                    data.forEach(item => {
                        action = event.target.getAttribute('data-action');
                        const roadName = item.name || 'Unnamed Road';

                        const roadLink = document.createElement("a");
                        roadLink.href = "#";
                        roadLink.classList.add("list-group-item", "list-group-item-action");
                        roadLink.textContent = counter +'. '+ roadName;
                        counter++;
                        roadLink.style.fontWeight = "bold";    
                        roadLink.style.padding = "0px 5px";   
                        roadLink.style.fontSize = "14px";
                        roadLink.style.backgroundColor = "#f3f1f8";    
                        roadLink.addEventListener("click", function() {
                            viewSpecificRoad(item.name);
                        });

                        roadListContainer.appendChild(roadLink);

                        const geoJSON = JSON.parse(item.geom);
                        // map.setView([geoJSON.coordinates[0][0][1], geoJSON.coordinates[0][0][0]], 10); 

                        if (action === 'district') {
                            color = 'red';
                        } else if (action === 'pkha') {
                            // Perform actions for the "PKHA Roads" button
                            color = 'magenta';
                        }

                        L.geoJSON(geoJSON, {
                            style: {
                                color: color,
                                weight: 3,
                                opacity: 0.8
                            },
                            onEachFeature: function(feature, layer) {
                                const roadName = item.name || 'Unnamed Road';
                                layer.bindPopup(`<strong>Road Name:</strong> ${roadName}`);
                                // Add click event to fetch additional road data
                                layer.on('click', function() {
                                    const roadId = item.gid; // Assuming 'gid' is the unique road identifier
                                    const isCnW = item.district;
                                    // Fetch additional road data from the server
                                    let isPkha = 2;
                                    if(isCnW){
                                        isPkha = 0;
                                    } else {
                                        isPkha = 1;
                                    }
                                    fetch(`/get-road-data/${roadId}/${isPkha}`)
                                        .then(response => response.json())
                                        .then(roadData => {
                                            let isPkha = false; 
                                            if(isCnW){
                                                isPkha = false;
                                            } else {
                                                isPkha = true;
                                            }
                                            // Call function to populate the table
                                            updateTable(roadData, true, isPkha);    // TODO
                                        })
                                        .catch(error => console.error('Error fetching road data:', error));
                                });
                            }
                        }).addTo(map);
                    });
                    // Update the card body to display the list of roads
                    infoCard.querySelector(".card-text").innerHTML = "";  // Clear any existing content
                    infoCard.querySelector(".card-text").appendChild(roadListContainer);
                } 
                else if (Array.isArray(data) && data.length && bridgeNetworkDistrict) {
                    const roadListContainer = document.createElement("div");
                    roadListContainer.classList.add("list-group");
                    let counter = 1;
                
                    data.forEach(item => {
                        action = event.target.getAttribute('data-action');
                        const roadName = item.bridge_name || 'Unnamed Bridge';
                
                        const roadLink = document.createElement("a");
                        roadLink.href = "#";
                        roadLink.classList.add("list-group-item", "list-group-item-action");
                        roadLink.textContent = counter + '. ' + roadName;
                        counter++;
                        roadLink.style.fontWeight = "bold";    
                        roadLink.style.padding = "0px 5px";   
                        roadLink.style.fontSize = "14px";
                        roadLink.style.backgroundColor = "#f3f1f8";    
                        roadLink.addEventListener("click", function() {
                            viewSpecificBridge(item.bridge_name);
                        });
                
                        roadListContainer.appendChild(roadLink);
                        
                        // Define a custom bridge icon
                        const bridgeIcon = L.icon({
                            iconUrl: "static/images/bridge.png", // Path to your bridge icon image
                            iconSize: [32, 32], // Size of the icon (width, height)
                            iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location (centered at the bottom)
                            popupAnchor: [0, -32] // Position of the popup relative to the icon
                        });

                        const geoJSON = JSON.parse(item.geom);
                
                        if (geoJSON.type === "Point") {
                            // Use marker for point geometries (for bridges)
                            const marker = L.marker([geoJSON.coordinates[1], geoJSON.coordinates[0]], {
                                icon: bridgeIcon
                            }).bindPopup(`<strong>Bridge Name:</strong> ${roadName}`);
                            marker.addTo(map);
                
                            // Click event on the marker to fetch additional data
                            marker.on('click', function() {
                                const bridgeId = item.gid;
                                fetch(`/get-bridge-data/${bridgeId}/`)
                                    .then(response => response.json())
                                    .then(roadData => {
                                        isKpkBridge = true;
                                        isPkha = false;
                                        // Populate the table with bridge data
                                        updateTable(roadData, false, isPkha, isKpkBridge);
                                    })
                                    .catch(error => console.error('Error fetching road data:', error));
                            });
                
                        }
                    });
                
                    // Update the card body to display the list of roads
                    infoCard.querySelector(".card-text").innerHTML = "";  // Clear any existing content
                    infoCard.querySelector(".card-text").appendChild(roadListContainer);
                }
                
            })
            .catch(error => console.error('Error fetching data:', error));
            // Display card and reduce table height
            infoCard.style.display = "block";
            tableContainer.classList.add("smaller-table-container");
            infoCard.querySelector(".card-title").textContent = `District: ${bridgeNetworkDistrict}`;
            infoCard.querySelector(".card-text").textContent = `Additional information about ${bridgeNetworkDistrict} will appear here.`;
        });
    });

    // Hide the side container and reset everything when any other button (except 'road_network_entry') is clicked
    document.querySelectorAll("button").forEach(function(button) {
        button.addEventListener("click", function(event) {
            // Check if the clicked button is NOT part of road_network_entry buttons
            if (!button.closest("[name='road_network_entry'], [name='pkha_road_network_entry'], [name='bridge_network_entry']")) {
                hideSideContainer();
            }
        });
    });

// Function to send the selected road name to a Django view and display the specific road on the map
function viewSpecificBridge(bridgeName) {

    fetch(`/view-individual-bridge/${bridgeName}/`, {
        method: 'GET',  // Assuming the view accepts GET requests
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.geom) {
            // Clear any existing layers on the map
            if (!stickLayers) {
                // Clear all layers and markers from the map
                map.eachLayer(function(layer) {
                    if (layer instanceof L.GeoJSON || layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });
            }
            // Define a custom bridge icon
            const bridgeIcon = L.icon({
                iconUrl: "static/images/bridge.png", // Path to your bridge icon image
                iconSize: [32, 32], // Size of the icon (width, height)
                iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location (centered at the bottom)
                popupAnchor: [0, -32] // Position of the popup relative to the icon
            });
            
            // Parse geometry and add marker if it's a point
            const geoJSON = JSON.parse(data.geom);
            if (geoJSON.type === 'Point') {
                
                const [longitude, latitude] = geoJSON.coordinates;
                map.setView([latitude, longitude], 12);

                // Add the marker for the road
                const marker = L.marker([latitude, longitude], {
                    icon: bridgeIcon
                })
                    .addTo(map)
                    .bindPopup(`<strong>Bridge Name:</strong> ${data.bridge_name || 'Unnamed Bridge'}`);

                // Fetch additional data on marker click
                marker.on('click', function() {
                    const bridgeId = data.gid; // Assuming 'gid' is the unique road identifier
                    fetch(`/get-bridge-data/${bridgeId}/`)
                        .then(response => response.json())
                        .then(roadData => {
                            isKpkBridge = true;
                            isPkha = false;
                            // Populate the table with bridge data
                            updateTable(roadData, false, isPkha, isKpkBridge);
                        })
                        .catch(error => console.error('Error fetching road data:', error));
                });
            } else {
                console.error('Expected Point geometry but received:', geoJSON.type);
            }
        } else {
            console.error('No data found for the road:', bridgeName);
        }
    })
    .catch(error => console.error('Error fetching road data:', error));
}

// Function to send the selected road name to a Django view and display the specific road on the map
function viewSpecificRoad(roadName) {
    let isPkha = 2;
    if (action === 'district') {
        isPkha = 0;
    } else if (action === 'pkha') {
        isPkha = 1;
    }
    fetch(`/view-individual-road/${roadName}/${isPkha}/`, {
        method: 'GET',  // Assuming the view accepts GET requests
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.geom) {
            // Clear any existing layers on the map
            if (!stickLayers) {
                    // Clear all layers from the map
                    map.eachLayer(function(layer) {
                        if (layer instanceof L.GeoJSON || layer instanceof L.Marker) {
                            map.removeLayer(layer);
                        }
                    });
                } 

            const geoJSON = JSON.parse(data.geom); // Assuming geom is a valid GeoJSON string
            map.setView([geoJSON.coordinates[0][0][1], geoJSON.coordinates[0][0][0]], 10);
            // Add the road data as a GeoJSON layer on the map
            L.geoJSON(geoJSON, {
                style: {
                    color: 'blue',
                    weight: 4,
                    opacity: 1
                },
                onEachFeature: function(feature, layer) {
                    const roadName = data.name || 'Unnamed Road';
                    layer.bindPopup(`<strong>Road Name:</strong> ${roadName}`);
                    // Add click event to fetch additional road data
                    layer.on('click', function() {
                        const roadId = data.gid; // Assuming 'gid' is the unique road identifier

                        // Fetch additional road data from the server
                        fetch(`/get-road-data/${roadId}/${isPkha}/`)
                            .then(response => response.json())
                            .then(roadData => {
                                // Call function to populate the table
                                updateTable(roadData, true, isPkha);
                            })
                            .catch(error => console.error('Error fetching road data:', error));
                    });

                }
            }).addTo(map);
        } else {
            console.error('No data found for the road:', roadName);
        }
    })
    .catch(error => console.error('Error fetching road data:', error));
}

// Function to get the CSRF token for the AJAX request
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
});

