// Declare global variables for the map and its elements
let map;
let markers = [];
let polyline;
const distanceDisplay = document.getElementById("distance-display");
const weatherDisplay = document.getElementById("weather-display");
let currentHurdleIndex = 0; // Keeps track of the current hurdle being displayed
let hurdlesData = []; // Array to hold the fetched hurdles data
let flightStarted = false; // Flag to check if the flight has started
const hurdleDescription = document.getElementById("hurdle-description");
const option1 = document.getElementById("option-1");
const option2 = document.getElementById("option-2");
const resultMessage = document.getElementById("result-message");
const hurdleSection = document.getElementById("hurdle-section");
const resultSection = document.getElementById("result-section");
const startFlightButton = document.getElementById("start-flight");

// Initialize the map after DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    initMap();

    // Event listener for starting the game
    document.getElementById("start-game").addEventListener("click", async () => {
        const username = document.getElementById("username").value.trim();
        if (!username) {
            alert("Please enter a valid username.");
            return;
        }

        try {
            const userData = await api.createUser(username);
            console.log("User creation response:", userData);

            if (userData.status === "success") {
                alert(userData.data.message);
                document.getElementById("auth-section").style.display = "none";
                document.getElementById("game-section").style.display = "block";

                const welcomeMessage = document.getElementById("welcome-message");
                welcomeMessage.innerHTML = `Welcome, ${username}!`;
                welcomeMessage.style.display = "block";

                await loadAirports();
            } else {
                alert(userData.message);
            }
        } catch (error) {
            console.error("Error creating user:", error);
            alert("Error creating user.");
        }
    });

    // Event listener for scheduling flight
    document.getElementById("schedule-flight").addEventListener("click", async () => {
        await scheduleFlight();
    });

    // Event listeners for departure and arrival airports
    document.getElementById("departure-airport").addEventListener("change", updateMap);
    document.getElementById("arrival-airport").addEventListener("change", updateMap);

    startFlightButton.addEventListener("click", async () => {
        // Set flag to true to prevent re-starting the flight
        await loadHurdles(); // Load hurdles when the flight starts
    });

    // Option button listeners for answering the hurdle
    document.getElementById("answer-option-1").addEventListener("click", () => handleAnswer(1));
    document.getElementById("answer-option-2").addEventListener("click", () => handleAnswer(2));
});

function initMap() {
    if (map) {
        map.off();
        map.remove();
    }

    map = L.map("map").setView([20, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
    }).addTo(map);
}

async function loadAirports() {
    try {
        console.log("Fetching airports...");
        const airportData = await api.getAirports(); // Fetch the list of airports
        console.log("Fetched airport data:", airportData);

        const departureSelect = document.getElementById("departure-airport");
        const arrivalSelect = document.getElementById("arrival-airport");

        // Clear existing options
        departureSelect.innerHTML = "";
        arrivalSelect.innerHTML = "";

        // Add default placeholder option
        const defaultOption = document.createElement("option");
        defaultOption.value = ""; // No value to indicate it's a placeholder
        defaultOption.textContent = "Select an Airport";
        defaultOption.selected = true;
        defaultOption.disabled = true;

        // Append default option to both dropdowns
        departureSelect.appendChild(defaultOption.cloneNode(true));
        arrivalSelect.appendChild(defaultOption.cloneNode(true));

        if (airportData?.data?.length > 0) {
            airportData?.data.forEach((airport) => {
                const option = document.createElement("option");
                option.value = airport[0]; // Ensure unique ID is available
                option.textContent = airport[1] || `Unknown Airport (${airport[0]})`; // Fallback name
                departureSelect.appendChild(option.cloneNode(true));
                arrivalSelect.appendChild(option.cloneNode(true));
            });
        } else {
            console.warn("No airports available.");
            const noDataOption = document.createElement("option");
            noDataOption.textContent = "No airports available";
            noDataOption.disabled = true;
            departureSelect.appendChild(noDataOption);
            arrivalSelect.appendChild(noDataOption);
        }
    } catch (error) {
        console.error("Error loading airports:", error);
        alert("Failed to fetch airport list. Please try again.");
    }
}

async function scheduleFlight() {
    const departureId = document.getElementById("departure-airport").value;
    const arrivalId = document.getElementById("arrival-airport").value;

    if (!departureId || !arrivalId) {
        alert("Please select both departure and arrival airports.");
        return;
    }

    console.log(`Scheduling flight from ${departureId} to ${arrivalId}`);
    await updateMap();
}

async function updateMap() {
    const departureId = document.getElementById("departure-airport").value;
    const arrivalId = document.getElementById("arrival-airport").value;

    if (!departureId || !arrivalId) {
        console.error("One or both airport IDs are undefined or empty.");
        return;
    }

    try {
        const departureResponse = await api.getAirportById(departureId);
        const arrivalResponse = await api.getAirportById(arrivalId);

        console.log("Departure Response:", departureResponse);
        console.log("Arrival Response:", arrivalResponse);

        const departureAirport = departureResponse?.data; // Ensure it exists
        const arrivalAirport = arrivalResponse?.data; // Ensure it exists

        if (!departureAirport || !arrivalAirport) {
            console.error("One or both airports not found.");
            alert("One or both selected airports could not be found.");
            return;
        }

        const depLat = parseFloat(departureAirport.latitude_deg ?? 0);
        const depLon = parseFloat(departureAirport.longitude_deg ?? 0);
        const arrLat = parseFloat(arrivalAirport.latitude_deg ?? 0);
        const arrLon = parseFloat(arrivalAirport.longitude_deg ?? 0);

        if (
            isNaN(depLat) || isNaN(depLon) || isNaN(arrLat) || isNaN(arrLon)
        ) {
            console.error("Invalid latitude or longitude values.");
            alert("Invalid latitude or longitude values for the selected airports.");
            return;
        }

        // Update map elements
        updateMapElements(depLat, depLon, arrLat, arrLon, departureAirport.name, arrivalAirport.name);
    } catch (error) {
        console.error("Error fetching airport data:", error);
        alert("An error occurred while updating the map. Please try again.");
    }
}

function updateMapElements(depLat, depLon, arrLat, arrLon, departureName, arrivalName) {
    // Remove old markers
    markers.forEach((marker) => map.removeLayer(marker));
    markers = [];

    // Add new markers
    const depMarker = L.marker([depLat, depLon]).addTo(map).bindPopup(departureName);
    const arrMarker = L.marker([arrLat, arrLon]).addTo(map).bindPopup(arrivalName);
    markers.push(depMarker, arrMarker);

    // Fit map to bounds
    const bounds = L.latLngBounds([depMarker.getLatLng(), arrMarker.getLatLng()]);
    map.fitBounds(bounds);

    // Draw polyline
    if (polyline) {
        map.removeLayer(polyline);
    }
    polyline = L.polyline(
        [
            [depLat, depLon],
            [arrLat, arrLon],
        ],
        { color: "blue" }
    ).addTo(map);

    // Display distance
    const distance = map.distance(depMarker.getLatLng(), arrMarker.getLatLng());
    distanceDisplay.innerHTML = `Distance: ${(distance / 1000).toFixed(2)} km`;

    // Display weather
    displayRandomWeather();
}

function displayRandomWeather() {
    const weatherConditions = ["Sunny", "Cloudy", "Rainy", "Stormy", "Snowy"];
    const temperature = Math.floor(Math.random() * 35) + 1;
    const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

    weatherDisplay.innerHTML = `Weather: ${condition}, Temperature: ${temperature}°C`;
}

async function loadHurdles() {
    try {
        const randomLevel = Math.floor(Math.random() * 4) + 1; // Random level between 1 and 4
        console.log(`Fetching hurdles for level ${randomLevel}...`);
        const hurdles = await api.getHurdles(randomLevel);  // Fetch hurdles for the level
        console.log({hsfkjsh: hurdles})
        hurdlesData = hurdles || [];
        currentHurdleIndex = 0;  // Reset the hurdle index
        if (hurdlesData?.length > 0) {
            displayHurdle();
        } else {
            console.warn("No hurdles available.");
            hurdleDescription.innerHTML = "No hurdles available.";
        }
    } catch (error) {
        console.error("Error loading hurdles:", error);
        alert("Error loading hurdles. Please try again.");
    }
}

function displayHurdle() {
    if (currentHurdleIndex >= hurdlesData.length) {
        resultMessage.innerHTML = "Congratulations! You have completed the flight successfully!";
        resultSection.style.display = "block";
        hurdleSection.style.display = "none";
        return;
    }

    const hurdle = hurdlesData[currentHurdleIndex];
    hurdleDescription.innerHTML = hurdle.description;
    option1.innerHTML = 'Option 1';
    option2.innerHTML = 'Option 2';
    hurdleSection.style.display = "block";
}

function handleAnswer(selectedOption) {
    const hurdle = hurdlesData[currentHurdleIndex];
    const correctAnswer = selectedOption === 1 ? hurdle.correctOption1 : hurdle.correctOption2;

    if (correctAnswer) {
        resultMessage.innerHTML = "Correct answer! You passed the hurdle.";
    } else {
        resultMessage.innerHTML = "Incorrect answer. Try again.";
    }

    setTimeout(() => {
        currentHurdleIndex++;
        displayHurdle();
    }, 2000);
}
