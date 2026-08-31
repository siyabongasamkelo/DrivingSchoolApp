import { z } from "zod";
import { EmploymentType, GenderType } from "./instructor.model";

// Reusable database hex code parameter interceptor
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createInstructorSchema = z.object({
  drivingSchool: z
    .string({ message: "Driving School ID token link is required." })
    .regex(objectIdRegex, "Invalid school identifier format"),
  branch: z
    .string({ message: "Branch target allocation reference is required." })
    .regex(objectIdRegex, "Invalid branch identifier format"),
  assignedVehicle: z
    .string()
    .regex(objectIdRegex, "Invalid vehicle identifier format")
    .optional(),

  profile: z.object({
    fullName: z
      .string({ message: "Full name is strictly required." })
      .trim()
      .min(2, "Name must be at least 2 characters long"),
    email: z
      .string({ message: "Email is required." })
      .trim()
      .email("Invalid email address formatting"),
    phoneNo: z
      .string({ message: "Primary contact phone number is required." })
      .trim()
      .min(7, "Invalid phone number length"),
    whatsAppNo: z
      .string({
        message: "WhatsApp conversational channel number is required.",
      })
      .trim()
      .min(7),
    address: z
      .string({ message: "Residential deployment address field is required." })
      .trim()
      .min(5),
    age: z
      .number({ message: "Age must be provided as a number." })
      .min(18, "Instructors must be at least 18 years old"),
    gender: z.nativeEnum(GenderType, {
      message: "Gender must be MALE, FEMALE, or OTHER",
    }),
    race: z.string().trim().optional(),
    disability: z.string().trim().optional(),
    image: z
      .string()
      .url("Profile image must be a valid document file URL link")
      .optional(),
  }),

  licenseDetails: z.object({
    licenseCode: z
      .string({ message: "License classification code is required." })
      .trim()
      .toUpperCase(),
    idNo: z
      .string({ message: "National Identification Number asset is required." })
      .trim()
      .min(5, "Invalid ID number length"),
    yearsOfExperience: z
      .number()
      .min(0, "Years of experience cannot be negative value")
      .default(0),
  }),

  employmentProfile: z
    .object({
      employmentType: z
        .nativeEnum(EmploymentType)
        .default(EmploymentType.FULL_TIME),
      workingHours: z.array(z.string()).optional().default([]),
      rating: z.number().min(0).max(5).optional().default(5.0),
      isActive: z.boolean().optional().default(true),
      isTracked: z.boolean().optional().default(false),
    })
    .optional(),

  verificationAssets: z
    .object({
      idPhoto: z
        .string()
        .url("ID photo asset link must be a valid URL")
        .optional(),
      selfie: z
        .string()
        .url("Liveness verification selfie must be a valid URL")
        .optional(),
      biometric: z.string().optional(),
    })
    .optional(),
});

// Partial update schema to handle adjustments on active lines safely
export const updateInstructorSchema = createInstructorSchema.partial();
