import { Router } from "express";
import { VehicleWebController } from "./vehicle.controller";
import { createVehicleSchema, updateVehicleSchema } from "./vehicle.validation";
import logger from "../../utils/logger";
import { validate } from "../../middleware/validate.middleware";

const vehicleRouter = Router();

// Middleware to audit traffic entering the fleet asset feature module cluster
vehicleRouter.use((req, res, next) => {
  logger.info(
    `🚘 Fleet Route Trace: [${req.method}] approaching vehicle inventory cluster at path: ${req.path}`,
  );
  next();
});

// ============================================================================
// 🖥️ FLEET OPERATIONAL & LOGISTICS ENDPOINTS
// ============================================================================

/**
 * @route   POST /api/v1/vehicles
 * @desc    Onboards and allocates a completely new vehicle asset line to a branch
 * @access  Private (System Admin / Fleet Manager)
 */
vehicleRouter.post(
  "/",
  validate(createVehicleSchema), // 🛡️ Input perimeter schema guard
  VehicleWebController.create,
);

/**
 * @route   GET /api/v1/vehicles/search/branch
 * @desc    Extracts the full localized operational fleet listing deployed at a branch
 * @access  Private (Dashboard Staff / Founders)
 */
vehicleRouter.get("/search/branch", VehicleWebController.getByBranch);

/**
 * @route   GET /api/v1/vehicles/search/available
 * @desc    Lookahead filter utility block displaying available cars matching class and transmission constraints
 * @access  Private/Public (Internal Booking Logic Engine)
 */
vehicleRouter.get("/search/available", VehicleWebController.getMatchingFleet);

/**
 * @route   GET /api/v1/vehicles/:id
 * @desc    Pulls comprehensive structural and technical specifications for an individual car profile
 * @access  Private (Staff / Management)
 */
vehicleRouter.get("/:id", VehicleWebController.getById);

/**
 * @route   PATCH /api/v1/vehicles/:id
 * @desc    Applies deep atomic updates to inner layout profiles cleanly without resetting structures
 * @access  Private (Fleet Manager / Founder)
 */
vehicleRouter.patch(
  "/:id",
  validate(updateVehicleSchema), // 🛡️ Nested partial schema guard
  VehicleWebController.update,
);

/**
 * @route   PATCH /api/v1/vehicles/:id/maintenance
 * @desc    Logs a logistics state override to instantly transition an asset in or out of active workshops
 * @access  Private (Fleet Operator / Branch Manager)
 */
vehicleRouter.patch(
  "/:id/maintenance",
  VehicleWebController.changeMaintenanceState,
);

export default vehicleRouter;
