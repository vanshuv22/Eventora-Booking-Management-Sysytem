const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  seatNumber: String,
  isBooked: {
    type: Boolean,
    default: false,

  },
});

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    totalSeats: { type: Number, default: 500, required: true },
    availableSeats: { type: Number, default: 500, required: true },
    seats: [
      {
        seatNumber: String,

        isBooked: {
          type: Boolean,
          default: false,
        },
      },
    ],
    ticketPrice: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Event", eventSchema);
