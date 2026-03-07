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
const dropdownImg = document.getElementById('dropdownProfileImg');
const dropdownName = document.getElementById('dropdownName');
const editNameInput = document.getElementById("editName");
const editImageInput = document.getElementById("editImage");

const ALLOWED_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif"
];

function safeSetLocalStorage(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (err) {
        return false;
    }
}

function clearProfilePicture(showAlert = false) {
    localStorage.removeItem("profilePic");
    user.profilePic = "";
    updateProfileUI();
    if (editImageInput) editImageInput.value = "";
    if (showAlert) alert("Profile picture deleted.");
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read selected image."));
        reader.readAsDataURL(file);
    });
}

function downscaleImage(dataUrl, maxSize = 720, outputType = "image/webp", quality = 0.82) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
            const width = Math.max(1, Math.round(image.width * ratio));
            const height = Math.max(1, Math.round(image.height * ratio));

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Image processing is not supported in this browser."));
                return;
            }

            ctx.drawImage(image, 0, 0, width, height);
            try {
                resolve(canvas.toDataURL(outputType, quality));
            } catch (err) {
                reject(new Error("Could not optimize image."));
            }
        };
        image.onerror = () => reject(new Error("Invalid image file."));
        image.src = dataUrl;
    });
}

function buildProfilePictureWithFallbacks(rawDataUrl) {
    const variants = [
        Promise.resolve(rawDataUrl),
        downscaleImage(rawDataUrl, 900, "image/webp", 0.86),
        downscaleImage(rawDataUrl, 720, "image/webp", 0.82),
        downscaleImage(rawDataUrl, 560, "image/webp", 0.78)
    ];

    return variants.reduce(async (previousAttempt, currentAttempt) => {
        const previous = await previousAttempt;
        if (previous) return previous;

        try {
            const candidate = await currentAttempt;
            return candidate;
        } catch (err) {
            return null;
        }
    }, Promise.resolve(null));
}

function updateProfileUI() {
    if (usernameDisplay) usernameDisplay.innerText = user.name || "User";

    if (user.profilePic) {
        if (img) { img.src = user.profilePic; img.style.display = "block"; }
        if (dropdownImg) { dropdownImg.src = user.profilePic; dropdownImg.style.display = "block"; }
        if (avatar) avatar.style.display = "none";
        if (dropdownAvatar) dropdownAvatar.style.display = 'none';
    } else {
        const initial = user.name.charAt(0).toUpperCase();
        if (avatar) { avatar.innerText = initial; avatar.style.display = "flex"; }
        if (img) img.style.display = "none";
        if (dropdownImg) dropdownImg.style.display = "none";
        if (dropdownAvatar) { dropdownAvatar.innerText = initial; dropdownAvatar.style.display = 'flex'; }
    }
    if (dropdownName) dropdownName.innerText = user.name;
}

if (img) {
    img.onerror = () => clearProfilePicture();
}

if (dropdownImg) {
    dropdownImg.onerror = () => clearProfilePicture();
}

updateProfileUI();

async function syncProfileFromServer() {
    if (!user.email) return;

    try {
        const res = await fetch(`/api/profile?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (!res.ok || !data?.success || !data?.data) return;

        const { username, image } = data.data;

        if (username) {
            user.name = username;
            safeSetLocalStorage("username", username);
        }

        user.profilePic = image || "";
        if (user.profilePic) {
            safeSetLocalStorage("profilePic", user.profilePic);
        } else {
            localStorage.removeItem("profilePic");
        }

        updateProfileUI();
    } catch (err) {
        // Keep using localStorage fallback if API request fails.
    }
}

syncProfileFromServer();

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
    if (editNameInput) editNameInput.value = user.name || "";
    if (editImageInput) editImageInput.value = "";
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

async function parseApiResponse(res) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return await res.json();
    }
    const text = await res.text();
    return { success: res.ok, message: text || "Unexpected server response." };
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

async function saveProfile() {
    const newName = editNameInput?.value.trim();
    const imageFile = editImageInput?.files?.[0];
    const hasNameChange = Boolean(newName && newName !== user.name);
    const hasImageChange = Boolean(imageFile);
    let preparedImage = undefined;

    if (!user.email) {
        alert("Login required.");
        return;
    }

    if (imageFile) {
        if (!ALLOWED_IMAGE_TYPES.includes((imageFile.type || "").toLowerCase())) {
            alert("Please upload PNG, JPG, JPEG, WEBP, or GIF image.");
            return;
        }

        try {
            const rawDataUrl = await fileToDataUrl(imageFile);
            preparedImage = await buildProfilePictureWithFallbacks(rawDataUrl);
            if (!preparedImage) {
                alert("Could not process image. Please try a smaller PNG/JPG file.");
                return;
            }
        } catch (err) {
            alert("Failed to process selected image.");
            return;
        }
    }

    if (!hasNameChange && !hasImageChange) {
        closeEditProfile();
        alert("No changes to save.");
        return;
    }

    const payload = { email: user.email };
    if (hasNameChange) payload.username = newName;
    if (hasImageChange) payload.image = preparedImage;

    try {
        const res = await fetch('/api/profile', {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await parseApiResponse(res);
        if (!res.ok || !data?.success) {
            if (res.status === 413) {
                alert("Image is too large for upload. Please choose a smaller image.");
                return;
            }
            alert(data?.message || "Failed to update profile.");
            return;
        }

        const next = data.data || {};
        user.name = next.username || user.name;
        user.profilePic = next.image || "";

        safeSetLocalStorage("username", user.name);
        if (user.profilePic) {
            safeSetLocalStorage("profilePic", user.profilePic);
        } else {
            localStorage.removeItem("profilePic");
        }

        updateProfileUI();
        closeEditProfile();
        alert("Profile updated.");
    } catch (err) {
        alert("Failed to update profile.");
    }
}

async function deleteProfilePicture() {
    if (!user.profilePic) {
        alert("No profile picture to delete.");
        return;
    }

    if (!user.email) {
        alert("Login required.");
        return;
    }

    try {
        const res = await fetch('/api/profile', {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, image: "" })
        });
        const data = await parseApiResponse(res);
        if (!res.ok || !data?.success) {
            alert(data?.message || "Failed to delete profile picture.");
            return;
        }

        clearProfilePicture(true);
    } catch (err) {
        alert("Failed to delete profile picture.");
    }
}

function saveAllEmails() {
    displayEmergencyEmails();
    alert("Use Add/Delete to manage emails. Changes are saved automatically.");
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

