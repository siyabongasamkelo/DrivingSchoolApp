import { Router, Request, Response, NextFunction } from "express";
import {
  BookingWebController,
  BookingBotController,
} from "./booking.controller";
import {
  adminBookingSchema,
  botSlotLookupSchema,
  botReserveSchema,
} from "./booking.validation";
import logger from "../../utils/logger";
import { validate } from "../../middleware/validate.middleware";

const bookingRouter = Router();

// Middleware to log incoming network traffic hitting this specific feature module
bookingRouter.use((req, res, next) => {
  logger.info(
    `🛣️ Traffic Routing: [${req.method}] hitting booking feature cluster at path: ${req.path}`,
  );
  next();
});

// ============================================================================
// 🤖 WHATSAPP BOT WEBHOOK ENDPOINTS
// ============================================================================

/**
 * @route   POST /api/v1/bookings/bot/slots
 * @desc    Fetches vacant, pre-generated slots and returns a text-based WhatsApp menu
 */
bookingRouter.post(
  "/bot/slots",
  validate(botSlotLookupSchema),
  BookingBotController.getAvailableSlots,
);

/**
 * @route   POST /api/v1/bookings/bot/reserve
 * @desc    Processes inline slot reservations chosen by the student via the bot
 */
bookingRouter.post(
  "/bot/reserve",
  validate(botReserveSchema), // 🔥 Route-level defense guard!
  BookingBotController.processBotSelection,
);

/**
 * @route   GET /api/v1/bookings/bot/itinerary/:studentId
 * @desc    Resolves forgotten lessons by returning a chronological WhatsApp schedule
 */
bookingRouter.get(
  "/bot/itinerary/:studentId",
  BookingBotController.getStudentItinerary,
);

// ============================================================================
// 🖥️ ADMINISTRATIVE WEB DASHBOARD CRUD ENDPOINTS
// ============================================================================

/**
 * @route   POST /api/v1/bookings/admin
 * @desc    Manually execute a lesson reservation from the office backend panel
 */
bookingRouter.post(
  "/admin",
  validate(adminBookingSchema), // 🔥 Route-level defense guard!
  BookingWebController.create,
);

/**
 * @route   GET /api/v1/bookings/admin/search
 * @desc    Extracts operational branch booking lists filtered by brand and optional filters
 */
bookingRouter.get("/admin/search", BookingWebController.getByBranch);

export default bookingRouter;
