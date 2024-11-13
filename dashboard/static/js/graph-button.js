// Custom button control
const customButton = L.control({ position: 'topright' }); // Change 'topright' to any corner like 'topleft', 'bottomright', etc.

customButton.onAdd = function(map) {
    // Create a div element to hold the button
    const buttonDiv = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    
    // Set the button content
    buttonDiv.innerHTML = '<button>View Graphs</button>';
    buttonDiv.style.width = '80px'; // Adjust width as needed
    buttonDiv.style.height = '30px'; // Adjust height as needed
    buttonDiv.style.cursor = 'pointer';
    
    // Optional: Customize button styling
    buttonDiv.querySelector('button').style.padding = '3.7px';
    buttonDiv.querySelector('button').style.backgroundColor = '#7091E6'; // Customize color
    buttonDiv.querySelector('button').style.color = '#FFF';
    buttonDiv.querySelector('button').style.border = 'none';
    buttonDiv.querySelector('button').style.borderRadius = '4px';

    // Add click event for button
    buttonDiv.onclick = function() {
        // Custom functionality when button is clicked
        alert('Button Clicked!');
        // You could zoom, pan, or trigger other actions on the map here
    };

    return buttonDiv;
};

// Add listeners to show or hide the button based on popup state
map.on('popupopen', function() {
    customButton.addTo(map);  // Show button when popup opens
});

map.on('popupclose', function() {
    map.removeControl(customButton);  // Remove button when popup closes
});

