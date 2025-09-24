const API_URL = "https://lethrent-app.onrender.com/api";

// --- Helper Functions ---
const showNotification = (message, isError = false) => {
    const notification = document.getElementById('notification');
    if (!notification) {
        alert(message);
        return;
    }
    notification.textContent = message;
    notification.classList.remove('hidden', 'bg-green-500', 'bg-red-500');
    notification.classList.add(isError ? 'bg-red-500' : 'bg-green-500');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
};

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
  handleAuthForms();
  handlePageSpecificLogic();
});

function handleAuthForms() {
    const signupForm = document.getElementById("signup-form");
    if (signupForm) signupForm.addEventListener("submit", handleSignup);
    const loginForm = document.getElementById("login-form");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);
}

function handlePageSpecificLogic() {
    const path = window.location.pathname;
    if (path.endsWith('vehicles.html')) loadAllVehicles();
    else if (path.endsWith('dashboard.html')) setupOwnerDashboard();
    else if (path.endsWith('bookings.html')) loadMyBookings();
}

// --- Auth Functions ---
async function handleSignup(e) {
    e.preventDefault();
    const form = e.target;
    const user = { name: form.querySelector("#name").value, email: form.querySelector("#email").value, password: form.querySelector("#password").value, phone: form.querySelector("#phone").value, role: form.querySelector("#role").value };
    try {
        const res = await fetch(`${API_URL}/auth/signup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(user) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");
        showNotification("Signup successful! Redirecting to login...");
        setTimeout(() => window.location.href = "login.html", 1500);
    } catch (err) {
        showNotification(err.message, true);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const creds = { email: form.querySelector("#email").value, password: form.querySelector("#password").value };
    try {
        const res = await fetch(`${API_URL}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(creds) });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Invalid credentials");
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("role", data.role);
        showNotification("Login successful!");
        setTimeout(() => { window.location.href = data.role === "owner" ? "dashboard.html" : "vehicles.html"; }, 1000);
    } catch (err) {
        showNotification(err.message, true);
    }
}

// --- Vehicle Functions ---
async function loadAllVehicles() {
  const vehicleList = document.getElementById("vehicle-list");
  if (!vehicleList) return;
  try {
    const res = await fetch(`${API_URL}/vehicles`);
    const vehicles = await res.json();
    vehicleList.innerHTML = "";
    if (vehicles.length === 0) {
        vehicleList.innerHTML = '<p class="text-gray-500 col-span-full text-center">No vehicles have been listed yet.</p>';
        return;
    }
    vehicles.forEach((v) => {
      const card = document.createElement("div");
      // This logic now correctly shows the status and disables the button if not available
      card.className = `bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col ${!v.is_available ? 'opacity-60' : ''}`;
      card.innerHTML = `
        <h3 class="text-2xl font-bold text-gray-800">${v.brand} ${v.model}</h3>
        <p class="text-gray-500 mt-1">Reg No: ${v.reg_number}</p>
        <div class="my-4">
            <span class="text-3xl font-bold text-indigo-600">₹${v.price_per_day}</span><span class="text-gray-500">/day</span>
        </div>
        <div class="mt-auto">
            ${v.is_available 
                ? `<button onclick="bookVehicle(${v.vehicle_id})" class="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300">Book Now</button>` 
                : '<button class="w-full bg-gray-400 text-white font-bold py-3 px-4 rounded-lg cursor-not-allowed">Booked</button>'}
        </div>`;
      vehicleList.appendChild(card);
    });
  } catch (err) {
    vehicleList.innerHTML = '<p class="text-red-500 col-span-full text-center">Failed to load vehicles.</p>';
  }
}

// --- Owner Dashboard ---
function setupOwnerDashboard() {
    const vehicleForm = document.getElementById("vehicle-form");
    if (vehicleForm) {
        vehicleForm.addEventListener("submit", handleAddVehicle);
        loadMyVehicles();
    }
}

async function handleAddVehicle(e) {
    e.preventDefault();
    const form = e.target;
    const vehicle = { owner_id: localStorage.getItem("user_id"), brand: form.querySelector("#brand").value, model: form.querySelector("#model").value, reg_number: form.querySelector("#reg_number").value, price_per_day: form.querySelector("#price").value };
    try {
        const res = await fetch(`${API_URL}/vehicles`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vehicle) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add vehicle');
        showNotification("Vehicle added successfully!");
        form.reset();
        loadMyVehicles();
    } catch (err) {
        showNotification(err.message, true);
    }
}

async function loadMyVehicles() {
    const myVehiclesSection = document.getElementById("my-vehicles");
    const ownerId = localStorage.getItem("user_id");
    if (!myVehiclesSection || !ownerId) return;
    try {
        const res = await fetch(`${API_URL}/vehicles/owner/${ownerId}`);
        const myVehicles = await res.json();
        myVehiclesSection.innerHTML = "";
        if (myVehicles.length === 0) {
            myVehiclesSection.innerHTML = '<p class="text-gray-500">You have not added any vehicles yet.</p>';
            return;
        }
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
        myVehicles.forEach(v => {
            const card = document.createElement("div");
            card.className = "bg-white p-6 rounded-lg shadow-md";
            card.innerHTML = `<h3 class="text-xl font-bold text-gray-800">${v.brand} ${v.model}</h3><p class="text-gray-600 mt-2">Reg No: <span class="font-semibold">${v.reg_number}</span></p><p class="text-gray-600">Price: <span class="font-semibold">₹${v.price_per_day}/day</span></p><p class="mt-4 text-sm">Status: ${ v.is_available ? '<span class="text-green-600 font-semibold">Available</span>' : '<span class="text-red-600 font-semibold">Booked</span>'}</p>`;
            grid.appendChild(card);
        });
        myVehiclesSection.appendChild(grid);
    } catch (err) {
        myVehiclesSection.innerHTML = '<p class="text-red-500">Failed to load your vehicles.</p>';
    }
}

// --- Booking Functions ---
async function bookVehicle(vehicleId) {
    const renterId = localStorage.getItem("user_id");
    if (!renterId) {
        showNotification("Please login as a renter to book a vehicle.", true);
        return;
    }
    const booking = { vehicle_id: vehicleId, renter_id: renterId, start_date: "2025-10-01", end_date: "2025-10-05" };
    try {
        const res = await fetch(`${API_URL}/bookings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(booking) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Booking failed');
        showNotification(`Booking confirmed! You can view it in 'My Bookings'.`);
        loadAllVehicles();
    } catch (err) {
        showNotification(err.message, true);
    }
}

async function loadMyBookings() {
    const bookingList = document.getElementById("booking-list");
    const renterId = localStorage.getItem("user_id");
    if (!bookingList || !renterId) return;
    try {
        const res = await fetch(`${API_URL}/bookings/${renterId}`);
        const bookings = await res.json();
        bookingList.innerHTML = "";
        if (bookings.length === 0) {
            bookingList.innerHTML = '<p class="text-gray-500">You have no bookings.</p>';
            return;
        }
        bookings.forEach(b => {
            const card = document.createElement("div");
            card.className = "bg-white p-6 rounded-lg shadow-md";
            card.innerHTML = `
                <h3 class="text-xl font-bold text-gray-800">Booking #${b.booking_id}</h3>
                <p class="text-gray-600 mt-2">Vehicle: <span class="font-semibold">${b.brand} ${b.model}</span></p>
                <p class="text-gray-600">From: <span class="font-semibold">${new Date(b.start_date).toLocaleDateString()}</span> → To: <span class="font-semibold">${new Date(b.end_date).toLocaleDateString()}</span></p>
                <p class="mt-4 text-sm capitalize">Status: <span class="text-green-600 font-semibold">${b.status}</span></p>`;
            bookingList.appendChild(card);
        });
    } catch (err) {
        bookingList.innerHTML = '<p class="text-red-500">Failed to load your bookings.</p>';
    }
}

