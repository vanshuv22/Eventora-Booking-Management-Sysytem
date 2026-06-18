const Ticket = require("../models/Ticket");

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      userId: req.user._id,
    })
      .populate("eventId")
      .populate("bookingId");

    res.json(tickets);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
