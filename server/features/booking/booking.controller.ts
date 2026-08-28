import { Request, Response, NextFunction } from "express";
import { BookingService } from "./booking.service";
import { BookingAdapter } from "./booking.adapter";
import logger from "../../utils/logger";

// 🖥️ ADMINISTRATIVE WEB DASHBOARD CONTROLLER
export class BookingWebController {
  // ==========================================
  // 1. ADMIN DASHBOARD: CONFIRM/EXECUTE BOOKING
  // ==========================================
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      logger.info(
        "HTTP Request: Admin initiating manual lesson reservation sequence",
      );

      // ✅ ZERO VALIDATION LOGIC HERE - Pure orchestration!
      const finalizedReceipt = await BookingService.executeBooking(req.body);
      const safeResponse =
        BookingAdapter.transformAdminBooking(finalizedReceipt);

      return res.status(201).json({
        success: true,
        message: "Lesson booking successfully locked down and saved.",
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 2. ADMIN DASHBOARD: FILTERED SCHEDULING LOGS
  // ==========================================
  static async getByBranch(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const school = String(req.query.school || "");
      const branch = String(req.query.branch || "");
      const date = req.query.date ? String(req.query.date) : undefined;
      const instructorId = req.query.instructorId
        ? String(req.query.instructorId)
        : undefined;

      logger.info(
        `HTTP Request: Extracting branch booking sheets for School: ${school}, Branch: ${branch}`,
      );

      if (!school || !branch) {
        return res.status(400).json({
          success: false,
          message:
            "Both school name and branch query parameters are strictly required.",
        });
      }

      const logs = await BookingService.adminSearchBookings({
        drivingSchool: school,
        branch: branch,
        dateString: date,
        instructorId: instructorId,
      });

      const safeList = BookingAdapter.transformAdminBookingList(logs);

      return res.status(200).json({
        success: true,
        count: safeList.length,
        data: safeList,
      });
    } catch (error) {
      next(error);
    }
  }
}

// ============================================================================
// 🤖 WHATSAPP BOT CONVERSATIONAL CONTROLLER
// ============================================================================
export class BookingBotController {
  // ==========================================
  // 1. BOT ROUTER: DISCOVER AVAILABLE SLOTS
  // ==========================================
  static async getAvailableSlots(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      logger.info(
        "Bot Channel Webhook: Parsing request parameters for vacant spaces.",
      );

      // ✅ ZERO VALIDATION LOGIC HERE - Pure orchestration!
      const { drivingSchool, branch, targetDate } = req.body;

      const vacantSlots = await BookingService.getAvailableSlotsByDate(
        drivingSchool,
        branch,
        targetDate,
      );

      const formattedChatMenu = BookingAdapter.transformSlotsToWhatsAppMenu(
        vacantSlots,
        targetDate,
      );

      return res.status(200).json({
        success: true,
        whatsappTextPayload: formattedChatMenu,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 2. BOT ROUTER: PROCESS STUDENT CLAIM SELECTION
  // ==========================================
  static async processBotSelection(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      logger.info(
        "Bot Channel Webhook: Student attempting inline reservation block.",
      );

      // ✅ ZERO VALIDATION LOGIC HERE - Pure orchestration!
      const { drivingSchool, branch, studentId, targetSlotId } = req.body;

      const finalizedReceipt = await BookingService.executeBooking({
        drivingSchool,
        branch,
        student: studentId,
        slot: targetSlotId,
      });

      return res.status(201).json({
        success: true,
        message: "Bot inline booking processed completely.",
        bookingId: finalizedReceipt._id,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 3. BOT ROUTER: RESOLVE FORGOTTEN APPOINTMENTS
  // ==========================================
  static async getStudentItinerary(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { studentId } = req.params;
      const cleanStudentId = String(studentId || "");

      logger.info(
        `Bot Channel Webhook: Assembling upcoming reminder notification sheets for Student: ${cleanStudentId}`,
      );

      const scheduledLessons =
        await BookingService.getStudentItinerary(cleanStudentId);
      const formattedNotification =
        BookingAdapter.transformItineraryToWhatsAppMessage(scheduledLessons);

      return res.status(200).json({
        success: true,
        whatsappTextPayload: formattedNotification,
      });
    } catch (error) {
      next(error);
    }
  }
}
