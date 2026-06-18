const router = require("express").Router();

const { getStats } = require("../controllers/dashboardController");

router.get("/", getStats);

module.exports = router;
