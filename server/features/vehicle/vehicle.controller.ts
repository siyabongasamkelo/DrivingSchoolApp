import { Request, Response, NextFunction } from "express";
import { VehicleService } from "./vehicle.service";
import { VehicleAdapter } from "./vehicle.adapter";
import { TransmissionType } from "./vehicle.model";
import logger from "../../utils/logger";

export class VehicleWebController {
  // ============================================================================
  // 1. ADMINISTRATIVE DASHBOARD: ONBOARD/CREATE VEHICLE ASSET
  // ============================================================================
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      logger.info(
        "HTTP Request: Admin starting fleet onboarding transaction for a physical vehicle.",
      );

      const rawVehicle = await VehicleService.onboardVehicle(req.body);
      const safeResponse = VehicleAdapter.transformToSafeResponse(rawVehicle);

      return res.status(201).json({
        success: true,
        message:
          "Fleet vehicle asset successfully registered and assigned to branch operational lines.",
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 2. ADMINISTRATIVE DASHBOARD: FETCH VEHICLE PROFILE BY ID
  // ============================================================================
  static async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // ✅ Type-safe parameter guard parsing single strings cleanly
      const vehicleId =
        typeof req.params.id === "string"
          ? req.params.id
          : String(req.params.id || "");

      logger.info(
        `HTTP Request: Gathering technical configurations for Vehicle ID: ${vehicleId}`,
      );

      const vehicle = await VehicleService.getVehicleDetails(vehicleId);
      const safeResponse = VehicleAdapter.transformToSafeResponse(vehicle);

      return res.status(200).json({
        success: true,
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 3. BRANCH MANAGEMENT: LIST THE LOCAL FLEET DEPLOYED AT A BRANCH
  // ============================================================================
  static async getByBranch(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // ✅ Guarding query metrics against array injection crashes
      const branchId =
        typeof req.query.branch === "string" ? req.query.branch : "";

      logger.info(
        `HTTP Request: Collecting fleet roster overview for Branch Node: ${branchId}`,
      );

      if (!branchId) {
        return res.status(400).json({
          success: false,
          message:
            "A single, valid branch location tracking token query parameter is strictly required.",
        });
      }

      const localFleet = await VehicleService.listBranchFleet(branchId);
      const safeList = VehicleAdapter.transformList(localFleet);

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
  // 4. BOOKING ENGINE LOOKAHEAD: FETCH MATCHING AVAILABLE VEHICLES
  // ============================================================================
  static async getMatchingFleet(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // ✅ Tight explicit type checking on all criteria fields
      const branch =
        typeof req.query.branch === "string" ? req.query.branch : "";
      const license =
        typeof req.query.license === "string" ? req.query.license : "";
      const transmission =
        typeof req.query.transmission === "string"
          ? req.query.transmission
          : "";

      logger.info(
        `HTTP Request: Running lookup query for available cars matching schema conditions: Branch [${branch}] Class [${license}] Gearbox [${transmission}]`,
      );

      if (!branch || !license || !transmission) {
        return res.status(400).json({
          success: false,
          message:
            "Branch token, license code classification string, and transmission style are required queries.",
        });
      }

      const matchingCars = await VehicleService.getAvailableFleetForLesson(
        branch,
        license,
        transmission as TransmissionType,
      );
      const safeList = VehicleAdapter.transformList(matchingCars);

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
  // 5. ADMINISTRATIVE DASHBOARD: PATCH PROFILE CONFIGURATIONS
  // ============================================================================
  static async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // ✅ Clean parameter type isolate guard
      const vehicleId =
        typeof req.params.id === "string"
          ? req.params.id
          : String(req.params.id || "");

      logger.info(
        `HTTP Request: Requesting setup patch edits on Vehicle ID: ${vehicleId}`,
      );

      const updatedVehicle = await VehicleService.updateVehicleProfile(
        vehicleId,
        req.body,
      );
      const safeResponse =
        VehicleAdapter.transformToSafeResponse(updatedVehicle);

      return res.status(200).json({
        success: true,
        message: "Fleet vehicle operational records updated successfully.",
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 6. FLEET LOGISTICS: ADJUST MAINTENANCE STATUS LINES
  // ============================================================================
  static async changeMaintenanceState(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // ✅ Clean parameter type isolate guard
      const vehicleId =
        typeof req.params.id === "string"
          ? req.params.id
          : String(req.params.id || "");
      const { status, lastMechanicVisit } = req.body; // Expects {"status": "MAINTENANCE" | "AVAILABLE", "lastMechanicVisit"?: "ISO..."}

      logger.warn(
        `HTTP Request: Logging maintenance transition for vehicle token: ${vehicleId} -> Shift state to: ${status}`,
      );

      if (!status) {
        return res.status(400).json({
          success: false,
          message:
            "The targeted maintenance status state variable is required inside the payload body.",
        });
      }

      const modifiedVehicle = await VehicleService.transitionMaintenanceState(
        vehicleId,
        status,
        lastMechanicVisit,
      );
      const safeResponse =
        VehicleAdapter.transformToSafeResponse(modifiedVehicle);

      return res.status(200).json({
        success: true,
        message: "Vehicle infrastructure tracking state shifted cleanly.",
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }
}
