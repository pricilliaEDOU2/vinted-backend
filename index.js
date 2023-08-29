require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);

const cors = require("cors");
//Import Cloudinary
const cloudinary = require("cloudinary").v2;

const app = express();

app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
app.use(userRoutes);
app.use(offerRoutes);

app.get("/", async (req, res) => {
  try {
    res.status(200).json("Welcome to Vinted");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.all("*", (req, res) => {
  res.status(404).json({ error: "Page not found" });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server Vinted online");
});
