import { Request, Response, NextFunction } from "express";
import { BranchService } from "./branch.service";
import { BranchAdapter } from "./branch.adapter";
import logger from "../../utils/logger";

export class BranchWebController {
  // ============================================================================
  // 1. ADMINISTRATIVE DASHBOARD: REGISTER/CREATE BRANCH
  // ============================================================================
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      logger.info(
        "HTTP Request: Admin starting allocation sequence for a localized branch hub.",
      );

      const rawBranch = await BranchService.registerBranch(req.body);
      const safeResponse = BranchAdapter.transformToSafeResponse(rawBranch);

      return res.status(201).json({
        success: true,
        message:
          "Branch workspace successfully mapped and registered under corporate tenant.",
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 2. ADMINISTRATIVE DASHBOARD: FETCH INDIVIDUAL BRANCH DETAILS
  // ============================================================================
  static async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // ✅ Type-safe string handling: Explicitly cast parameters to a clean string
      const branchId =
        typeof req.params.id === "string"
          ? req.params.id
          : String(req.params.id || "");

      logger.info(
        `HTTP Request: Locating internal configuration matrices for Branch ID: ${branchId}`,
      );

      const branch = await BranchService.getBranchDetails(branchId);
      const safeResponse = BranchAdapter.transformToSafeResponse(branch);

      return res.status(200).json({
        success: true,
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 3. MULTI-TENANT ROSTER: LIST ALL TENANT BRANCHES
  // ============================================================================
  static async getBySchool(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // ✅ Guarding query parameters safely to avoid 'string | string[]' array crashes
      const schoolId =
        typeof req.query.school === "string" ? req.query.school : "";

      logger.info(
        `HTTP Request: Fetching comprehensive branch roster for Master Tenant: ${schoolId}`,
      );

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message:
            "A single, valid driving school identification token is strictly required as a query parameter.",
        });
      }

      const activeBranches = await BranchService.listSchoolBranches(schoolId);
      const safeList = BranchAdapter.transformList(activeBranches);

      return res.status(200).json({
        success: true,
        count: safeList.length,
        data: safeList,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 4. CLIENT GEOGRAPHIC SEARCH: REGIONAL BRANCH LOCATOR
  // ============================================================================
  static async searchByCity(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // ✅ Guarding both query lines securely against mixed array injections
      const schoolId =
        typeof req.query.school === "string" ? req.query.school : "";
      const cityQuery =
        typeof req.query.city === "string" ? req.query.city : "";

      logger.info(
        `HTTP Request: Searching for active branches matching location query: ${cityQuery}`,
      );

      if (!schoolId || !cityQuery) {
        return res.status(400).json({
          success: false,
          message:
            "Both school context and localized location search keyword strings must be provided.",
        });
      }

      const matchingBranches = await BranchService.locateBranchesByCity(
        schoolId,
        cityQuery,
      );
      const safeList = BranchAdapter.transformList(matchingBranches);

      return res.status(200).json({
        success: true,
        count: safeList.length,
        data: safeList,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 5. ADMINISTRATIVE DASHBOARD: PATCH PROFILE MODIFICATIONS
  // ============================================================================
  static async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // ✅ Clean parameter type isolate guard
      const branchId =
        typeof req.params.id === "string"
          ? req.params.id
          : String(req.params.id || "");

      logger.info(
        `HTTP Request: Submitting document patch adjustments for Branch ID: ${branchId}`,
      );

      const updatedBranch = await BranchService.updateBranchProfile(
        branchId,
        req.body,
      );
      const safeResponse = BranchAdapter.transformToSafeResponse(updatedBranch);

      return res.status(200).json({
        success: true,
        message: "Branch administrative data records successfully updated.",
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 6. ADMINISTRATIVE DASHBOARD: SOFT TERMINATION
  // ============================================================================
  static async removeBranch(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // ✅ Clean parameter type isolate guard
      const branchId =
        typeof req.params.id === "string"
          ? req.params.id
          : String(req.params.id || "");

      logger.warn(
        `HTTP Request: Revoking active tracking permission lines for Branch ID: ${branchId}`,
      );

      const deactivatedBranch =
        await BranchService.suspendBranchService(branchId);

      return res.status(200).json({
        success: true,
        message: "Branch status cleanly converted to inactive state.",
        branchId: deactivatedBranch._id,
      });
    } catch (error) {
      next(error);
    }
  }
}
