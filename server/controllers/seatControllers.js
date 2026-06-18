const Seat = require("../models/Seat");

exports.getSeats = async (req, res) => {
  const seats = await Seat.find();

  res.json(seats);
};

exports.bookSeat = async (req, res) => {
  const seat = await Seat.findByIdAndUpdate(
    req.params.id,
    {
      booked: true,
      bookedBy: req.user.id,
    },
    { new: true },
  );

  res.json(seat);
};
