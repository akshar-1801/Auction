const express = require("express");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Route: GET /api/users (Get all users)
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    // Fetch all users except the one with the given ID and isPlaying is true
    const users = await User.find({
      _id: { $ne: userId },
      isPlaying: true, // Add the condition for isPlaying
    }).select("-password"); // Exclude the password field if present

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error. Unable to fetch users." });
  }
});

router.post("/users", async (req, res) => {
  try {
    const { roll_no, name, phone, img_url, avg_rating, password, isPlaying } =
      req.body;

    const newUser = new User({
      roll_no,
      name,
      phone,
      img_url,
      avg_rating: avg_rating || 0,
      password,
      isPlaying: isPlaying !== undefined ? isPlaying : true, // Default to true
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// Route: POST /api/users/login (Authenticate user)
router.post("/login", async (req, res) => {
  const { roll_no, password } = req.body;
  try {
    const user = await User.findOne({ roll_no });
    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({
        token,
        user: {
          roll_no: user.roll_no,
          name: user.name,
          phone: user.phone,
          avg_rating: user.avg_rating,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
