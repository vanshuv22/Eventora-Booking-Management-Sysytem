const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    qrCode: {
      type: String,
    },

    ticketNumber: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ticket", ticketSchema);
