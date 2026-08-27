import { Router } from "express";
import {
  StudentWebController,
  StudentBotController,
} from "./student.controller";
import logger from "../../utils/logger";

const studentRouter = Router();

// Middleware to log incoming network traffic hitting this specific feature module
studentRouter.use((req, res, next) => {
  logger.info(
    `🛣️ Traffic Routing: [${req.method}] hitting student feature cluster at path: ${req.path}`,
  );
  next();
});

// ============================================================================
// 🤖 WHATSAPP BOT WEBHOOK ENDPOINTS
// ============================================================================
/**
 * @route   POST /api/v1/students/bot/context
 * @desc    Fetches or initializes an ultra-light bot parsing state for a WhatsApp user
 * @access  Public (Secured via Meta webhook verification tokens globally later)
 */
studentRouter.post("/bot/context", StudentBotController.getBotContext);

// ============================================================================
// 🖥️ ADMINISTRATIVE WEB DASHBOARD CRUD ENDPOINTS
// ============================================================================

/**
 * @route   POST /api/v1/students/admin
 * @desc    Manually initialize a student profile from the office management panel
 * @access  Private/Admin
 */
studentRouter.post("/admin", StudentWebController.create);

/**
 * @route   GET /api/v1/students/admin/search
 * @desc    Extracts operational lists filtered by school brand and specific branch names
 * @access  Private/Admin
 */
studentRouter.get("/admin/search", StudentWebController.getByBranch);

/**
 * @route   GET /api/v1/students/admin/:id
 * @desc    Retrieves a single student profile filtered through the security response adapter
 * @access  Private/Admin
 */
studentRouter.get("/admin/:id", StudentWebController.getById);

/**
 * @route   PUT /api/v1/students/admin/:id
 * @desc    Updates atomic user data after running requested payloads through partial Zod checks
 * @access  Private/Admin
 */
studentRouter.put("/admin/:id", StudentWebController.update);

/**
 * @route   DELETE /api/v1/students/admin/:id
 * @desc    Safely triggers a soft-delete mechanism to isolate accounts without affecting historical records
 * @access  Private/Admin
 */
studentRouter.delete("/admin/:id", StudentWebController.delete);

export default studentRouter;
