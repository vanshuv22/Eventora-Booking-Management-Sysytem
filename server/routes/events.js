const express = require("express");
const router = express.Router();
const {protect, admin} = require('../middleware/auth');
const {getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, getAdminEvents} = require('../controllers/eventController');

router.get('/', getAllEvents);

// Admin → all events
router.get("/admin/all", protect, admin, getAdminEvents);
router.get('/:id',getEventById);

router.post('/', protect, admin, createEvent);

router.put('/:id', protect, admin, updateEvent);

router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;
