const username = document.getElementById("username");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const bio = document.getElementById("bio");
const profilePic = document.getElementById("profilePic");
const imageUpload = document.getElementById("imageUpload");

const newUsername = document.getElementById("newUsername");
const newEmail = document.getElementById("newEmail");
const newPhone = document.getElementById("newPhone");
const newBio = document.getElementById("newBio");

const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");

const emailModal = document.getElementById("emailModal");
const codeModal = document.getElementById("codeModal");
const newPassModal = document.getElementById("newPassModal");

const resetEmail = document.getElementById("resetEmail");
const resetCodeInput = document.getElementById("resetCodeInput");
const newPassInput = document.getElementById("newPassInput");

const settingsBlock = document.getElementById("settingsBlock");
const editSection = document.getElementById("editSection");
const passwordSection = document.getElementById("passwordSection");

const API_URL = "http://localhost:3000/api/profile";
const API_KEY = "eventcinityAPIprofileBRO";

let user = {};
let tempResetCode = "";

/* PASSWORD STRENGTH */
function isStrongPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
}

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
        console.error("LOAD PROFILE ERROR:", err);
    }
}

/* IMAGE */
function openFile() {
    imageUpload.click();
}

imageUpload.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        profilePic.src = event.target.result;
        user.profilePic = event.target.result;
    };
    reader.readAsDataURL(file);
});

/* PHONE INPUT */
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

    if (phoneValue.startsWith("0")) {
        if (!/^0\d{10}$/.test(phoneValue)) return null;
        return "+63" + phoneValue.slice(1);
    }

    if (/^9\d{9}$/.test(phoneValue)) {
        return "+63" + phoneValue;
    }

    if (/^\+639\d{9}$/.test(phoneValue)) {
        return phoneValue;
    }

    return null;
}

/* SAME-PAGE SECTIONS */
function showSection(sectionId) {
    settingsBlock.classList.add("hidden");
    editSection.classList.add("hidden");
    passwordSection.classList.add("hidden");

    if (sectionId === "editSection") {
        newUsername.value = user.username || "";
        newEmail.value = user.email || "";
        newPhone.value = user.phone || "";
        newBio.value = user.bio || "";
        editSection.classList.remove("hidden");
    }

    if (sectionId === "passwordSection") {
        currentPassword.value = "";
        newPassword.value = "";
        passwordSection.classList.remove("hidden");
    }

    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function goBack() {
    editSection.classList.add("hidden");
    passwordSection.classList.add("hidden");
    settingsBlock.classList.remove("hidden");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

/* FORGOT PASSWORD FLOW */
function openForgotFlow() {
    resetEmail.value = user.email || "";
    resetCodeInput.value = "";
    newPassInput.value = "";
    tempResetCode = "";
    emailModal.classList.add("show");
}

function closeEmailModal() {
    emailModal.classList.remove("show");
}

function closeCodeModal() {
    codeModal.classList.remove("show");
}

function closeNewPassModal() {
    newPassModal.classList.remove("show");
}

async function sendResetCode() {
    try {
        const res = await fetch("http://localhost:3000/api/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY
            },
            body: JSON.stringify({
                email: resetEmail.value.trim()
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Could not send reset code");
            return;
        }

        alert("Reset code sent. Check the server console.");
        emailModal.classList.remove("show");
        codeModal.classList.add("show");
    } catch (err) {
        console.error("SEND RESET CODE ERROR:", err);
        alert("Error requesting reset code");
    }
}

function verifyCode() {
    const code = resetCodeInput.value.trim();

    if (!code) {
        alert("Please enter the reset code.");
        return;
    }

    tempResetCode = code;
    codeModal.classList.remove("show");
    newPassModal.classList.add("show");
}

async function resetPassword() {
    if (!newPassInput.value.trim()) {
        alert("Please enter a new password.");
        return;
    }

    if (!isStrongPassword(newPassInput.value.trim())) {
        alert("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/api/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY
            },
            body: JSON.stringify({
                email: resetEmail.value.trim(),
                resetCode: tempResetCode,
                newPassword: newPassInput.value.trim()
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Could not reset password");
            return;
        }

        alert("Password reset successfully.");
        newPassModal.classList.remove("show");
        tempResetCode = "";
        resetCodeInput.value = "";
        newPassInput.value = "";
    } catch (err) {
        console.error("RESET PASSWORD ERROR:", err);
        alert("Reset failed");
    }
}

/* UPDATE PROFILE */
async function updateProfile() {
    const normalizedPhone = normalizePhilippinePhone(newPhone.value);

    if (normalizedPhone === null) {
        alert("Invalid PH number. Use +639XXXXXXXXX or 09XXXXXXXXXX");
        return;
    }

    const updatedData = {
        username: newUsername.value.trim(),
        email: newEmail.value.trim(),
        phone: normalizedPhone,
        bio: newBio.value.trim(),
        profilePic: user.profilePic || ""
    };

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

        if (!res.ok) {
            alert(data.message || "Error updating profile");
            return;
        }

        user = data.user || data;

        alert("Profile Updated!");
        await loadProfile();
        goBack();
    } catch (err) {
        console.error("UPDATE PROFILE ERROR:", err);
        alert("Error updating profile");
    }
}

/* CHANGE PASSWORD */
async function changePassword() {
    if (!currentPassword.value.trim()) {
        alert("Please enter your current password.");
        return;
    }

    if (!newPassword.value.trim()) {
        alert("Please enter your new password.");
        return;
    }

    try {
        const res = await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY
            },
            body: JSON.stringify({
                currentPassword: currentPassword.value.trim(),
                newPassword: newPassword.value.trim()
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Could not change password");
            return;
        }

        alert("Password changed successfully.");
        currentPassword.value = "";
        newPassword.value = "";
        goBack();
    } catch (err) {
        console.error("CHANGE PASSWORD ERROR:", err);
        alert("Error changing password");
    }
}

/* EVENTS */
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
