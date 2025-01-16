const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  roll_no: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  img_url: { type: String, required: true },
  avg_rating: { type: Number, default: 0 },
  password: { type: String, required: true },
  isPlaying: { type: Boolean, default: true, required: true },
});

// Hash password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
