import { z } from "zod";

// Reusable database hex code parameter interceptor
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Standard operating hours matcher (matches "08:00 - 17:00" formats or "Closed")
const hourStringRegex = /^(\d{2}:\d{2}\s*-\s*\d{2}:\d{2})|([Cc]losed)$/;

export const createBranchSchema = z.object({
  drivingSchool: z
    .string({ message: "Master Driving School ID context token is required." })
    .regex(objectIdRegex, "Invalid driving school identifier format"),

  manager: z
    .string()
    .regex(objectIdRegex, "Invalid manager profile identifier format")
    .optional(),

  branchName: z
    .string({ message: "Branch location name is strictly required." })
    .trim()
    .min(3, "Branch name must be at least 3 characters long"),

  branchNo: z
    .string({
      message: "Internal operational branch sequence number is required.",
    })
    .trim(),

  branchCode: z
    .string({ message: "Unique system operational branch code is required." })
    .trim()
    .min(2, "Branch code must be at least 2 characters long")
    .toUpperCase(),

  contactDetails: z.object({
    email: z
      .string({ message: "Branch public inquiry email is required." })
      .trim()
      .email("Invalid branch email format"),
    contactNo: z
      .string({
        message: "Branch primary communication telephone number is required.",
      })
      .trim()
      .min(7, "Invalid phone number length"),
    website: z
      .string()
      .url("Website must be a valid URL link")
      .trim()
      .optional(),
    address: z
      .string({ message: "Physical deployment address is required." })
      .trim()
      .min(5, "Address details must be comprehensive"),
    coordinates: z
      .object({
        lat: z.number({ message: "Latitude must be a numerical variable" }),
        lng: z.number({ message: "Longitude must be a numerical variable" }),
      })
      .optional(),
  }),

  brandingAssets: z
    .object({
      image: z
        .string()
        .url("Location image must be a valid file link asset")
        .optional(),
      logo: z
        .string()
        .url("Branch asset variation logo must be a valid file link")
        .optional(),
    })
    .optional(),

  operationalMetrics: z
    .object({
      rating: z.number().min(0).max(5).optional().default(5.0),
      availableCourses: z.array(z.string()).optional().default([]),
      isActive: z.boolean().optional().default(true),
    })
    .optional(),

  operatingHours: z
    .object({
      mondayToFriday: z
        .string()
        .regex(
          hourStringRegex,
          "Invalid time format. Use 'HH:MM - HH:MM' or 'Closed'",
        )
        .default("08:00 - 17:00"),
      saturday: z
        .string()
        .regex(
          hourStringRegex,
          "Invalid time format. Use 'HH:MM - HH:MM' or 'Closed'",
        )
        .default("08:00 - 13:00"),
      sunday: z
        .string()
        .regex(
          hourStringRegex,
          "Invalid time format. Use 'HH:MM - HH:MM' or 'Closed'",
        )
        .default("Closed"),
    })
    .optional(),
});

/**
 * 🛡️ REFINED PARTIAL SCHEMA FOR GRANULAR BRANCH MODIFICATIONS
 * Explicitly breaks down sub-objects via native Zod bindings to bypass structural type errors.
 */
export const updateBranchSchema = z.object({
  drivingSchool: createBranchSchema.shape.drivingSchool.optional(),
  manager: createBranchSchema.shape.manager.optional(),
  branchName: createBranchSchema.shape.branchName.optional(),
  branchNo: createBranchSchema.shape.branchNo.optional(),
  branchCode: createBranchSchema.shape.branchCode.optional(),
  contactDetails: createBranchSchema.shape.contactDetails.partial().optional(),
  brandingAssets: createBranchSchema.shape.brandingAssets
    .unwrap()
    .partial()
    .optional(),
  operationalMetrics: createBranchSchema.shape.operationalMetrics
    .unwrap()
    .partial()
    .optional(),
  operatingHours: createBranchSchema.shape.operatingHours
    .unwrap()
    .partial()
    .optional(),
});
