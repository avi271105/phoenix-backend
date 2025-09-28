const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Middleware
app.use(cors({
  origin: "https://phoenix-frontend.netlify.app", // frontend ka URL
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

// ✅ Root Route (for testing)
app.get("/", (req, res) => {
  res.send("🚀 Backend running successfully!");
});

// ✅ Connect MongoDB (⚡ updated - removed deprecated options)
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema);

// ✅ Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.json({ success: true, message: "Signup successful! Please login." });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.json({ success: false, message: "Error during signup." });
  }
});

// ✅ Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid password!" });

    res.json({ success: true, message: "Login successful!" });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.json({ success: false, message: "Error during login." });
  }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
