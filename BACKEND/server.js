const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt"); // For password hashing comparison
const jwt = require("jsonwebtoken"); // For generating tokens

dotenv.config();

const userRoutes = require("./routes/user.route");
const responseRoutes = require("./routes/response.route");
const userModel = require("./models/user.model");
const responseModel = require("./models/response.model");

const app = express();
const corsOptions = {
  origin: ["https://frontend-jwtjingd8-akshar-1801s-projects.vercel.app"], // Replace this with your frontend origin(s)
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Allow credentials (e.g., cookies, headers)
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API Routes
app.use("/api/users", userRoutes);

app.use("/api/response", responseRoutes);

// Updated Login Endpoint in server.js

app.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  try {
    // Find user by phone number
    const user = await userModel.findOne({ phone });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid phone number or password" });
    }

    // Compare passwords as plain strings
    if (user.password !== password) {
      return res
        .status(401)
        .json({ message: "Invalid phone number or password" });
    }

    // Check if the user has already submitted a response
    const hasResponded = await responseModel.findOne({ roll_no: user.roll_no });

    if (hasResponded) {
      return res.status(403).json({
        message:
          "You have already submitted a response and cannot log in again.",
      });
    }

    // Generate a simple token (e.g., using user ID and phone)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id,
      roll_no: user.roll_no,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Root Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
