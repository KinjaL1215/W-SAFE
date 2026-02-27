// ================= LOAD USER =================
const user = {
    name: localStorage.getItem("username") || "User",
    email: localStorage.getItem("email"),
    profilePic: localStorage.getItem("profilePic") || ""
};

document.getElementById("username").innerText = `${user.name}`;

// PROFILE IMAGE / AVATAR
const img = document.getElementById("profileImg");
const avatar = document.getElementById("avatar");

if (user.profilePic) {
    img.src = user.profilePic;
    img.style.display = "block";
    avatar.style.display = "none";
} else {
    avatar.innerText = user.name.charAt(0).toUpperCase();
    avatar.style.display = "flex";
    img.style.display = "none";
}


// ================= DROPDOWN =================
function toggleMenu() {
    const menu = document.getElementById("dropdown");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}


// ================= MODAL =================
function openEditProfile() {
    document.getElementById("editModal").style.display = "flex";
}

function closeEditProfile() {
    document.getElementById("editModal").style.display = "none";
}


// ================= SAVE PROFILE =================
async function saveProfile() {

    const newName = document.getElementById("editName").value;
    const imageInput = document.getElementById("editImage");

    // SAVE NAME
    if (newName) {
        localStorage.setItem("username", newName);
        alert("Name updated ✅");
        location.reload();
    }

    // SAVE IMAGE
    if (imageInput.files[0]) {
        const reader = new FileReader();

        reader.onload = function () {
            localStorage.setItem("profilePic", reader.result);
            alert("Profile image updated ✅");
            location.reload();
        };

        reader.readAsDataURL(imageInput.files[0]);
    }

    // CHANGE PASSWORD
    await changePassword();
}


// ================= CHANGE PASSWORD =================
async function changePassword() {

    const email = user.email;

    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!oldPassword && !newPassword && !confirmPassword) return;

    if (newPassword !== confirmPassword) {
        alert("❌ Passwords do not match");
        return;
    }

    const res = await fetch("/change-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            oldPassword,
            newPassword
        })
    });

    const data = await res.json();

    if (res.status !== 200) {
        alert("❌ " + data.message);
    } else {
        alert("✅ " + data.message);
    }
}


// ================= ACTIONS =================
function sendSOS() {
    alert("🚨 SOS sent!");
}

function shareLocation() {
    alert("📍 Location shared!");
}