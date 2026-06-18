import React, { useEffect, useState, useMemo } from "react";
import api from "../utils/axios";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const AllEvent = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  console.log("first=====", search);
  const [showSearch, setShowSearch] = useState(false);
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearch(value);
        setCurrentPage(1);
      }, 300),
    [],
  );
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const eventsPerPage = 9;

  // Debounce Function
  function debounce(func, delay) {
    let timeout;

    return (...args) => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [currentPage, selectedCategory, search]);

  const fetchEvents = async () => {
    try {
      console.log("Searching:", search);

      const { data } = await api.get(
        `/events?page=${currentPage}&limit=9&category=${selectedCategory}&search=${search}`,
      );

      setEvents(data.events);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/events");

      const uniqueCategories = [
        "All",
        ...new Set(data.events.map((event) => event.category)),
      ];

      setCategories(uniqueCategories);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredEvents =
    selectedCategory === "All"
      ? events
      : events.filter((event) => event.category === selectedCategory);

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;

  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent,
  );

  //   const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">All Events</h1>

        <div className="flex items-center gap-3">
          {showSearch && (
            <input
              type="text"
              placeholder="Search events..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                debouncedSearch(e.target.value);
              }}
              className="border rounded-lg px-4 py-2 w-64"
            />
          )}

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="bg-black text-white p-3 rounded-full"
          >
            <FaSearch />
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left Sidebar */}
        <div className="w-64 bg-white rounded-xl shadow-md p-5 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-4">Categories</h2>

          <div className="flex flex-col gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`text-left px-4 py-3 rounded-lg font-medium transition ${
                  selectedCategory === category
                    ? "bg-black text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Right Events Section */}
        <div className="flex-1">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* {filteredEvents.map((event) => ( */}
            {currentEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition"
              >
                {/* Image */}
                <div className="h-52 overflow-hidden">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <span className="text-sm text-blue-600 font-semibold">
                    {event.category}
                  </span>

                  <h2 className="text-xl font-bold mt-2 mb-2">{event.title}</h2>

                  <p className="text-gray-600 text-sm mb-2">{event.location}</p>

                  <p className="text-gray-500 text-sm mb-4">
                    {new Date(event.date).toLocaleDateString()}
                  </p>

                  <Link
                    to={`/events/${event._id}`}
                    className="block text-center bg-black text-white py-2 rounded-lg hover:bg-gray-800"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === index + 1
                      ? "bg-black text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}

          {filteredEvents.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              No events found in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllEvent;
