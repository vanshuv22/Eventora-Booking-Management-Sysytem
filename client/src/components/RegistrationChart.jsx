import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const RegistrationChart = ({ bookings }) => {
  const grouped = {};

  bookings.forEach((booking) => {
    const date = new Date(booking.createdAt).toLocaleDateString();

    grouped[date] = (grouped[date] || 0) + 1;
  });

  const data = Object.keys(grouped).map((key) => ({
    date: key,
    registrations: grouped[key],
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="font-bold mb-4">Registration Trend</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line dataKey="registrations" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RegistrationChart;
