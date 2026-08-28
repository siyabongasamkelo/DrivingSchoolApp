import { Booking, IBooking, BookingStatus } from "./booking.model";
import { Types } from "mongoose";
import logger from "../../utils/logger";

export class BookingRepository {
  /**
   * Creates a finalized historical booking receipt document
   */
  static async createBooking(
    bookingData: Partial<IBooking>,
  ): Promise<IBooking> {
    logger.info(
      `✍️ [BookingRepository] Saving finalized booking receipt for student: ${bookingData.student}`,
    );
    const booking = new Booking(bookingData);
    return await booking.save();
  }

  /**
   * Finds upcoming bookings for a specific student (Fixes the "I forgot my slot" problem)
   */
  static async findUpcomingByStudent(studentId: string): Promise<IBooking[]> {
    // Force cast to string to guarantee type safety for the ObjectId constructor
    const cleanStudentId = String(studentId);

    logger.info(
      `📋 [BookingRepository] Retrieving upcoming itinerary for student: ${cleanStudentId}`,
    );

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    return await Booking.find({
      student: new Types.ObjectId(cleanStudentId), // ⚡ Fixed with clean casted string!
      date: { $gte: todayMidnight },
      status: BookingStatus.CONFIRMED,
    })
      .sort({ date: 1, startTime: 1 })
      .populate("slot")
      .lean();
  }

  /**
   * Dynamic Admin search to extract bookings based on branch, date, school, or instructor
   */
  static async searchBookings(filters: {
    drivingSchool: string;
    branch: string;
    date?: Date;
    instructorId?: string;
  }): Promise<IBooking[]> {
    logger.info(
      `🖥️ [BookingRepository] Admin querying booking logs with filters: ${JSON.stringify(filters)}`,
    );

    const query: any = {
      drivingSchool: filters.drivingSchool,
      branch: filters.branch,
      status: BookingStatus.CONFIRMED,
    };

    if (filters.date) {
      query.date = filters.date;
    }

    if (filters.instructorId) {
      query.instructor = new Types.ObjectId(filters.instructorId);
    }

    return await Booking.find(query)
      .sort({ startTime: 1 })
      .populate("student", "profile.fullName whatsappNo")
      .lean();
  }
}
