import { QRCode } from "react-qr-code";

console.log("QRCode =", QRCode);
const QRCodeTicket = ({ booking }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow border mt-4">
      <h3 className="text-lg font-bold mb-4">QR Ticket</h3>

      <div className="flex justify-center">
        <QRCode value={booking._id} size={180} />
      </div>

      <p className="text-center mt-3 text-sm text-gray-500">
        Booking ID: {booking._id}
      </p>
    </div>
  );
};

export default QRCodeTicket;
