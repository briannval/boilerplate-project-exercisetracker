const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  description: String,
  duration: Number,
  date: Date,
});

module.exports = mongoose.model("Exercise", exerciseSchema);
