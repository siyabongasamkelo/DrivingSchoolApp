import { IVehicle } from "./vehicle.model";

// Strict contract shape for what goes over the public/private network wire
export interface ISafeVehicleResponse {
  id: string;
  drivingSchoolId: string;
  branchId: string;
  vehicleName: string;
  plateNumber: string;
  discNo: string;
  licenseCode: string;
  transmission: string;
  specifications: {
    make: string;
    modelName: string;
    yearOfManufacture: number;
  };
  maintenanceSchedule: {
    status: string;
    lastMechanicVisit?: Date;
    nextServiceDueMileage?: number;
    discExpiryDate: Date;
  };
  telemetry: {
    currentMileage: number;
  };
  createdAt: Date;
}

export class VehicleAdapter {
  /**
   * 🛡️ TRANSFORMATION GUARD: Cleanses a raw vehicle database document
   * into a highly secure, network-safe object, stripping away telemetry hardware tokens.
   */
  static transformToSafeResponse(doc: IVehicle): ISafeVehicleResponse {
    // Handle both hydrated Mongoose documents and lean raw JSON objects smoothly
    const raw = typeof doc.toObject === "function" ? doc.toObject() : doc;

    return {
      id: String(raw._id),
      drivingSchoolId: String(raw.drivingSchool?._id || raw.drivingSchool),
      branchId: String(raw.branch?._id || raw.branch),
      vehicleName: raw.vehicleName || "",
      plateNumber: raw.plateNumber || "",
      discNo: raw.discNo || "",
      licenseCode: raw.licenseCode || "",
      transmission: raw.transmission || "MANUAL",
      specifications: {
        make: raw.specifications?.make || "",
        modelName: raw.specifications?.modelName || "",
        yearOfManufacture:
          raw.specifications?.yearOfManufacture || new Date().getFullYear(),
      },
      maintenanceSchedule: {
        status: raw.maintenanceSchedule?.status || "AVAILABLE",
        lastMechanicVisit: raw.maintenanceSchedule?.lastMechanicVisit,
        nextServiceDueMileage: raw.maintenanceSchedule?.nextServiceDueMileage,
        discExpiryDate: raw.maintenanceSchedule?.discExpiryDate,
      },
      telemetry: {
        currentMileage: raw.telemetry?.currentMileage || 0,
      },
      createdAt: raw.createdAt,
    };
  }

  /**
   * Bulk-maps arrays of vehicle records safely for local branch fleet index lists
   */
  static transformList(docs: IVehicle[]): ISafeVehicleResponse[] {
    if (!docs || !Array.isArray(docs)) return [];
    return docs.map((doc) => this.transformToSafeResponse(doc));
  }
}
