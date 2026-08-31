import { Request, Response, NextFunction } from "express";
import { FounderService } from "./founder.service";
import { FounderAdapter } from "./founder.adapter";
import logger from "../../utils/logger";

export class FounderWebController {
  // ============================================================================
  // 1. ADMINISTRATIVE DASHBOARD: ONBOARD FOUNDER
  // ============================================================================
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      logger.info(
        "HTTP Request: Admin starting registration sequence for a new school founder profile.",
      );

      // Raw validation happens outside at route level via middleware!
      const rawFounder = await FounderService.onboardFounder(req.body);
      const safeResponse = FounderAdapter.transformToSafeResponse(rawFounder);

      return res.status(201).json({
        success: true,
        message:
          "Founder workspace successfully initialized and assigned to driving school.",
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 2. ADMINISTRATIVE DASHBOARD: FETCH FOUNDER PROFILE BY ID
  // ============================================================================
  static async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      //   const { id } = req.params;
      const id = String(req.params.id || "");
      logger.info(
        `HTTP Request: Locating administrative details for Founder ID: ${id}`,
      );

      const founder = await FounderService.getFounderDetails(id);
      const safeResponse = FounderAdapter.transformToSafeResponse(founder);

      return res.status(200).json({
        success: true,
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 3. ADMINISTRATIVE DASHBOARD: PATCH FOUNDER RECORDS
  // ============================================================================
  static async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      //   const { id } = req.params;
      const id = String(req.params.id || "");
      logger.info(
        `HTTP Request: Processing targeted patch updates for Founder ID: ${id}`,
      );

      const updatedFounder = await FounderService.updateFounderProfile(
        id,
        req.body,
      );
      const safeResponse =
        FounderAdapter.transformToSafeResponse(updatedFounder);

      return res.status(200).json({
        success: true,
        message: "Founder operational variables updated successfully.",
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 4. ADMINISTRATIVE DASHBOARD: ALLOCATE BRANCH ASSET TO FOUNDER
  // ============================================================================
  static async assignBranch(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      //   const { id } = req.params;
      const id = String(req.params.id || "");
      const { branchId } = req.body; // Expects {"branchId": "65df1a..."}

      logger.info(
        `HTTP Request: Binding expanded operations branch context ${branchId} to Founder ${id}`,
      );

      const modifiedFounder = await FounderService.attachBranchToFounder(
        id,
        branchId,
      );
      const safeResponse =
        FounderAdapter.transformToSafeResponse(modifiedFounder);

      return res.status(200).json({
        success: true,
        message:
          "Branch authority successfully added to founder corporate dashboard permissions.",
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }
}
