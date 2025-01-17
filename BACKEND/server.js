const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

dotenv.config();

const userRoutes = require("./routes/user.route");
const responseRoutes = require("./routes/response.route");
const userModel = require("./models/user.model");
const responseModel = require("./models/response.model");

const app = express();

// Allow all origins dynamically
// app.use(cors());
app.use(cors({ origin: true, credentials: true }));

// Parse incoming JSON requests
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/response", responseRoutes);

app.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  console.log("Received login request:", { phone, password });

  try {
    const user = await userModel.findOne({ phone });
    if (!user) {
      console.log("User not found");
      return res
        .status(401)
        .json({ message: "Invalid phone number or password" });
    }

    console.log("User found:", user);

    if (user.password !== password) {
      console.log("Password mismatch");
      return res
        .status(401)
        .json({ message: "Invalid phone number or password" });
    }

    const hasResponded = await responseModel.findOne({ roll_no: user.roll_no });
    if (hasResponded) {
      console.log("User has already responded");
      return res.status(403).json({
        message:
          "You have already submitted a response and cannot log in again.",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Token generated:", token);

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

// Default Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
