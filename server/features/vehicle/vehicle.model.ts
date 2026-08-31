import { Schema, model, Document, Types } from "mongoose";

export enum TransmissionType {
  MANUAL = "MANUAL",
  AUTOMATIC = "AUTOMATIC",
}

export enum VehicleStatus {
  AVAILABLE = "AVAILABLE",
  MAINTENANCE = "MAINTENANCE",
  ACCIDENT_DAMAGE = "ACCIDENT_DAMAGE",
  DECOMMISSIONED = "DECOMMISSIONED",
}

export interface IVehicle extends Document {
  drivingSchool: Types.ObjectId; // FK to parent tenant school
  branch: Types.ObjectId; // FK to localized branch assignment hub

  vehicleName: string; // e.g., "VW Polo #3"
  plateNumber: string; // e.g., "ND 123-456"
  discNo: string; // License disc identification sequence
  licenseCode: string; // Match standard vehicle codes (e.g., Code 8, Code 10, Code 14)
  transmission: TransmissionType;

  specifications: {
    make: string; // e.g., "Volkswagen"
    modelName: string; // e.g., "Polo Vivo"
    yearOfManufacture: number;
    chassisNumber?: string;
  };

  maintenanceSchedule: {
    status: VehicleStatus;
    lastMechanicVisit?: Date;
    nextServiceDueMileage?: number;
    discExpiryDate: Date; // Vital deadline for admin compliance alerts
  };

  telemetry: {
    telemetryDeviceToken?: string; // Links up real-time hardware telemetry feeds
    currentMileage: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    drivingSchool: {
      type: Schema.Types.ObjectId,
      ref: "DrivingSchool",
      required: true,
      index: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },
    vehicleName: { type: String, required: true, trim: true },
    plateNumber: {
      type: String,
      required: true,
      unique: true, // No two vehicles can share a registration plate number string
      trim: true,
      toUpperCase: true,
      index: true,
    },
    discNo: { type: String, required: true, unique: true, trim: true },
    licenseCode: {
      type: String,
      required: true,
      trim: true,
      toUpperCase: true,
    },
    transmission: {
      type: String,
      enum: Object.values(TransmissionType),
      required: true,
    },

    specifications: {
      make: { type: String, required: true, trim: true },
      modelName: { type: String, required: true, trim: true },
      yearOfManufacture: { type: Number, required: true, min: 1990 },
      chassisNumber: { type: String, trim: true, toUpperCase: true },
    },

    maintenanceSchedule: {
      status: {
        type: String,
        enum: Object.values(VehicleStatus),
        default: VehicleStatus.AVAILABLE,
        index: true,
      },
      lastMechanicVisit: { type: Date },
      nextServiceDueMileage: { type: Number },
      discExpiryDate: { type: Date, required: true },
    },

    telemetry: {
      telemetryDeviceToken: { type: String, trim: true },
      currentMileage: { type: Number, default: 0, min: 0 },
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for quick operational querying during lesson allocations
VehicleSchema.index({
  branch: 1,
  "maintenanceSchedule.status": 1,
  licenseCode: 1,
});

export const Vehicle = model<IVehicle>("Vehicle", VehicleSchema);
