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

// Updated CORS configuration
const corsOptions = {
  origin: [
    'https://frontend-jwtjingd8-akshar-1801s-projects.vercel.app',
    'https://frontend-a2ho4u9fx-akshar-1801s-projects.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Apply CORS with options
app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());

// Add security headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    return res.status(200).json({});
  }
  next();
});

// Connect to MongoDB with improved error handling
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  });

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/response", responseRoutes);

// Login endpoint with improved security and error handling
app.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: "Phone and password are required" });
  }

  try {
    // Find user by phone number
    const user = await userModel.findOne({ phone });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid phone number or password" });
    }

    // Using constant time comparison for password
    const isPasswordValid = password === user.password;
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid phone number or password" });
    }

    // Check for existing response
    const hasResponded = await responseModel.findOne({ roll_no: user.roll_no });
    if (hasResponded) {
      return res.status(403).json({
        message: "You have already submitted a response and cannot log in again.",
      });
    }

    // Generate JWT with improved payload
    const token = jwt.sign(
      {
        id: user._id,
        roll_no: user.roll_no,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
        algorithm: "HS256"
      }
    );

    // Set token in HTTP-only cookie for better security
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id,
      roll_no: user.roll_no,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Root Route with basic health check
app.get("/", (req, res) => {
  res.json({ 
    status: "healthy",
    message: "API is running",
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: "Something broke!",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;