import { Request, Response, NextFunction } from "express";
import { DrivingSchoolService } from "./drivingSchool.service";
import { DrivingSchoolAdapter } from "./drivingSchool.adapter";
import logger from "../../utils/logger";

export class DrivingSchoolWebController {
  // ============================================================================
  // 1. ADMINISTRATIVE DASHBOARD: REGISTER DRIVING SCHOOL TENANT
  // ============================================================================
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      logger.info(
        "HTTP Request: Admin starting registration sequence for a master driving school tenant.",
      );

      const rawSchool = await DrivingSchoolService.setupDrivingSchool(req.body);
      const safeResponse =
        DrivingSchoolAdapter.transformToSafeResponse(rawSchool);

      return res.status(201).json({
        success: true,
        message:
          "Driving school tenant successfully initialized into onboarding verification lines.",
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 2. ADMINISTRATIVE DASHBOARD: FETCH PROFILE BY ID
  // ============================================================================
  static async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // ✅ Type-safe string parameter guard
      const schoolId =
        typeof req.params.id === "string"
          ? req.params.id
          : String(req.params.id || "");

      logger.info(
        `HTTP Request: Locating corporate matrix for Driving School ID: ${schoolId}`,
      );

      const school = await DrivingSchoolService.getSchoolProfile(schoolId);
      const safeResponse = DrivingSchoolAdapter.transformToSafeResponse(school);

      return res.status(200).json({
        success: true,
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 3. MULTI-TENANT WEB PORTAL: RESOLVE METADATA BY SUBDOMAIN
  // ============================================================================
  static async getBySubdomain(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // ✅ Type-safe query string isolate guard
      const subdomain =
        typeof req.query.alias === "string" ? req.query.alias : "";

      logger.info(
        `HTTP Request: Resolving driving school context for subdomain link: ${subdomain}`,
      );

      if (!subdomain) {
        return res.status(400).json({
          success: false,
          message:
            "A single, valid subdomain alias string query parameter is strictly required.",
        });
      }

      const school =
        await DrivingSchoolService.resolveTenantBySubdomain(subdomain);
      const safeResponse = DrivingSchoolAdapter.transformToSafeResponse(school);

      return res.status(200).json({
        success: true,
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 4. ADMINISTRATIVE DASHBOARD: PATCH PROFILE MODIFICATIONS
  // ============================================================================
  static async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // ✅ Clean parameter type isolate guard
      const schoolId =
        typeof req.params.id === "string"
          ? req.params.id
          : String(req.params.id || "");

      logger.info(
        `HTTP Request: Submitting profile layout adjustments for School ID: ${schoolId}`,
      );

      const updatedSchool = await DrivingSchoolService.updateSchoolDetails(
        schoolId,
        req.body,
      );
      const safeResponse =
        DrivingSchoolAdapter.transformToSafeResponse(updatedSchool);

      return res.status(200).json({
        success: true,
        message:
          "Driving school administrative data records updated completely.",
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 5. PLATFORM ADMINISTRATION: TOGGLE SUSPENSION/VERIFICATION STATUS
  // ============================================================================
  static async toggleStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // ✅ Clean parameter type isolate guard
      const schoolId =
        typeof req.params.id === "string"
          ? req.params.id
          : String(req.params.id || "");
      const { status } = req.body; // Expects {"status": "ACTIVE" | "SUSPENDED"}

      logger.warn(
        `HTTP Request: Triggering platform service access shift for School ID: ${schoolId} -> ${status}`,
      );

      const modifiedSchool = await DrivingSchoolService.toggleTenantAccessState(
        schoolId,
        status,
      );
      const safeResponse =
        DrivingSchoolAdapter.transformToSafeResponse(modifiedSchool);

      return res.status(200).json({
        success: true,
        message:
          "Driving school multi-tenant systemic access state successfully modified.",
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }
}
