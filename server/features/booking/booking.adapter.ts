import { IBooking } from "./booking.model";
import { ISlot } from "./slot.model";
import logger from "../../utils/logger";

export class BookingAdapter {
  // ==========================================================================
  // 1. WEB ADMIN PANEL RESPONSES (Clean Object Mapping)
  // ==========================================================================
  /**
   * Adapts a single finalized Booking record for the administrative grid dashboard.
   * Ensures fully populated entity fields don't accidentally leak sensitive internal database rows.
   */
  static transformAdminBooking(booking: IBooking | any): Record<string, any> {
    if (!booking) return {};

    return {
      id: booking._id,
      drivingSchool: booking.drivingSchool,
      branch: booking.branch,
      date: booking.date
        ? new Date(booking.date).toISOString().split("T")[0]
        : null,
      timeSlot: `${booking.startTime} - ${booking.endTime}`,
      status: booking.status,
      notes: booking.notes || "None",
      student: booking.student
        ? {
            id: booking.student._id,
            fullName:
              booking.student.profile?.fullName || "Unregistered Student",
            whatsappNo: booking.student.whatsappNo,
          }
        : null,
      instructor: booking.instructor
        ? {
            id: booking.instructor._id,
            fullName:
              booking.instructor.profile?.fullName || "Assigned Instructor",
            phoneNo: booking.instructor.phoneNo,
          }
        : null,
      vehicle: booking.vehicle
        ? {
            id: booking.vehicle._id,
            modelName: booking.vehicle.model || "Assigned Fleet Vehicle",
            licensePlate: booking.vehicle.plateNumber || "N/A",
          }
        : null,
    };
  }

  /**
   * Maps an array of historical tracking booking assets for dashboard views.
   */
  static transformAdminBookingList(
    bookings: IBooking[],
  ): Record<string, any>[] {
    logger.info(
      `🔄 [BookingAdapter] Processing ${bookings.length} system bookings for administrative presentation layer.`,
    );
    return bookings.map((booking) => this.transformAdminBooking(booking));
  }

  // ==========================================================================
  // 2. WHATSAPP BOT CHAT PLATFORM RESPONSES (Text-Based Generation Engines)
  // ==========================================================================
  /**
   * Transforms an array of vacant Mongoose slots into an interactive text list layout.
   * Perfect for displaying clean button actions or string pickers directly inside a WhatsApp chat bubble.
   */
  static transformSlotsToWhatsAppMenu(
    slots: ISlot[] | any[],
    dateString: string,
  ): string {
    logger.info(
      `🤖 [BookingAdapter] Formatting ${slots.length} vacant slots into conversational text layout.`,
    );

    if (slots.length === 0) {
      return `❌ *DriveSmart Academy*\n\nSorry, there are no open booking slots available for *${dateString}*.\nPlease try selecting an alternative date!`;
    }

    let message = `🚗 *AVAILABLE SLOTS FOR ${dateString}*\n`;
    message += `Please reply with the *number* of your preferred time:\n\n`;

    slots.forEach((slot, index) => {
      const instructorName =
        slot.instructor?.profile?.fullName || "Professional Instructor";
      message += `*${index + 1}*. ⏰ ${slot.startTime} - ${slot.endTime}\n`;
      message += `   👨‍✈️ Instructor: ${instructorName}\n\n`;
    });

    message += `_Reply with the number to instantly lock down your appointment._`;
    return message;
  }

  /**
   * Adapts a student's upcoming itinerary history into a beautiful reminder statement block.
   * Directly solves the "I forgot my slot" notification parsing problem.
   */
  static transformItineraryToWhatsAppMessage(
    bookings: IBooking[] | any[],
  ): string {
    logger.info(
      `🤖 [BookingAdapter] Converting itinerary list to clear notification layout.`,
    );

    if (bookings.length === 0) {
      return `📋 *Your DriveSmart Schedule*\n\nYou currently have no upcoming driving lessons booked.`;
    }

    let message = `📋 *YOUR UPCOMING DRIVING LESSONS*\n\n`;

    bookings.forEach((booking, index) => {
      const formattedDate = new Date(booking.date).toLocaleDateString("en-ZA", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });

      message += `*Lesson ${index + 1}:*\n`;
      message += `📅 *Date:* ${formattedDate}\n`;
      message += `⏰ *Time:* ${booking.startTime} - ${booking.endTime}\n`;
      message += `📍 *Branch:* ${booking.branch}\n`;
      message += `---------------------------\n`;
    });

    return message;
  }
}
