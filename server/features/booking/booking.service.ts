import { SlotRepository } from "./slot.repository";
import { BookingRepository } from "./booking.repository";
import { ApiError } from "../../utils/ApiError";
import logger from "../../utils/logger";
import { IBooking, BookingStatus } from "./booking.model";
import { ISlot } from "./slot.model";

export class BookingService {
  // ==========================================================================
  // 1. CHOOSE & RESERVE AN AVAILABLE SLOT (The Core Core Transaction Engine)
  // ==========================================================================
  /**
   * Finalises a slot assignment and records a permanent historical booking asset.
   * Leverages atomic filters to eliminate double-booking overlaps cleanly.
   */
  static async executeBooking(
    bookingPayload: Partial<IBooking>,
  ): Promise<IBooking> {
    const { drivingSchool, branch, student, slot } = bookingPayload;

    // Strict structural check upfront to enforce architectural contract patterns
    if (!drivingSchool || !branch || !student || !slot) {
      logger.error(
        "Booking Execution Failed: Missing primary entity registration properties on payload",
      );
      throw new ApiError(
        400,
        "Driving school, branch, student, and target slot identifiers are strictly required.",
      );
    }

    // 1. Verify that the requested pre-generated slot block actually exists in the system
    // We execute a raw Mongoose query wrapper here directly
    const targetSlot = await (SlotRepository as any).findSlotById(String(slot));
    if (!targetSlot) {
      logger.error(
        `Booking Aborted: Target slot ID ${slot} was not discovered in the database.`,
      );
      throw new ApiError(
        404,
        "The selected appointment slot could not be located.",
      );
    }

    if (targetSlot.isBooked) {
      logger.warn(
        `Booking Sniped: Slot ID ${slot} has already been claimed by another transaction.`,
      );
      throw new ApiError(
        409,
        "This specific lesson slot has already been booked by another student.",
      );
    }

    // 2. Populate missing logistical variables straight off our trusted pre-seeded slot structure
    bookingPayload.instructor = targetSlot.instructor;
    bookingPayload.vehicle = targetSlot.vehicle;
    bookingPayload.date = targetSlot.date;
    bookingPayload.startTime = targetSlot.startTime;
    bookingPayload.endTime = targetSlot.endTime;
    bookingPayload.status = BookingStatus.CONFIRMED;

    // 3. Persist the historical receipt record into the database collection first
    const finalizedReceipt =
      await BookingRepository.createBooking(bookingPayload);

    // 4. Attempt atomic inventory allocation block on the pre-generated slot card
    const claimSuccess = await SlotRepository.claimSlot(
      String(slot),
      String(student),
      String(finalizedReceipt._id),
    );

    // If the claim returns null, it means a race condition occurred and another network request sniped it
    if (!claimSuccess) {
      logger.error(
        `Atomic Collision Triggered: Slot ${slot} claimed mid-flight. Removing unlinked receipt archive.`,
      );
      // Clean up orphaned receipt records immediately to avoid cluttering historical datasets
      await (BookingRepository as any).emergencyDeleteReceipt(
        String(finalizedReceipt._id),
      );

      throw new ApiError(
        409,
        "Booking conflict occurred. This time slot was taken at the exact same moment. Please choose another time.",
      );
    }

    logger.info(
      `🎯 Lesson booking locked down successfully! Receipt ID: ${finalizedReceipt._id} linked to Slot: ${slot}`,
    );
    return finalizedReceipt;
  }

  // ==========================================================================
  // 2. RETRIEVE UPCOMING ITINERARY (Solves "I forgot my slot" problem)
  // ==========================================================================
  /**
   * Extracts chronological future lesson configurations assigned to a single student.
   * Heavily utilized by the automated WhatsApp conversational context router.
   */
  static async getStudentItinerary(studentId: string): Promise<IBooking[]> {
    if (!studentId) {
      logger.error(
        "Itinerary Lookup Aborted: Missing student identity token query param",
      );
      throw new ApiError(
        400,
        "A valid student identification token is required.",
      );
    }

    const upcomingLessons =
      await BookingRepository.findUpcomingByStudent(studentId);
    logger.info(
      `Itinerary Engine: Retrieved ${upcomingLessons.length} upcoming appointments for Student ID: ${studentId}`,
    );
    return upcomingLessons;
  }

  // ==========================================================================
  // 3. EXTRACT CHRONOLOGICAL OPEN TIMESLOTS (WhatsApp List Builder Engine)
  // ==========================================================================
  /**
   * Returns list of empty unbooked slot blocks mapped exactly to branch and date boundaries.
   */
  static async getAvailableSlotsByDate(
    drivingSchool: string,
    branch: string,
    dateString: string,
  ): Promise<ISlot[]> {
    if (!drivingSchool || !branch || !dateString) {
      logger.error(
        "Slot Lookup Failed: Missing critical domain boundary tracking values",
      );
      throw new ApiError(
        400,
        "Driving school brand, local branch location, and a valid date query are required.",
      );
    }

    const targetDate = new Date(dateString);
    if (isNaN(targetDate.getTime())) {
      logger.error(
        `Slot Lookup Rejected: Date payload format [${dateString}] is unparsable`,
      );
      throw new ApiError(
        400,
        "The provided date format is invalid. Please supply an ISO YYYY-MM-DD template.",
      );
    }

    const openSlots = await SlotRepository.findAvailableSlots(
      drivingSchool,
      branch,
      targetDate,
    );
    logger.info(
      `Discovered ${openSlots.length} vacant lesson slots ready for scheduling at ${drivingSchool} - [${branch}] on ${dateString}`,
    );
    return openSlots;
  }

  // ==========================================================================
  // 4. ADMINISTRATIVE REVENUE & LOGISTICS MONITORING
  // ==========================================================================
  /**
   * Pulls filtered lists of operational tracking data for administrative grid dashboards.
   */
  static async adminSearchBookings(filters: {
    drivingSchool: string;
    branch: string;
    dateString?: string;
    instructorId?: string;
  }): Promise<IBooking[]> {
    if (!filters.drivingSchool || !filters.branch) {
      logger.error(
        "Admin Schedule Filtering Aborted: Missing primary branch multi-tenant properties",
      );
      throw new ApiError(
        400,
        "Driving school brand and branch location properties must be supplied.",
      );
    }

    const queryFilters: any = {
      drivingSchool: filters.drivingSchool,
      branch: filters.branch,
      instructorId: filters.instructorId,
    };

    if (filters.dateString) {
      const parsedDate = new Date(filters.dateString);
      if (!isNaN(parsedDate.getTime())) {
        queryFilters.date = parsedDate;
      }
    }

    const historicalLogs = await BookingRepository.searchBookings(queryFilters);
    logger.info(
      `Dashboard Audit: Pulled ${historicalLogs.length} matching schedule records from security logs.`,
    );
    return historicalLogs;
  }
}
