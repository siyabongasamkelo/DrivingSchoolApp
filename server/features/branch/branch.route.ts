import { Router } from "express";
import { BranchWebController } from "./branch.controller";
import { createBranchSchema, updateBranchSchema } from "./branch.validation";
import logger from "../../utils/logger";
import { validate } from "../../middleware/validate.middleware";

const branchRouter = Router();

// Middleware to audit and trace structural network traffic entering the branch feature block
branchRouter.use((req, res, next) => {
  logger.info(
    ` lanes Route Trace: [${req.method}] approaching branch infrastructure node at path: ${req.path}`,
  );
  next();
});

// ============================================================================
// 🖥️ ENTERPRISE TENANT & ADMINISTRATIVE OPERATIONS
// ============================================================================

/**
 * @route   POST /api/v1/branches
 * @desc    Onboards and initializes a new physical school operations branch hub
 * @access  Private (System Admin/Super Admin)
 */
branchRouter.post(
  "/",
  validate(createBranchSchema), // 🛡️ Heavy layout parameter perimeter guard
  BranchWebController.create,
);

/**
 * @route   GET /api/v1/branches/search/school
 * @desc    Extracts all localized branch assets operating under a master driving school tenant group
 * @access  Private (Dashboard Operations/Founders)
 */
branchRouter.get("/search/school", BranchWebController.getBySchool);

/**
 * @route   GET /api/v1/branches/search/city
 * @desc    Public or private localized directory scan filtering locations by regional matching strings
 * @access  Public/Private
 */
branchRouter.get("/search/city", BranchWebController.searchByCity);

/**
 * @route   GET /api/v1/branches/:id
 * @desc    Pulls comprehensive, clean management matrices for a single location hub
 * @access  Private (Staff/Management)
 */
branchRouter.get("/:id", BranchWebController.getById);

/**
 * @route   PATCH /api/v1/branches/:id
 * @desc    Applies deep atomic updates to nested structural configurations smoothly
 * @access  Private (Founder/Regional Manager)
 */
branchRouter.patch(
  "/:id",
  validate(updateBranchSchema), // 🛡️ Nested partial structural parameter check
  BranchWebController.update,
);

/**
 * @route   DELETE /api/v1/branches/:id
 * @desc    Triggers an administrative soft deactivation workflow, pulling the location out of active scheduling calendars
 * @access  Private (Founder/Master Admin)
 */
branchRouter.delete("/:id", BranchWebController.removeBranch);

export default branchRouter;
