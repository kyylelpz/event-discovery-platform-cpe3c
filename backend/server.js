const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = "./data.json";

/* 🔥 READ USER */
function getUser() {
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
}

/* 🔥 SAVE USER */
function saveUser(user) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(user, null, 2));
}

/* ========================= */
/* ✅ GET PROFILE */
app.get("/api/profile", (req, res) => {
    const user = getUser();
    res.json(user);
});

/* ========================= */
/* ✅ UPDATE PROFILE */
app.put("/api/profile", (req, res) => {
    const current = getUser();

    const updated = {
        ...current,
        ...req.body
    };

    saveUser(updated);

    res.json({
        message: "Profile updated",
        user: updated
    });
});

/* ========================= */
/* ✅ START SERVER */
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});