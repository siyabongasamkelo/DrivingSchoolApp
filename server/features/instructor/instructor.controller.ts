import { Request, Response, NextFunction } from "express";
import { InstructorService } from "./instructor.service";
import { InstructorAdapter } from "./instructor.adapter";
import logger from "../../utils/logger";

// 🖥️ ADMINISTRATIVE WEB DASHBOARD CONTROLLER
export class InstructorWebController {
  // ==========================================
  // 1. ADMIN DASHBOARD: ONBOARD/CREATE INSTRUCTOR
  // ==========================================
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      logger.info(
        "HTTP Request: Admin initiating new instructor onboarding transaction cycle",
      );

      // ✅ ZERO VALIDATION LOGIC HERE - Pure orchestration!
      const rawInstructor = await InstructorService.onboardInstructor(req.body);
      const safeResponse =
        InstructorAdapter.transformToSafeResponse(rawInstructor);

      return res.status(201).json({
        success: true,
        message:
          "Instructor profile successfully registered and locked down into active service.",
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 2. ADMIN DASHBOARD: UPDATE INSTRUCTOR PROFILE
  // ==========================================
  static async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // const { id } = req.params;
      const id = String(req.params.id || "");
      logger.info(
        `HTTP Request: Executing profile modification patch for Instructor ID: ${id}`,
      );

      // ✅ ZERO VALIDATION LOGIC HERE - Pure orchestration!
      const updatedInstructor = await InstructorService.updateProfile(
        id,
        req.body,
      );
      const safeResponse =
        InstructorAdapter.transformToSafeResponse(updatedInstructor);

      return res.status(200).json({
        success: true,
        message: "Instructor record adjustments saved completely.",
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 3. ADMIN DASHBOARD: FILTERED ROSTER BY BRANCH
  // ==========================================
  static async getByBranch(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const school = String(req.query.school || "");
      const branch = String(req.query.branch || "");

      logger.info(
        `HTTP Request: Extracting operational branch rosters for School: ${school}, Branch: ${branch}`,
      );

      if (!school || !branch) {
        return res.status(400).json({
          success: false,
          message:
            "Both school identification token and branch context query parameters are strictly required.",
        });
      }

      const activeStaff = await InstructorService.listBranchStaff(
        school,
        branch,
      );
      const safeList = InstructorAdapter.transformList(activeStaff);

      return res.status(200).json({
        success: true,
        count: safeList.length,
        data: safeList,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 4. ADMIN DASHBOARD: ASSIGN/BIND VEHICLE ASSET
  // ==========================================
  static async bindVehicle(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // const { id } = req.params;

      const id = String(req.params.id || "");

      const { vehicleId } = req.body; // Expects {"vehicleId": "65df1a..."} or null to free the bond

      logger.info(
        `HTTP Request: Altering tracking configurations to link Vehicle: ${vehicleId} to Instructor: ${id}`,
      );

      const updatedInstructor = await InstructorService.bindVehicleAsset(
        id,
        vehicleId,
      );
      const safeResponse =
        InstructorAdapter.transformToSafeResponse(updatedInstructor);

      return res.status(200).json({
        success: true,
        message: "Fleet tracking assignment records successfully synchronized.",
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 5. ADMIN DASHBOARD: SOFT SERVICE DEACTIVATION
  // ==========================================
  static async removeStaff(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // const { id } = req.params;
      const id = String(req.params.id || "");
      logger.warn(
        `HTTP Request: Flags triggered to pull Instructor ID: ${id} from scheduling lines`,
      );

      const deactivatedInstructor =
        await InstructorService.removeStaffFromService(id);

      return res.status(200).json({
        success: true,
        message: "Staff identity pulled from active duty registries cleanly.",
        instructorId: deactivatedInstructor._id,
      });
    } catch (error) {
      next(error);
    }
  }
}
