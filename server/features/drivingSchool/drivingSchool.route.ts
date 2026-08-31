import { Router } from "express";
import { DrivingSchoolWebController } from "./drivingSchool.controller";
import {
  createDrivingSchoolSchema,
  updateDrivingSchoolSchema,
} from "./drivingSchool.validation";
import logger from "../../utils/logger";
import { validate } from "../../middleware/validate.middleware";

const drivingSchoolRouter = Router();

// Middleware to audit and trace network traffic entering the master tenant module cluster
drivingSchoolRouter.use((req, res, next) => {
  logger.info(
    `🏢 Tenant Route Trace: [${req.method}] approaching driving-school core node at path: ${req.path}`,
  );
  next();
});

// ============================================================================
// 🖥️ PLATFORM GATEWAY & ENTERPRISE TENANT ENDPOINTS
// ============================================================================

/**
 * @route   POST /api/v1/driving-schools
 * @desc    Onboards and initializes a completely new master driving school corporate tenant
 * @access  Private (System Admin / Initial Setup)
 */
drivingSchoolRouter.post(
  "/",
  validate(createDrivingSchoolSchema), // 🛡️ Input layout perimeter schema check
  DrivingSchoolWebController.create,
);

/**
 * @route   GET /api/v1/driving-schools/resolve
 * @desc    Public portal resolution endpoint matching an incoming front-end subdomain vanity string
 * @access  Public (Client Web Portals)
 */
drivingSchoolRouter.get("/resolve", DrivingSchoolWebController.getBySubdomain);

/**
 * @route   GET /api/v1/driving-schools/:id
 * @desc    Pulls comprehensive configuration parameters and profiles for a single school tenant
 * @access  Private (Founders / Platform Admin)
 */
drivingSchoolRouter.get("/:id", DrivingSchoolWebController.getById);

/**
 * @route   PATCH /api/v1/driving-schools/:id
 * @desc    Applies deep atomic updates to company details, blocking core performance metric manipulation
 * @access  Private (Founder Account Holder)
 */
drivingSchoolRouter.patch(
  "/:id",
  validate(updateDrivingSchoolSchema), // 🛡️ Modern nested partial schema guard
  DrivingSchoolWebController.update,
);

/**
 * @route   PATCH /api/v1/driving-schools/:id/toggle-access
 * @desc    Super-admin state override to suspend or activate platform system lines for billing or verification
 * @access  Private (Platform Super Admin)
 */
drivingSchoolRouter.patch(
  "/:id/toggle-access",
  DrivingSchoolWebController.toggleStatus,
);

export default drivingSchoolRouter;
