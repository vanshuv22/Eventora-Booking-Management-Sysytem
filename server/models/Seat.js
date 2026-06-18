const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },

  seatNumber: String,

  booked: {
    type: Boolean,
    default: false,
  },

  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Seat", seatSchema);
