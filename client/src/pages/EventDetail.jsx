import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { AuthContext } from "../context/AuthContext";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaChair,
  FaMoneyBillWave,
} from "react-icons/fa";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  console.log("Eventssss======", event);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [bookingStatus, setBookingStatus] = useState(null);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data);

        if (user) {
          try {
            const bookingRes = await api.get("/bookings/my");

            console.log("BOOKING RESPONSE:", bookingRes.data);

            const myBooking = bookingRes.data.find(
              (b) => b.eventId?._id === id && b.status === "confirmed",
            );

            if (myBooking) {
              setBookingStatus("confirmed");
            } else {
              setBookingStatus(null);
            }
          } catch (error) {
            console.log("ERROR RESPONSE:", error.response?.data);
            console.log("ERROR STATUS:", error.response?.status);
          }
        }
      } catch (err) {
        setError("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  const handleSeatSelect = (seatNo) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNo)
        ? prev.filter((s) => s !== seatNo)
        : [...prev, seatNo],
    );
  };

  const handleBooking = async () => {
    if (showOTP && selectedSeats.length === 0) {
      setError("Please select at least one seat");
      return;
    }
    if (!user) {
      navigate("/login");
      return;
    }
    setBookingLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (!showOTP) {
        await api.post("/bookings/send-otp");
        setShowOTP(true);
        setSuccessMsg(
          "OTP sent to your email. Please verify to confirm booking.",
        );
      } else {
        await api.post("/bookings", {
          eventId: event._id,
          otp,
          selectedSeats,
        });
        setSuccessMsg("Booking requested! Awaiting admin confirmation.");
        setShowOTP(false);
        // Update local seats count dynamically after booking
        setEvent({
          ...event,
          availableSeats: event.availableSeats - selectedSeats.length,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 text-xl font-semibold">Loading...</div>
    );
  if (error && !event)
    return (
      <div className="text-center py-20 text-xl text-red-500">
        {error || "Event not found"}
      </div>
    );

  const isSoldOut = event.availableSeats <= 0;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
      {event.imageUrl ? (
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-80 object-cover"
        />
      ) : (
        <div className="w-full h-64 bg-gray-900 flex items-center justify-center text-white/50 text-6xl font-black uppercase tracking-widest">
          {event.category}
        </div>
      )}

      <div className="p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
          <div>
            <div className="inline-block bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
              {event.category}
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              {event.title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {event.description}
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 min-w-[300px] w-full md:w-auto shrink-0 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Booking Details
            </h3>
            {/* Seat Legend */}
            <div className="flex gap-4 text-sm mb-4">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                Available
              </div>

              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                Selected
              </div>

              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                Booked
              </div>
            </div>

            <h4 className="font-bold text-lg mb-3">Select Seats</h4>
            <p>Total Seats: {event?.seats?.length}</p>

            <div className="max-h-80 overflow-y-auto border rounded-lg p-3 mb-4 grid grid-cols-10 md:grid-cols-20 gap-1">
              {event?.seats?.map((seat) => (
                <button
                  key={seat.seatNumber}
                  className="w-10 h-8 border text-[10px]"
                  disabled={seat.isBooked}
                  onClick={() => handleSeatSelect(seat.seatNumber)}
                  className={`h-8 text-[10px] rounded border
      ${
        seat.isBooked
          ? "bg-red-500 text-white"
          : selectedSeats.includes(seat.seatNumber)
            ? "bg-green-500 text-white"
            : "bg-gray-200"
      }`}
                >
                  {seat.seatNumber}
                </button>
              ))}
            </div>

            {selectedSeats.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold">Selected Seats:</p>

                <p className="text-blue-600">{selectedSeats.join(", ")}</p>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                  <FaMoneyBillWave />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400 uppercase">
                    Ticket Price
                  </p>
                  <p className="font-bold text-gray-800 text-lg">
                    {event.ticketPrice === 0 ? (
                      <span className="text-green-500">Free</span>
                    ) : (
                      `₹${event.ticketPrice}`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                  <FaChair />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400 uppercase">
                    Availability
                  </p>
                  <p className="font-bold text-gray-800">
                    <span
                      className={
                        event.availableSeats < 10 ? "text-orange-500" : ""
                      }
                    >
                      {event.availableSeats}
                    </span>{" "}
                    / {event.totalSeats}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                  <FaCalendarAlt />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400 uppercase">
                    Date
                  </p>
                  <p className="font-bold text-gray-800">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400 uppercase">
                    Location
                  </p>
                  <p className="font-bold text-gray-800">{event.location}</p>
                </div>
              </div>
            </div>

            {showOTP && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter OTP to Confirm
                </label>
                <input
                  type="text"
                  required
                  placeholder="6-digit code"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-700 transition shadow-sm font-bold tracking-widest text-center text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                />
              </div>
            )}

            {user?.role !== "admin" && bookingStatus !== "confirmed" && (
              <button
                onClick={handleBooking}
                disabled={isSoldOut || bookingLoading || (showOTP && !otp)}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition shadow-lg ${
                  isSoldOut
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-black text-white"
                }`}
              >
                {bookingLoading
                  ? "Processing..."
                  : showOTP
                    ? "Verify OTP & Confirm"
                    : isSoldOut
                      ? "Sold Out"
                      : "Confirm Registration"}
              </button>
            )}
            {error && (
              <p className="text-red-500 mt-4 text-center font-medium bg-red-50 p-2 rounded">
                {error}
              </p>
            )}
            {successMsg && (
              <p className="text-green-600 mt-4 text-center font-medium bg-green-50 p-2 rounded">
                {successMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
