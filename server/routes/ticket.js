const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");

const { getMyTickets } = require("../controllers/ticketController");

router.get("/my", protect, getMyTickets);

module.exports = router;
