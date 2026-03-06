// ================= USER =================
const user = {
    name: localStorage.getItem("username") || "User",
    email: localStorage.getItem("email"),
    profilePic: localStorage.getItem("profilePic") || ""
};

// Set UI elements
const usernameDisplay = document.getElementById("username");
if (usernameDisplay) usernameDisplay.innerText = user.name;

const img = document.getElementById("profileImg");
const avatar = document.getElementById("avatar");
const dropdownAvatar = document.getElementById('dropdownAvatar');
const dropdownName = document.getElementById('dropdownName');

function updateProfileUI() {
    if (user.profilePic) {
        if (img) { img.src = user.profilePic; img.style.display = "block"; }
        if (avatar) avatar.style.display = "none";
        if (dropdownAvatar) dropdownAvatar.style.display = 'none';
    } else {
        const initial = user.name.charAt(0).toUpperCase();
        if (avatar) { avatar.innerText = initial; avatar.style.display = "flex"; }
        if (img) img.style.display = "none";
        if (dropdownAvatar) { dropdownAvatar.innerText = initial; dropdownAvatar.style.display = 'flex'; }
    }
    if (dropdownName) dropdownName.innerText = user.name;
}

updateProfileUI();

// Pre-request geolocation permission
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(() => {}, () => {});
}

// ================= DROPDOWN =================
function toggleMenu() {
    const menu = document.getElementById("dropdown");
    if (menu) menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// ================= MODAL =================
function openEditProfile() {
    document.getElementById("editModal").style.display = "flex";
    displayEmergencyEmails();
}

function closeEditProfile() {
    document.getElementById("editModal").style.display = "none";
}

document.addEventListener('click', function (e) {
    const modal = document.getElementById('editModal');
    if (modal && modal.style.display === 'flex' && e.target === modal) {
        closeEditProfile();
    }
});

// ================= EMAIL STORAGE (server-backed) =================
async function displayEmergencyEmails() {
    const list = document.getElementById("savedEmails");
    if (!list) return;
    list.innerHTML = "";

    if (!user.email) {
        list.innerHTML = '<li>Please login to save emergency contacts</li>';
        return;
    }

    try {
        const res = await fetch(`/api/get-emails?owner=${encodeURIComponent(user.email)}`);
        const payload = await res.json();
        let items = Array.isArray(payload) ? payload : (payload?.data?.contacts || []);

        if (items.length === 0) {
            list.innerHTML = '<li>No contacts saved</li>';
            return;
        }

        items.forEach(item => {
            const id = item._id || item.id || '';
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${item.email}</span>
                <button onclick="removeEmergencyEmail('${id}')">❌</button>
            `;
            list.appendChild(li);
        });
    } catch (err) {
        list.innerHTML = '<li>Error loading contacts</li>';
    }
}

async function addEmergencyEmail() {
    const input = document.getElementById("newEmergencyEmail");
    const email = input?.value.trim();

    if (!email || !email.includes("@")) return alert("❌ Valid email required");
    if (!user.email) return alert('❌ Login required');

    try {
        const res = await fetch('/api/save-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, ownerEmail: user.email })
        });

        if (!res.ok) {
            const data = await res.json();
            return alert('❌ ' + (data.message || 'Could not save'));
        }

        input.value = '';
        displayEmergencyEmails();
        alert('✅ Email saved');
    } catch (err) {
        alert('❌ Failed to save');
    }
}

async function removeEmergencyEmail(id) {
    try {
        const res = await fetch(`/api/delete-email/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        displayEmergencyEmails();
    } catch (err) {
        alert('❌ Failed to delete');
    }
}

function saveProfile() {
    const newName = document.getElementById("editName").value;
    const imageInput = document.getElementById("editImage");

    if (newName) {
        localStorage.setItem("username", newName);
        user.name = newName;
    }

    if (imageInput && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function () {
            localStorage.setItem("profilePic", reader.result);
            user.profilePic = reader.result;
            updateProfileUI();
            alert("Profile updated ✅");
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        updateProfileUI();
        alert("Profile updated ✅");
    }
    closeEditProfile();
}

// ================= SOS LOGIC =================
const sosBtn = document.getElementById("sosBtn");
if (sosBtn) sosBtn.addEventListener("click", sendSOS);

async function getEmergencyContacts() {
    try {
        const r = await fetch(`/api/get-emails?owner=${encodeURIComponent(user.email)}`);
        const payload = await r.json();
        return Array.isArray(payload) ? payload.map(i => i.email) : (payload?.data?.contacts?.map(c => c.email) || []);
    } catch (e) {
        return [];
    }
}

async function sendSOS() {
    if (!user.email) return alert('❌ Login required');

    const emails = await getEmergencyContacts();
    if (emails.length === 0) return alert("❌ No emergency contacts saved");

    if (!navigator.geolocation) return alert("❌ Geolocation not supported");

    navigator.geolocation.getCurrentPosition(async (position) => {
        sendSOSWithCoords(position.coords.latitude, position.coords.longitude);
    }, async (error) => {
        if (error.code === error.PERMISSION_DENIED) {
            if (confirm('Location denied. Enter coordinates manually?')) {
                const lat = prompt('Enter latitude:');
                const lon = prompt('Enter longitude:');
                if (lat && lon) sendSOSWithCoords(lat, lon);
            }
        } else {
            alert("❌ " + error.message);
        }
    }, { enableHighAccuracy: true });
}

async function sendSOSWithCoords(lat, lon) {
    // CORRECTED URL FORMAT
    const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;
    const message = `🚨 EMERGENCY ALERT!\n\n${user.name} needs help immediately!\n\n📍 Location:\n${mapLink}`;
    
    const emails = await getEmergencyContacts();

    try {
        const res = await fetch('/api/sos', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emails, message })
        });
        const data = await res.json();
        alert(data.message || "🚨 SOS Sent!");
    } catch (err) {
        alert("❌ Failed to send SOS");
    }
}

// ================= LOCATION SHARING (LIVE TRACKING) =================
let locationWatchId = null;

function shareLocation() {
    if (!navigator.geolocation) return alert("❌ Geolocation not supported");

    document.getElementById("locationModal").style.display = "flex";

    locationWatchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            window.userLocation = { lat: latitude, lon: longitude };
            
            document.getElementById("liveIndicator").innerHTML = "🟢 Live Tracking Active";
            document.getElementById("liveIndicator").style.color = "#34c471";
            document.getElementById("coordsDisplay").innerText = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            document.getElementById("accuracyDisplay").innerText = Math.round(accuracy);
            
            // Fixed Link Syntax
            const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
            document.getElementById("locationLink").value = mapLink;
            
            const mapFrame = document.getElementById("mapFrame");
            if (mapFrame) {
                mapFrame.src = `https://www.google.com/maps?q=${latitude},${longitude}&output=embed`;
            }
        },
        (error) => {
            document.getElementById("liveIndicator").innerHTML = "🔴 Location Error";
            alert("❌ " + error.message);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
}

function stopLocationTracking() {
    if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
        locationWatchId = null;
    }
    document.getElementById("locationModal").style.display = "none";
}

function closeLocationModal() {
    stopLocationTracking();
}

function copyLocationLink() {
    const link = document.getElementById("locationLink").value;
    if (!link) return alert("❌ No location found");
    navigator.clipboard.writeText(link).then(() => alert("✅ Link copied!"));
}

async function shareLocationWithContacts() {
    if (!window.userLocation) return alert("❌ Location not found");
    
    const { lat, lon } = window.userLocation;
    const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;
    const emails = await getEmergencyContacts();
    
    if (emails.length === 0) return alert("❌ No emergency contacts saved.");
    
    const message = `📍 ${user.name} is sharing their LIVE location!\n\nView here: ${mapLink}`;

    try {
        await fetch('/api/sos', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emails, message })
        });
        alert("✅ Live location shared!");
    } catch (err) {
        alert("❌ Failed to share");
    }
}

// ================= MODAL HELPERS =================
function openSafetyTips() { document.getElementById("safetyTipsModal").style.display = "flex"; }
function closeSafetyTips() { document.getElementById("safetyTipsModal").style.display = "none"; }
function openEmergencyNumbers() { document.getElementById("emergencyNumbersModal").style.display = "flex"; }
function closeEmergencyNumbers() { document.getElementById("emergencyNumbersModal").style.display = "none"; }
function callNumber(num) { window.location.href = "tel:" + num; }