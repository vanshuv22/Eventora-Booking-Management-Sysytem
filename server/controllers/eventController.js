const Event = require("../models/Event");

exports.getAllEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;

    const filter = {};

    // Category Filter
    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }

    // Search Filter
    if (req.query.search) {
      filter.title = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    // Price Filter
    if (req.query.maxPrice) {
      filter.ticketPrice = {
        $lte: Number(req.query.maxPrice),
      };
    }
    //show only upcoming events
    filter.date = {
      $gte: new Date(),
    };

    const totalEvents = await Event.countDocuments(filter);

    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      events,
      currentPage: page,
      totalPages: Math.ceil(totalEvents / limit),
      totalEvents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEvent = async (req, res) => {
  const {
    title,
    description,
    date,
    location,
    category,
    totalSeats,
    availableSeats,
    ticketPrice,
    imageUrl,
  } = req.body;

  const rows = "ABCDEFGHIJKLMNOPQRSTUVWXY";
  const seats = [];

  for (let row = 0; row < 25; row++){
    for (let col = 1; col <= 20; col++){
      seats.push({
        seatNumber: `${rows[row]}${col}`,
        isBooked: false,
      });
    }
  }
  console.log("REQ BODY======", req.body);
  try {
    const event = await Event.create({
      title,
      description,
      date,
      location,
      category,
      totalSeats: 500,
      availableSeats: 500,
      seats,
      ticketPrice,
      imageUrl,
      createdBy: req.user._id,
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAdminEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateEvent = async (req, res) => {
  const {
    title,
    description,
    date,
    location,
    category,
    totalSeats,
    ticketPrice,
    imageUrl,
  } = req.body;
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        date,
        location,
        category,
        totalSeats,
        ticketPrice,
        imageUrl,
      },
      { new: true },
    );
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Eventnot found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

