const username = document.getElementById("username");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const bio = document.getElementById("bio");
const profilePic = document.getElementById("profilePic");
const imageUpload = document.getElementById("imageUpload");
const editModal = document.getElementById("editModal");

const newUsername = document.getElementById("newUsername");
const newEmail = document.getElementById("newEmail");
const newPhone = document.getElementById("newPhone");
const newBio = document.getElementById("newBio");
const newPassword = document.getElementById("newPassword");

const API_URL = "http://localhost:3000/api/profile";
const API_KEY = "eventcinityAPIprofileBRO";

let user = {};

/* LOAD PROFILE */
async function loadProfile() {
    try {
        const res = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY
            }
        });

        const data = await res.json();
        user = data.user || data;

        username.innerText = user.username || "No username yet";
        email.innerText = user.email || "No email yet";
        phone.innerText = user.phone || "Nothing here yet. Explore more events!";
        bio.innerText = user.bio || "Nothing here yet. Explore more events!";
        profilePic.src = user.profilePic || "https://via.placeholder.com/150";

    } catch (err) {
        console.error(err);
    }
}

/* IMAGE */
function openFile() {
    imageUpload.click();
}

imageUpload.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        profilePic.src = event.target.result;
        user.profilePic = event.target.result;
    };
    reader.readAsDataURL(file);
});

/* LIMIT INPUT */
newPhone.addEventListener("input", () => {
    let val = newPhone.value.replace(/[^\d+]/g, "");

    if (val.startsWith("+63")) {
        val = val.slice(0, 13);
    } else if (val.startsWith("0")) {
        val = val.slice(0, 11);
    } else {
        val = val.slice(0, 10);
    }

    newPhone.value = val;
});

/* NORMALIZE PHONE */
function normalizePhilippinePhone(rawPhone) {
    let phoneValue = rawPhone.trim();

    if (!phoneValue) return "";

    // 0XXXXXXXXXX (must be 11 digits)
    if (phoneValue.startsWith("0")) {
        if (!/^0\d{10}$/.test(phoneValue)) return null;
        return "+63" + phoneValue.slice(1);
    }

    // 9XXXXXXXXX (must be 10 digits)
    if (/^9\d{9}$/.test(phoneValue)) {
        return "+63" + phoneValue;
    }

    // +639XXXXXXXXX
    if (/^\+639\d{9}$/.test(phoneValue)) {
        return phoneValue;
    }

    return null;
}

/* MODAL */
function openModal() {
    newUsername.value = user.username || "";
    newEmail.value = user.email || "";
    newPhone.value = user.phone || "";
    newBio.value = user.bio || "";
    newPassword.value = "";
    editModal.classList.add("show");
}

function closeModal() {
    editModal.classList.remove("show");
}

/* UPDATE PROFILE */
async function updateProfile() {
    const normalizedPhone = normalizePhilippinePhone(newPhone.value);

    if (normalizedPhone === null) {
        alert("Invalid PH number. Use +639XXXXXXXXX or 09XXXXXXXXX");
        return;
    }

    const updatedData = {
        username: newUsername.value.trim(),
        email: newEmail.value.trim(),
        phone: normalizedPhone,
        bio: newBio.value.trim(),
        profilePic: user.profilePic || ""
    };

    if (newPassword.value.trim()) {
        updatedData.password = newPassword.value.trim();
    }

    try {
        const res = await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY
            },
            body: JSON.stringify(updatedData)
        });

        const data = await res.json();
        user = data.user || data;

        alert("Profile Updated!");
        await loadProfile();
        closeModal();

    } catch (err) {
        console.error(err);
        alert("Error updating profile");
    }
}

/* EVENTS (UNCHANGED) */
let likedEvents = [];
let interests = [];
let favoriteEvents = [];

function renderSection(items, containerId, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!items.length) {
        container.innerHTML = `
            <div class="empty-state">
                Nothing here yet. Explore more events!
            </div>
        `;
        return;
    }

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "item-card";

        if (type === "interest") {
            card.innerHTML = `<h4>${item.name}</h4><p>${item.description || ""}</p>`;
        } else {
            card.innerHTML = `<h4>${item.title}</h4><p>${item.date || ""}</p>`;
        }

        container.appendChild(card);
    });
}

function renderAllSections() {
    renderSection(likedEvents, "likedEventsContainer", "event");
    renderSection(interests, "interestsContainer", "interest");
    renderSection(favoriteEvents, "favoriteEventsContainer", "event");
}

function saveSections() {
    localStorage.setItem("likedEvents", JSON.stringify(likedEvents));
    localStorage.setItem("interests", JSON.stringify(interests));
    localStorage.setItem("favoriteEvents", JSON.stringify(favoriteEvents));
}

function loadSections() {
    likedEvents = JSON.parse(localStorage.getItem("likedEvents")) || [];
    interests = JSON.parse(localStorage.getItem("interests")) || [];
    favoriteEvents = JSON.parse(localStorage.getItem("favoriteEvents")) || [];
    renderAllSections();
}

/* INIT */
window.onload = () => {
    loadProfile();
    loadSections();
};