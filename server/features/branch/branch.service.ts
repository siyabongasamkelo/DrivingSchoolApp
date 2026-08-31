import { BranchRepository } from "./branch.repository";
import { IBranch } from "./branch.model";
import { ApiError } from "../../utils/ApiError";
import logger from "../../utils/logger";

export class BranchService {
  // ============================================================================
  // 1. REGISTER NEW BRANCH (Defensive Logic Sequence)
  // ============================================================================
  /**
   * Auto-formats slugs, ensures structural uniqueness, and registers a driving school branch asset
   */
  static async registerBranch(payload: Partial<IBranch>): Promise<IBranch> {
    const { drivingSchool, branchName, branchCode } = payload;

    if (!drivingSchool || !branchName || !branchCode) {
      logger.error(
        "Branch Registration Failed: Missing mandatory identity metrics on incoming payload",
      );
      throw new ApiError(
        400,
        "Driving school master link, branch location name, and unique branch code are strictly required.",
      );
    }

    // 🔄 Auto-Generate URL Slug from Branch Name
    payload.slug = branchName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Strip away weird characters
      .replace(/\s+/g, "-") // Collapse multiple spaces into a single dash
      .replace(/-+/g, "-"); // Deduplicate dashes

    logger.info(
      `🔄 [BranchService] Computed URL string slug for branch: ${payload.slug}`,
    );

    try {
      const savedBranch = await BranchRepository.create(payload);
      logger.info(
        `🎯 Localized branch workspace successfully registered! ID: ${savedBranch._id}`,
      );
      return savedBranch;
    } catch (error: any) {
      logger.error(
        `Database Constraint Violation on Branch allocation: ${error.message}`,
      );
      // Catch MongoDB unique index violations (e.g., duplicate branchCode)
      if (error.code === 11000) {
        throw new ApiError(
          409,
          `Registration Conflict: A branch location with the code '${branchCode.toUpperCase()}' already exists inside the system registries.`,
        );
      }
      throw error;
    }
  }

  // ============================================================================
  // 2. OPERATIONAL REGIONAL LOOKUPS
  // ============================================================================

  /**
   * Pulls detailed data blocks for a single branch location via database identity tokens
   */
  static async getBranchDetails(branchId: string): Promise<IBranch> {
    if (!branchId) {
      throw new ApiError(400, "Branch operational tracker token is required.");
    }

    const branch = await BranchRepository.findById(branchId);
    if (!branch) {
      throw new ApiError(
        404,
        "The requested driving school branch location could not be discovered.",
      );
    }
    return branch;
  }

  /**
   * Pulls the branch lists belonging directly to a parent multi-tenant enterprise system
   */
  static async listSchoolBranches(drivingSchoolId: string): Promise<IBranch[]> {
    if (!drivingSchoolId) {
      throw new ApiError(
        400,
        "Parent driving school master identity token is required to collect localized assets.",
      );
    }
    return await BranchRepository.findByDrivingSchool(drivingSchoolId);
  }

  /**
   * Filters active locations across address records using wildcard matching strings
   */
  static async locateBranchesByCity(
    drivingSchoolId: string,
    cityQuery: string,
  ): Promise<IBranch[]> {
    if (!drivingSchoolId || !cityQuery) {
      throw new ApiError(
        400,
        "Both driving school context and regional search terms must be provided.",
      );
    }
    return await BranchRepository.findByCityOrAddress(
      drivingSchoolId,
      cityQuery.trim(),
    );
  }

  // ============================================================================
  // 3. TARGETED PROFILE PATCHING & DEACTIVATION
  // ============================================================================

  /**
   * Intercepts and patches localized branch details safely
   */
  static async updateBranchProfile(
    branchId: string,
    updatePayload: Partial<IBranch>,
  ): Promise<IBranch> {
    if (!branchId) {
      throw new ApiError(
        400,
        "Target branch identifier token is required to execute adjustments.",
      );
    }

    // If name is modified, dynamically recompute the URL slug alignment
    if (updatePayload.branchName) {
      updatePayload.slug = updatePayload.branchName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }

    logger.info(
      `🔄 [BranchService] Processing profile updates for Branch: ${branchId}`,
    );

    const updatedRecord = await BranchRepository.update(
      branchId,
      updatePayload,
    );
    if (!updatedRecord) {
      throw new ApiError(
        404,
        "Branch modification aborted. Location details not found in system grids.",
      );
    }

    return updatedRecord;
  }

  /**
   * Disables the branch location from active operations, removing it from booking visibility
   */
  static async suspendBranchService(branchId: string): Promise<IBranch> {
    if (!branchId) {
      throw new ApiError(
        400,
        "Target branch ID parameter is required for service removal.",
      );
    }

    const deactivatedBranch = await BranchRepository.softDelete(branchId);
    if (!deactivatedBranch) {
      throw new ApiError(
        404,
        "Requested branch profile could not be found to transition operational states.",
      );
    }

    logger.warn(
      `⚠️ Branch ID ${branchId} has been pulled off active scheduling matrices.`,
    );
    return deactivatedBranch;
  }
}
