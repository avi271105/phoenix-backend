const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB (local database)
mongoose.connect("mongodb://127.0.0.1:27017/phoenixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.json({ success: true, message: "Signup successful! Please login." });
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.json({ success: false, message: "Error during login." });
  }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
