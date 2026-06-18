const router = require("express").Router();

const { getSeats, bookSeat } = require("../controllers/seatControllers");

router.get("/", getSeats);

router.put("/:id", bookSeat);

module.exports = router;
