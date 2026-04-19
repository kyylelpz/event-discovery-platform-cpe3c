require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


console.log("Is MONGO_URI loaded?", process.env.MONGO_URI);
console.log("What does the whole process.env look like?", process.env);
// --------------------------

const app = express();
// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database Connected Successfully"))
  .catch(err => console.log("Connection Error:", err));

app.get('/', (req, res) => {
    res.send("Backend API is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));