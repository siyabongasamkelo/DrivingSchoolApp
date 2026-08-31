import { VehicleRepository } from "./vehicle.repository";
import { IVehicle, VehicleStatus, TransmissionType } from "./vehicle.model";
import { ApiError } from "../../utils/ApiError";
import logger from "../../utils/logger";

export class VehicleService {
  // ============================================================================
  // 1. OBOARD NEW FLEET ASSET (Defensive Creation Sequence)
  // ============================================================================
  /**
   * Registers a fresh physical vehicle asset line under a localized branch cluster
   */
  static async onboardVehicle(payload: Partial<IVehicle>): Promise<IVehicle> {
    const {
      drivingSchool,
      branch,
      vehicleName,
      plateNumber,
      discNo,
      transmission,
      licenseCode,
    } = payload;

    // Strict structural check upfront to enforce architectural contract patterns
    if (
      !drivingSchool ||
      !branch ||
      !vehicleName ||
      !plateNumber ||
      !discNo ||
      !transmission ||
      !licenseCode
    ) {
      logger.error(
        "Vehicle Onboarding Failed: Missing mandatory asset metrics on payload",
      );
      throw new ApiError(
        400,
        "Driving school, branch, vehicle name, plate number, disc number, license code, and transmission type are strictly required.",
      );
    }

    try {
      const savedVehicle = await VehicleRepository.create(payload);
      logger.info(
        `🎯 Fleet vehicle asset successfully registered and active! ID: ${savedVehicle._id}`,
      );
      return savedVehicle;
    } catch (error: any) {
      logger.error(
        `Database Constraint Violation on Vehicle fleet allocation: ${error.message}`,
      );
      // Catch MongoDB unique constraint key triggers (duplicate plateNumber or discNo)
      if (error.code === 11000) {
        throw new ApiError(
          409,
          "Asset Collision Conflict: A vehicle with this registration plate number or license disc number already exists.",
        );
      }
      throw error;
    }
  }

  // ============================================================================
  // 2. FLEET DIRECTORY LOOKUPS
  // ============================================================================

  /**
   * Pulls structural configuration records for an individual vehicle profile
   */
  static async getVehicleDetails(vehicleId: string): Promise<IVehicle> {
    if (!vehicleId) {
      throw new ApiError(
        400,
        "Vehicle identification token tracking reference is required.",
      );
    }

    const vehicle = await VehicleRepository.findById(vehicleId);
    if (!vehicle) {
      throw new ApiError(
        404,
        "The requested fleet vehicle profile details could not be discovered.",
      );
    }
    return vehicle;
  }

  /**
   * Coordinates multitenant lookups to list the full fleet line deployed at a specific branch
   */
  static async listBranchFleet(branchId: string): Promise<IVehicle[]> {
    if (!branchId) {
      throw new ApiError(
        400,
        "Localized branch context variable token must be provided to fetch its assigned fleet.",
      );
    }

    logger.info(
      `📍 [VehicleService] Collecting complete roster overview for branch fleet: ${branchId}`,
    );
    return await VehicleRepository.findByBranch(branchId);
  }

  /**
   * ⚡ TARGETED BOOKING ALLOCATOR: Resolves available vehicles matching target constraints
   * Perfect lookahead utility block for the calendar slot layer checks.
   */
  static async getAvailableFleetForLesson(
    branchId: string,
    licenseCode: string,
    transmission: TransmissionType,
  ): Promise<IVehicle[]> {
    if (!branchId || !licenseCode || !transmission) {
      throw new ApiError(
        400,
        "Branch context, lesson license classification code, and transmission style are required to filter matching fleet assets.",
      );
    }

    logger.info(
      `🔍 [VehicleService] Querying available fleet variants matching specification rules: [${licenseCode}] [${transmission}]`,
    );
    return await VehicleRepository.findAvailableForLesson(
      branchId,
      licenseCode,
      transmission,
    );
  }

  // ============================================================================
  // 3. TARGETED PROFILE SETTERS & MAINTENANCE WORKFLOWS
  // ============================================================================

  /**
   * Intercepts updates to save general configuration changes cleanly
   */
  static async updateVehicleProfile(
    vehicleId: string,
    updatePayload: Partial<IVehicle>,
  ): Promise<IVehicle> {
    if (!vehicleId) {
      throw new ApiError(
        400,
        "Target vehicle tracker parameter is required to submit changes.",
      );
    }

    logger.info(
      `🔄 [VehicleService] Processing configuration patch adjustments for Vehicle: ${vehicleId}`,
    );

    const updatedRecord = await VehicleRepository.update(
      vehicleId,
      updatePayload,
    );
    if (!updatedRecord) {
      throw new ApiError(
        404,
        "Vehicle profile adjustments aborted. Asset was not located in active rows.",
      );
    }

    return updatedRecord;
  }

  /**
   * Shifts a vehicle's maintenance status to coordinate breakdown pull-outs instantly
   */
  static async transitionMaintenanceState(
    vehicleId: string,
    targetStatus: VehicleStatus,
    visitDateString?: string,
  ): Promise<IVehicle> {
    if (!vehicleId || !targetStatus) {
      throw new ApiError(
        400,
        "Both vehicle identifier and target maintenance status must be provided.",
      );
    }

    const mechanicDate = visitDateString
      ? new Date(visitDateString)
      : undefined;

    const modifiedVehicle = await VehicleRepository.updateMaintenanceState(
      vehicleId,
      targetStatus,
      mechanicDate,
    );

    if (!modifiedVehicle) {
      throw new ApiError(
        404,
        "Failed to transition state. Target fleet vehicle tracking profile could not be found.",
      );
    }

    logger.warn(
      `🔧 [VehicleService] Fleet asset state modification recorded for ID ${vehicleId} -> Shifted to: ${targetStatus}`,
    );
    return modifiedVehicle;
  }
}
