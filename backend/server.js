require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.get("/", (req, res) => {
  res.sendStatus(200).send("Hello Kyle and prends");
});

app.use(cors());
app.use(express.json());
app.listen(3000, () => {
  console.log("Server is running on port 5000");
});
