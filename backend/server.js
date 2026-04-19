require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors()); 
app.use(express.json());

console.log("Is MONGO_URI loaded?", process.env.MONGO_URI);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database Connected Successfully"))
  .catch(err => console.log("Connection Error:", err));

// --- THE ROUTES (Each gets its own block) ---

app.get('/', (req, res) => {
    res.send("Backend API is running!");
});

app.post('/api/register', (req, res) => {
    console.log("🎉 SUCCESS! Frontend sent SIGNUP data:", req.body);
    res.status(200).json({ message: "Backend received your signup data!" });
});

app.post('/api/login', (req, res) => {
    console.log("🔑 SUCCESS! Frontend sent LOGIN data:", req.body);
    res.status(200).json({ message: "Backend received your login data!" });
});

// --- SERVER START ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));