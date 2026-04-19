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

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        user = data;

        username.innerText = user.username && user.username.trim()
            ? user.username
            : "No username yet";

        email.innerText = user.email && user.email.trim()
            ? user.email
            : "No email yet";

        phone.innerText = user.phone && user.phone.trim()
            ? user.phone
            : "Nothing here yet. Explore more events!";

        bio.innerText = user.bio && user.bio.trim()
            ? user.bio
            : "Nothing here yet. Explore more events!";

        profilePic.src = user.profilePic && user.profilePic.trim()
            ? user.profilePic
            : "https://via.placeholder.com/150";

    } catch (err) {
        console.error("LOAD PROFILE ERROR:", err);

        username.innerText = "No username yet";
        email.innerText = "No email yet";
        phone.innerText = "Nothing here yet. Explore more events!";
        bio.innerText = "Nothing here yet. Explore more events!";
        profilePic.src = "https://via.placeholder.com/150";
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
    const updatedData = {
        username: newUsername.value.trim(),
        email: newEmail.value.trim(),
        phone: newPhone.value.trim(),
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

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        user = data.user || data;

        alert("Profile Updated!");
        await loadProfile();
        closeModal();
    } catch (err) {
        console.error("UPDATE PROFILE ERROR:", err);
        alert("Error updating profile");
    }
}

/* LIKED EVENTS, INTERESTS, FAVORITE EVENTS */
let likedEvents = [];
let interests = [];
let favoriteEvents = [];

/* REUSABLE RENDER */
function renderSection(items, containerId, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!items || items.length === 0) {
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
            card.innerHTML = `
                <h4>${item.name || "Untitled Interest"}</h4>
                <p>${item.description || ""}</p>
            `;
        } else {
            card.innerHTML = `
                <h4>${item.title || "Untitled Event"}</h4>
                <p>${item.date || ""}</p>
            `;
        }

        container.appendChild(card);
    });
}

/* RENDER ALL */
function renderAllSections() {
    renderSection(likedEvents, "likedEventsContainer", "event");
    renderSection(interests, "interestsContainer", "interest");
    renderSection(favoriteEvents, "favoriteEventsContainer", "event");
}

/* SAVE */
function saveSections() {
    localStorage.setItem("likedEvents", JSON.stringify(likedEvents));
    localStorage.setItem("interests", JSON.stringify(interests));
    localStorage.setItem("favoriteEvents", JSON.stringify(favoriteEvents));
}

/* LOAD */
function loadSections() {
    const savedLiked = localStorage.getItem("likedEvents");
    const savedInterests = localStorage.getItem("interests");
    const savedFavorites = localStorage.getItem("favoriteEvents");

    likedEvents = savedLiked ? JSON.parse(savedLiked) : [];
    interests = savedInterests ? JSON.parse(savedInterests) : [];
    favoriteEvents = savedFavorites ? JSON.parse(savedFavorites) : [];

    renderAllSections();
}

/* TOGGLE */
const toggle = document.getElementById("themeToggle");
toggle.addEventListener("change", () => {
    document.body.style.background = toggle.checked ? "#ffffff" : "#f5f7fb";
});

/* INIT */
window.onload = () => {
    loadProfile();
    loadSections();
};
