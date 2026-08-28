import { Slot, ISlot } from "./slot.model";
import { Types } from "mongoose";
import logger from "../../utils/logger";

export class SlotRepository {
  /**
   * 🌟 RESTORED METHOD: Resolves a single inventory slot by its unique database identifier
   * Used by BookingService to extract metadata (times, instructors, vehicles) before final mapping
   */
  static async findSlotById(slotId: string): Promise<ISlot | null> {
    logger.info(
      `🔍 [SlotRepository] Resolving metadata details for slot asset ID: ${slotId}`,
    );

    // We run a standard findById query
    return await Slot.findById(new Types.ObjectId(slotId))
      .populate("instructor")
      .populate("vehicle") // If vehicles are pre-assigned to slots in your domain
      .lean();
  }

  /**
   * Fetches available (unbooked) slots for a specific branch and date
   * Perfect for showing the WhatsApp Bot list menu or Admin scheduling panel
   */
  static async findAvailableSlots(
    drivingSchool: string,
    branch: string,
    date: Date,
  ): Promise<ISlot[]> {
    logger.info(
      `🔍 [SlotRepository] Searching open slots for ${drivingSchool} (${branch}) on date: ${date.toISOString().split("T")[0]}`,
    );

    return await Slot.find({
      drivingSchool,
      branch,
      date,
      isBooked: false,
    })
      .sort({ startTime: 1 }) // Order chronologically (08:00, 09:15, etc.)
      .populate("instructor", "profile.fullName phoneNo") // Bring back basic instructor details
      .lean();
  }

  /**
   * Atomically locks and claims a slot for a student
   * This specific update query prevents double-booking race conditions completely
   */
  static async claimSlot(
    slotId: string,
    studentId: string,
    bookingRef: string,
  ): Promise<ISlot | null> {
    logger.info(
      `🔒 [SlotRepository] Attempting atomic lock on slot: ${slotId} for student: ${studentId}`,
    );

    return await Slot.findOneAndUpdate(
      {
        _id: new Types.ObjectId(slotId),
        isBooked: false, // 🚨 CRITICAL: Ensures it hasn't been sniped by another user a millisecond ago
      },
      {
        $set: {
          isBooked: true,
          bookedBy: new Types.ObjectId(studentId),
          bookingRef: new Types.ObjectId(bookingRef),
        },
      },
      { new: true }, // Returns the newly updated document
    );
  }
}
