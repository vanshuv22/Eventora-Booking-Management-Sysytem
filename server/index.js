const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Import Routes
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const bookingRoutes = require("./routes/booking");
const ticketsRoutes = require("./routes/ticket");
const checkinRoutes = require("./routes/checkIn");
const dashboardRoutes = require("./routes/dashboard");
const seatsRoutes = require("./routes/seats");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/tickets", require("./routes/ticket"));
app.use("/api/checkin", require("./routes/checkIn"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/seats", require("./routes/seats"));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(error);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
