const express = require("express");
const router = express.Router();
const Response = require("../models/response.model");

// POST /api/responses
// Description: Create a new response
router.post("/", async (req, res) => {
  const { user_id, roll_no, responses } = req.body;

  // Validation
  if (
    !user_id ||
    !roll_no ||
    !Array.isArray(responses) ||
    responses.length === 0
  ) {
    return res.status(400).json({
      message: "Invalid input. Please provide user_id, roll_no, and responses.",
    });
  }

  try {
    const newResponse = new Response({
      user_id,
      roll_no,
      responses,
    });

    await newResponse.save();
    res
      .status(201)
      .json({ message: "Response saved successfully.", response: newResponse });
  } catch (error) {
    console.error("Error creating response:", error);
    res.status(500).json({ message: "Server error. Unable to save response." });
  }
});

// GET /api/responses
// Description: Get all responses or filter by user_id
router.get("/", async (req, res) => {
  const { user_id } = req.query;

  try {
    const query = user_id ? { user_id } : {};
    const responses = await Response.find(query).populate(
      "user_id",
      "name roll_no"
    ); // Populate user details

    res.status(200).json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    res
      .status(500)
      .json({ message: "Server error. Unable to fetch responses." });
  }
});

module.exports = router;
