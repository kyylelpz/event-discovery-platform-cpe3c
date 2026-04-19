require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); 

const app = express();

app.use(cors()); 
app.use(express.json());

console.log("Is MONGO_URI loaded?", process.env.MONGO_URI);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database Connected Successfully"))
  .catch(err => console.log("Connection Error:", err));

// --- THE ROUTES ---
app.get('/', (req, res) => {
    res.send("Backend API is running!");
});

app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            console.log("🛑 Blocked duplicate account attempt for:", email);
            return res.status(400).json({ message: "That email is already registered!" });
        }

        const newUser = new User({ email: email, password: password });
        await newUser.save(); 

        console.log("💾 SUCCESS! New user saved to database:", email);
        res.status(201).json({ message: "Account created successfully!" });

    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ message: "Server error while saving." });
    }
});


app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

    
        const user = await User.findOne({ email: email });

        if (!user) {

            console.log("🛑 Login Blocked: Account does not exist for", email);
            return res.status(404).json({ message: "Account not found. Please sign up first!" });
        }
        if (user.password !== password) {

            console.log("🛑 Login Blocked: Incorrect password for", email);
            return res.status(401).json({ message: "Incorrect password. Please try again." });
        }

        console.log("🟢 SUCCESS! User successfully logged in:", email);
        
        res.status(200).json({ 
            message: "Login successful! Welcome back.",
            user: { email: user.email }
        });

    } catch (error) {
        console.error("Database Error during login:", error);
        res.status(500).json({ message: "Server error during login." });
    }
});

// --- SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));