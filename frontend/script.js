const API_URL = "https://lethrent-app.onrender.com/api"; // Make sure this is your live Render URL

// --- Helper Functions ---
const showNotification = (message, isError = false) => {
    const notification = document.getElementById('notification');
    if (!notification) { alert(message); return; }
    notification.textContent = message;
    notification.classList.remove('hidden', 'bg-green-500', 'bg-red-500');
    notification.classList.add(isError ? 'bg-red-500' : 'bg-green-500');
    setTimeout(() => { notification.classList.add('hidden'); }, 3000);
};

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded. Initializing scripts.");
  handleAuthForms();
  handlePageSpecificLogic();
});

function handleAuthForms() {
    console.log("Setting up authentication form listeners...");
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        console.log("Signup form found.");
        signupForm.addEventListener("submit", handleSignup);
    }
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        console.log("Login form found.");
        loginForm.addEventListener("submit", handleLogin);
    }
}

function handlePageSpecificLogic() {
    const path = window.location.pathname;
    console.log("Page logic handler running for path:", path);

    // This is a more robust check to see which page we are on.
    if (document.getElementById('vehicle-list')) {
        console.log("Detected: Vehicles Page. Firing loadAllVehicles().");
        loadAllVehicles();
    } else if (document.getElementById('vehicle-form')) {
        console.log("Detected: Owner Dashboard Page. Firing setupOwnerDashboard().");
        setupOwnerDashboard();
    } else if (document.getElementById('booking-list')) {
        console.log("Detected: My Bookings Page. Firing loadMyBookings().");
        loadMyBookings();
    } else {
        console.log("No specific page logic detected for this path.");
    }
}

// --- Auth Functions (no changes, included for completeness) ---
async function handleSignup(e) { e.preventDefault(); /* ... same as before ... */ }
async function handleLogin(e) { e.preventDefault(); /* ... same as before ... */ }

// --- Vehicle Functions (no changes, included for completeness) ---
async function loadAllVehicles() { /* ... same as before ... */ }

// --- Owner Dashboard (no changes, included for completeness) ---
function setupOwnerDashboard() { /* ... same as before ... */ }
async function handleAddVehicle(e) { e.preventDefault(); /* ... same as before ... */ }
async function loadMyVehicles() { /* ... same as before ... */ }

// --- Booking Functions ---
async function bookVehicle(vehicleId) { /* ... same as before ... */ }

// THIS IS THE FUNCTION WE ARE DEBUGGING
async function loadMyBookings() {
    console.log("--- Executing loadMyBookings function ---");
    const bookingList = document.getElementById("booking-list");
    const renterId = localStorage.getItem("user_id");

    console.log("Found booking list element:", bookingList);
    console.log("Found user_id in localStorage:", renterId);

    if (!bookingList || !renterId) {
        console.error("Stopping: A required element or user_id is missing. Cannot fetch bookings.");
        if (!renterId) bookingList.innerHTML = '<p class="text-yellow-500 text-center">Please log in to see your bookings.</p>';
        return;
    }
    
    console.log("Checks passed. Proceeding to fetch bookings from the API...");
    try {
        const res = await fetch(`${API_URL}/bookings/${renterId}`);
        console.log("API Response Status:", res.status);
        const bookings = await res.json();
        console.log("Received bookings data:", bookings);

        bookingList.innerHTML = "";
        if (bookings.length === 0) {
            bookingList.innerHTML = '<p class="text-gray-500 text-center">You have not made any bookings yet.</p>';
            return;
        }
        bookings.forEach(b => {
            const card = document.createElement("div");
            card.className = "bg-white p-6 rounded-lg shadow-md";
            card.innerHTML = `
                <div class="flex justify-between items-center">
                    <h3 class="text-xl font-bold text-gray-800">${b.brand} ${b.model}</h3>
                    <span class="text-sm font-semibold capitalize px-3 py-1 rounded-full ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${b.status}</span>
                </div>
                <p class="text-gray-600 mt-2">Booking ID: <span class="font-semibold">#${b.booking_id}</span></p>
                <p class="text-gray-600">Dates: <span class="font-semibold">${new Date(b.start_date).toLocaleDateString()}</span> → <span class="font-semibold">${new Date(b.end_date).toLocaleDateString()}</span></p>
                `;
            bookingList.appendChild(card);
        });
    } catch (err) {
        console.error("Error during fetch in loadMyBookings:", err);
        bookingList.innerHTML = '<p class="text-red-500 text-center">Failed to load your bookings due to an error.</p>';
    }
}



