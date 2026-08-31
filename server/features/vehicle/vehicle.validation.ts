import { z } from "zod";
import { TransmissionType, VehicleStatus } from "./vehicle.model";

// Reusable database hex code parameter interceptor
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createVehicleSchema = z.object({
  drivingSchool: z
    .string({ message: "Master Driving School ID context token is required." })
    .regex(objectIdRegex, "Invalid driving school identifier format"),

  branch: z
    .string({
      message: "Localized branch target allocation reference is required.",
    })
    .regex(objectIdRegex, "Invalid branch identifier format"),

  vehicleName: z
    .string({ message: "Vehicle tracking operational name is required." })
    .trim()
    .min(2, "Vehicle name must be at least 2 characters long"),

  plateNumber: z
    .string({
      message: "Vehicle official registration plate number is required.",
    })
    .trim()
    .toUpperCase()
    .min(4, "Invalid license plate length"),

  discNo: z
    .string({
      message:
        "Vehicle licensing disc identification sequence number is required.",
    })
    .trim(),

  licenseCode: z
    .string({
      message:
        "Vehicle classification code training license target is required.",
    })
    .trim()
    .toUpperCase(),

  transmission: z.nativeEnum(TransmissionType, {
    message: "Transmission configuration must be MANUAL or AUTOMATIC",
  }),

  specifications: z.object({
    make: z
      .string({ message: "Vehicle manufacturer brand make is required." })
      .trim(),
    modelName: z
      .string({ message: "Vehicle commercial model line name is required." })
      .trim(),
    yearOfManufacture: z
      .number({
        message: "Year of manufacture must be provided as a number value.",
      })
      .min(
        1990,
        "Vehicles manufactured before 1990 are ineligible for official training rosters",
      )
      .max(
        new Date().getFullYear() + 1,
        "Year of manufacture cannot represent a fantasy future timeline",
      ),
    chassisNumber: z.string().trim().toUpperCase().optional(),
  }),

  maintenanceSchedule: z.object({
    status: z.nativeEnum(VehicleStatus).default(VehicleStatus.AVAILABLE),
    lastMechanicVisit: z
      .string()
      .datetime({
        message: "Last mechanic visit must match an official ISO string format",
      })
      .pipe(z.coerce.date())
      .optional(),
    nextServiceDueMileage: z
      .number()
      .min(0, "Service mileage targets cannot scale below zero thresholds")
      .optional(),
    discExpiryDate: z
      .string({
        message: "Vehicle license disc expiry deadline date is required.",
      })
      .datetime({
        message:
          "Disc expiry deadline must represent a clean ISO date format string",
      })
      .pipe(z.coerce.date()),
  }),

  telemetry: z
    .object({
      telemetryDeviceToken: z.string().trim().optional(),
      currentMileage: z.number().min(0).default(0),
    })
    .optional(),
});

/**
 * 🛡️ REFINED PARTIAL SCHEMA FOR GRANULAR FLEET ADJUSTMENTS
 * Explicitly breaks out top-level fields and targets inner nested properties.
 * This completely prevents TypeScript validation crashes on partial payload patches!
 */
export const updateVehicleSchema = z.object({
  drivingSchool: createVehicleSchema.shape.drivingSchool.optional(),
  branch: createVehicleSchema.shape.branch.optional(),
  vehicleName: createVehicleSchema.shape.vehicleName.optional(),
  plateNumber: createVehicleSchema.shape.plateNumber.optional(),
  discNo: createVehicleSchema.shape.discNo.optional(),
  licenseCode: createVehicleSchema.shape.licenseCode.optional(),
  transmission: createVehicleSchema.shape.transmission.optional(),
  specifications: createVehicleSchema.shape.specifications.partial().optional(),
  maintenanceSchedule: createVehicleSchema.shape.maintenanceSchedule
    .partial()
    .optional(),
  telemetry: createVehicleSchema.shape.telemetry.unwrap().partial().optional(),
});
