const Event = require("../models/Event");
const User = require("../models/User");
const Booking = require("../models/Booking");

exports.getStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();

    const totalUsers = await User.countDocuments();

    const totalBookings = await Booking.countDocuments();

    res.json({
      totalEvents,
      totalUsers,
      totalBookings,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};
