import { Router } from "express";
import { InstructorWebController } from "./instructor.controller";
import {
  createInstructorSchema,
  updateInstructorSchema,
} from "./instructor.validation";
import logger from "../../utils/logger";
import { validate } from "../../middleware/validate.middleware";

const instructorRouter = Router();

// Middleware to log incoming network traffic hitting this specific feature module cluster
instructorRouter.use((req, res, next) => {
  logger.info(
    `🛣️ Traffic Routing: [${req.method}] hitting instructor feature cluster at path: ${req.path}`,
  );
  next();
});

// ============================================================================
// 🖥️ ADMINISTRATIVE WEB DASHBOARD ENDPOINTS
// ============================================================================

/**
 * @route   POST /api/v1/instructors/admin
 * @desc    Onboards and registers a new instructor profile to the driving school database
 */
instructorRouter.post(
  "/admin",
  validate(createInstructorSchema), // 🔥 Route-level defense guard!
  InstructorWebController.create,
);

/**
 * @route   PATCH /api/v1/instructors/admin/:id
 * @desc    Granularly modifies an instructor's sub-document records safely
 */
instructorRouter.patch(
  "/admin/:id",
  validate(updateInstructorSchema), // 🔥 Route-level defense guard!
  InstructorWebController.update,
);

/**
 * @route   GET /api/v1/instructors/admin/search
 * @desc    Extracts operational branch instructor rosters filtered by driving school and branch
 */
instructorRouter.get("/admin/search", InstructorWebController.getByBranch);

/**
 * @route   POST /api/v1/instructors/admin/:id/bind-vehicle
 * @desc    Dynamically links or clears a tracking vehicle assignment profile to the instructor
 */
instructorRouter.post(
  "/admin/:id/bind-vehicle",
  InstructorWebController.bindVehicle,
);

/**
 * @route   DELETE /api/v1/instructors/admin/:id
 * @desc    Executes an administrative soft deactivation flag instead of destructive database hard drops
 */
instructorRouter.delete("/admin/:id", InstructorWebController.removeStaff);

export default instructorRouter;
