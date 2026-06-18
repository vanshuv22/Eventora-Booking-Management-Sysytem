import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const RevenueChart = ({ bookings }) => {
  const grouped = {};

  bookings.forEach((booking) => {
    if (booking.status === "confirmed" && booking.paymentStatus === "paid") {
      const date = new Date(booking.createdAt).toLocaleDateString();

      grouped[date] = (grouped[date] || 0) + booking.amount;
    }
  });

  const data = Object.keys(grouped).map((key) => ({
    date: key,
    revenue: grouped[key],
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="font-bold mb-4">Revenue Trend</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
