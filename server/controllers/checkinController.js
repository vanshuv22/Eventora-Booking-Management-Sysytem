const CheckIn = require("../models/checkIn");

exports.scanTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;

    const checkin = await CheckIn.findOneAndUpdate(
      { ticket: ticketId },
      {
        checkedIn: true,
        checkInTime: new Date(),
      },
      { new: true },
    );

    res.json(checkin);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
