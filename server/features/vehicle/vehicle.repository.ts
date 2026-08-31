import {
  Vehicle,
  IVehicle,
  VehicleStatus,
  TransmissionType,
} from "./vehicle.model";
import { Types } from "mongoose";
import logger from "../../utils/logger";

export class VehicleRepository {
  // ============================================================================
  // 1. BASELINE CRUD OPERATIONS
  // ============================================================================

  /**
   * Persists a completely new physical vehicle asset line into the database grid
   */
  static async create(vehicleData: Partial<IVehicle>): Promise<IVehicle> {
    logger.info(
      `💾 [VehicleRepository] Registering fresh fleet vehicle record: ${vehicleData.vehicleName} (${vehicleData.plateNumber})`,
    );
    const newVehicle = new Vehicle(vehicleData);
    return await newVehicle.save();
  }

  /**
   * Locates a single vehicle profile via its primary database hex identification token
   */
  static async findById(vehicleId: string): Promise<IVehicle | null> {
    logger.info(
      `🔍 [VehicleRepository] Fetching configuration details for Vehicle ID: ${vehicleId}`,
    );
    return await Vehicle.findById(new Types.ObjectId(vehicleId))
      .populate("drivingSchool", "schoolName")
      .populate("branch", "branchName contactDetails.address");
  }

  /**
   * Performs granular updates on sub-documents using atomic Mongoose operators
   */
  static async update(
    vehicleId: string,
    updateData: Partial<IVehicle>,
  ): Promise<IVehicle | null> {
    logger.info(
      `📝 [VehicleRepository] Executing asset configuration patch on Vehicle ID: ${vehicleId}`,
    );
    return await Vehicle.findByIdAndUpdate(
      new Types.ObjectId(vehicleId),
      { $set: updateData },
      { new: true, runValidators: true },
    );
  }

  /**
   * Complete database elimination of a vehicle line asset (Reserved for master platform control shifts)
   */
  static async hardDelete(vehicleId: string): Promise<IVehicle | null> {
    logger.warn(
      `💥 [VehicleRepository] Executing permanent structural database drop for Vehicle ID: ${vehicleId}`,
    );
    return await Vehicle.findByIdAndDelete(new Types.ObjectId(vehicleId));
  }

  // ============================================================================
  // 2. SEARCH & BOOKING ALLOCATION QUERIES
  // ============================================================================

  /**
   * Extracts the complete localized operational fleet assigned to a single branch hub
   */
  static async findByBranch(branchId: string): Promise<IVehicle[]> {
    logger.info(
      `🚗 [VehicleRepository] Gathering fleet layout arrays for Branch Asset: ${branchId}`,
    );
    return await Vehicle.find({
      branch: new Types.ObjectId(branchId),
      "maintenanceSchedule.status": { $ne: VehicleStatus.DECOMMISSIONED }, // Don't pull destroyed inventory
    })
      .sort({ vehicleName: 1 })
      .lean();
  }

  /**
   * ⚡ TARGETED BOOKING MATCHER: Discovers operational vehicles at a localized branch
   * that match the exact license type and transmission demanded by a lesson booking.
   */
  static async findAvailableForLesson(
    branchId: string,
    licenseCode: string,
    transmission: TransmissionType,
  ): Promise<IVehicle[]> {
    logger.info(
      `📅 [VehicleRepository] Scanning branch availability matrices for active asset matching: [${licenseCode}] [${transmission}]`,
    );
    return await Vehicle.find({
      branch: new Types.ObjectId(branchId),
      licenseCode: licenseCode.toUpperCase().trim(),
      transmission: transmission,
      "maintenanceSchedule.status": VehicleStatus.AVAILABLE, // Must be operational right now!
    }).lean();
  }

  // ============================================================================
  // 3. ATOMIC FLEET STATUS MANAGEMENT
  // ============================================================================

  /**
   * Instantly alters the maintenance status profile of an asset line
   */
  static async updateMaintenanceState(
    vehicleId: string,
    newStatus: VehicleStatus,
    mechanicVisitDate?: Date,
  ): Promise<IVehicle | null> {
    logger.info(
      `🔧 [VehicleRepository] Shifting fleet maintenance state for Vehicle ${vehicleId} to: ${newStatus}`,
    );

    const updatePayload: any = {
      "maintenanceSchedule.status": newStatus,
    };

    if (mechanicVisitDate) {
      updatePayload["maintenanceSchedule.lastMechanicVisit"] =
        mechanicVisitDate;
    }

    return await Vehicle.findByIdAndUpdate(
      new Types.ObjectId(vehicleId),
      { $set: updatePayload },
      { new: true },
    );
  }
}
