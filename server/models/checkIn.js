const mongoose = require("mongoose");

const checkInSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
    },

    checkedIn: {
      type: Boolean,
      default: false,
    },

    checkInTime: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("CheckIn", checkInSchema);
