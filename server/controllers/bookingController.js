const Booking = require("../models/Booking");
const OTP = require("../models/OTP");
const Event = require("../models/Event");
const Ticket = require("../models/Ticket");

const { sendOTPEmail, sendBookingEmail } = require("../utils/email");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendBookingOTP = async (req, res) => {
  const otp = generateOtp();

  await OTP.findOneAndDelete({
    email: req.user.email,
    action: "event_booking",
  });

  await OTP.create({
    email: req.user.email,
    otp: otp,
    action: "event_booking",
  });

  await sendOTPEmail(req.user.email, otp, "event_booking");

  res.json({
    message: "OTP sent to email",
  });
};

exports.bookEvent = async (req, res) => {
  const { eventId, otp, selectedSeats } = req.body;

  const otpRecord = await OTP.findOne({
    email: req.user.email,
    otp,
    action: "event_booking",
  });

  if (!otpRecord) {
    return res.status(400).json({
      error: "Invalid or expired OTP",
    });
  }

  const event = await Event.findById(eventId);

  for (const seatNo of selectedSeats) {
    const seat = event.seats.find((s) => s.seatNumber === seatNo);

    if (!seat || seat.isBooked) {
      return res.status(400).json({
        error: `${seatNo} is already booked`,
      });
    }
  }

  if (!event) {
    return res.status(404).json({
      error: "Event not found",
    });
  }

  if (event.totalSeats <= 0) {
    return res.status(400).json({
      error: "No seats available",
    });
  }

  const existingBooking = await Booking.findOne({
    userId: req.user._id,
    eventId,
  });
  console.log("Existing Event ========", existingBooking);

  if (existingBooking) {
    return res.status(400).json({
      error: "You have already booked this event",
    });
  }

  const booking = await Booking.create({
    userId: req.user._id,
    eventId,
    selectedSeats,
    status: "pending",
    paymentStatus: "non_paid",
    amount: event.ticketPrice * selectedSeats.length,
  });

  await OTP.deleteMany({
    email: req.user.email,
    action: "event_booking",
  });

  // await sendBookingEmail(req.user.email, event.title, booking._id);

  res.status(201).json({
    message: "Booking created successfully",
    booking,
  });
};

exports.getMyBooking = async (req, res) => {
  // console.log("Reqqqqqqq=====", req.user);
  const bookings = await Booking.find({
    userId: req.user._id,
  }).populate("eventId");

  res.json(bookings);
};

exports.getBookingsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const bookings = await Booking.find({ event: eventId });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getPendingBooking = async (req, res) => {
  console.log("Reqqqqqqq=====", req.user);
  const bookings = await Booking.find({
    // userId: req.user._id,
    status: "pending",
  }).populate("eventId");

  res.json(bookings);
};

exports.confirmBooking = async (req, res) => {
  const { paymentStatus } = req.body;

  if (paymentStatus && !["paid", "non_paid"].includes(paymentStatus)) {
    return res.status(400).json({
      error: "Invalid payment status",
    });
  }

  const booking = await Booking.findById(req.params.id).populate("eventId");

  if (!booking) {
    return res.status(404).json({
      error: "Booking not found",
    });
  }

  if (booking.status === "confirmed") {
    const existingTicket = await Ticket.findOne({
      bookingId: booking._id,
    });

    if (!existingTicket) {
      await Ticket.create({
        bookingId: booking._id,
        userId: booking.userId,
        eventId: booking.eventId._id,
        ticketNumber:
          "EVT-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      });
    }
    return res.status(400).json({
      error: "Booking is already confirmed",
    });
  }

  const event = await Event.findById(booking.eventId._id);

  if (event.totalSeats <= 0) {
    return res.status(400).json({
      error: "No seats available",
    });
  }

  booking.status = "confirmed";

  if (paymentStatus) {
    booking.paymentStatus = paymentStatus;
  }

  await booking.save();

 for (const seatNo of booking.selectedSeats) {
   const seat = event.seats.find((s) => s.seatNumber === seatNo);

   if (seat) {
     seat.isBooked = true;
   }
 }

 event.availableSeats -= booking.selectedSeats.length;

  await event.save();

  await sendBookingEmail(req.user.email, event.title, booking._id);

  // res.json({
  //   message: "Booking confirmed successfully",
  // });

  res.status(200).json({
  success: true,
  message: "Booking confirmed successfully",
  booking,
  bookedSeats: booking.selectedSeats,
  bookedSeatCount: booking.selectedSeats.length,
  availableSeats: event.availableSeats,
});
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("eventId");

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    // check user ownership
    if (booking.userId.toString() !== String(req.user._id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // restore seats properly
    if (booking.status === "confirmed") {
      const event = await Event.findById(booking.eventId._id);

    event.availableSeats += booking.selectedSeats.length;

for (const seatNo of booking.selectedSeats) {
  const seat = event.seats.find(
    (s) => s.seatNumber === seatNo
  );

  if (seat) {
    seat.isBooked = false;
  }
}

  await event.save();
}
    await Booking.deleteOne({ _id: booking._id });

    return res.json({
      message: "Booking cancelled successfully",
    })

  } catch (error) {
    console.error("Cancel Booking Error:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
};
