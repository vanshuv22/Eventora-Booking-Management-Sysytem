const express = require("express");
const router = express.Router();

const { protect, admin } = require("../middleware/auth");

const {
  bookEvent,
  sendBookingOTP,
  getMyBooking,
  getPendingBooking,
  confirmBooking,
  cancelBooking,
  getBookingsByEvent, 
} = require("../controllers/bookingController");

router.post("/", protect, bookEvent);

router.get("/event/:eventId", protect,  getBookingsByEvent);

router.post("/send-otp", protect, sendBookingOTP);

router.get("/my", protect, getMyBooking);

router.get("/getPendingBooking", getPendingBooking);

router.put("/:id/confirm", protect, admin, confirmBooking);

router.delete("/:id", protect, cancelBooking);

module.exports = router;
