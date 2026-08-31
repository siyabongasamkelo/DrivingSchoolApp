import { Router } from "express";
import { FounderWebController } from "./founder.controller";
import { createFounderSchema, updateFounderSchema } from "./founder.validation";
import logger from "../../utils/logger";
import { validate } from "../../middleware/validate.middleware";

const founderRouter = Router();

// Middleware to monitor and audit network paths tapping into this administrative module
founderRouter.use((req, res, next) => {
  logger.info(
    `🛣️ Founder Route Traffic: [${req.method}] hitting corporate workspace cluster at path: ${req.path}`,
  );
  next();
});

// ============================================================================
// 🖥️ MASTER ADMIN & FOUNDER WORKSPACE ENDPOINTS
// ============================================================================

/**
 * @route   POST /api/v1/founders
 * @desc    Initializes and onboards a new primary business founder profile
 * @access  Private (System Admin/Super Admin)
 */
founderRouter.post(
  "/",
  validate(createFounderSchema), // 🛡️ Input structural guard check
  FounderWebController.create,
);

/**
 * @route   GET /api/v1/founders/:id
 * @desc    Fetches safe profile information for a specific business founder
 * @access  Private (Admin/Owner)
 */
founderRouter.get("/:id", FounderWebController.getById);

/**
 * @route   PATCH /api/v1/founders/:id
 * @desc    Granularly modifies a founder's internal records using nested structural validation
 * @access  Private (Owner)
 */
founderRouter.patch(
  "/:id",
  validate(updateFounderSchema), // 🛡️ Granular object patch verification guard
  FounderWebController.update,
);

/**
 * @route   POST /api/v1/founders/:id/assign-branch
 * @desc    Binds operational authority over an additional school branch to the founder profile
 * @access  Private (System Admin/Owner)
 */
founderRouter.post("/:id/assign-branch", FounderWebController.assignBranch);

export default founderRouter;
