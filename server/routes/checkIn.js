const router = require("express").Router();

const { scanTicket } = require("../controllers/checkinController");

router.post("/scan", scanTicket);

module.exports = router;
