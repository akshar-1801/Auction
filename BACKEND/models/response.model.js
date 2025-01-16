const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  roll_no: {
    type: Number,
    required: true,
  },
  responses: [
    {
      roll_no: { type: Number, required: true }, // Roll number of the rated user
      rating: { type: Number, required: true }, // Rating given to the user
    },
  ],
});

module.exports = mongoose.model("Response", responseSchema);
