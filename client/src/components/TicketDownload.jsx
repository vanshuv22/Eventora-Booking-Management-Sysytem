import jsPDF from "jspdf";
import QRCode from "qrcode";

const TicketDownload = ({ booking }) => {
  const downloadTicket = async () => {
    const pdf = new jsPDF();

    // QR image generate
    const qrDataUrl = await QRCode.toDataURL(booking._id);

    pdf.setFontSize(20);
    pdf.text("EVENTORA TICKET", 20, 20);

    pdf.setFontSize(12);
    pdf.text(`Event: ${booking.eventId.title}`, 20, 40);

    pdf.text(
      `Date: ${new Date(booking.eventId.date).toLocaleDateString()}`,
      20,
      50,
    );

    pdf.text(`Location: ${booking.eventId.location}`, 20, 60);

    pdf.text(`Amount: ₹${booking.amount}`, 20, 70);

    pdf.text(`Booking ID: ${booking._id}`, 20, 80);

    // Seats Number
    pdf.text(`Seats: ${booking.selectedSeats?.join(", ") || "N/A"}`, 20, 90);

    // QR code add
    pdf.addImage(qrDataUrl, "PNG", 140, 30, 40, 40);

    pdf.save("eventora-ticket.pdf");
  };

  return (
    <button
      onClick={downloadTicket}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
    >
      Download Ticket
    </button>
  );
};

export default TicketDownload;
