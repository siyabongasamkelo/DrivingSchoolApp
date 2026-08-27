import { z } from "zod";
import { OnboardingStage, AccountStatus } from "./student.model";
import { Types } from "mongoose";

// // Helper to validate MongoDB ObjectIds string format
// const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
//   message: "Invalid database identifier format",
// });

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid database identifier format" })
  .transform((val) => new Types.ObjectId(val)); // 🚀 Magic happens here!

// 1. Nested Subdocument Schemas
export const addressValidationSchema = z.object({
  street: z.string().trim().optional(),
  suburb: z.string().trim().optional(),
  city: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
});

export const personalProfileValidationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .optional(),
  age: z
    .number()
    .int()
    .min(16, "Must be at least 16 years old to drive")
    .max(100)
    .optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  phoneNo: z.string().trim().optional(),
  emailAddress: z
    .string()
    .trim()
    .email("Invalid email format")
    .lowercase()
    .optional(),
  address: addressValidationSchema.optional(),
  disability: z.string().trim().optional(),
  image: z.string().url("Invalid profile image URL").optional(),
});

// export const coursePreferenceValidationSchema = z.object({
//   drivingCourse: z.string().trim().optional(),
//   drivingCode: z.string().trim().optional(), // e.g., "Code 8", "Code 10"
//   preferredInstructors: z.array(objectIdSchema).default([]),
//   preferredCars: z.array(objectIdSchema).default([]),
//   preferredTime: z.string().trim().optional(),
//   availability: z.string().trim().optional(),
// });

export const coursePreferenceValidationSchema = z.object({
  drivingCourse: z.string().trim().optional(),
  drivingCode: z.string().trim().optional(),
  // TypeScript now perfectly registers these arrays as Types.ObjectId[] !
  preferredInstructors: z.array(objectIdSchema).default([]),
  preferredCars: z.array(objectIdSchema).default([]),
  preferredTime: z.string().trim().optional(),
  availability: z.string().trim().optional(),
});

export const verificationDocsValidationSchema = z.object({
  idPhoto: z.string().url("Invalid ID photo URL").optional(),
  selfiePhoto: z.string().url("Invalid selfie photo URL").optional(),
});

export const progressTrackingValidationSchema = z.object({
  numberOfLessonsAvailable: z.number().int().nonnegative().default(0),
  previousSessions: z.array(objectIdSchema).default([]),
  overallScore: z.number().min(0).max(100).default(0),
  score: z.number().default(0),
});

// 2. Main Student Zod Schema
export const studentValidationSchema = z.object({
  // ✅ NEW COMPATIBLE VERSION:
  whatsappNo: z
    .string({ message: "WhatsApp number is strictly required" })
    .regex(
      /^\+[1-9]\d{1,14}$/,
      "WhatsApp number must be in valid international E.164 format (e.g., +27123456789)",
    ),

  drivingSchool: z.string().trim().optional(),
  branch: z.string().trim().optional(),
  status: z.nativeEnum(AccountStatus).default(AccountStatus.PENDING),
  isActive: z.boolean().default(true),
  interestedInEmailAdverts: z.boolean().default(false),
  hasReferredSomeone: z.boolean().default(false),
  paymentStatus: z.enum(["Unpaid", "Partially Paid", "Paid"]).default("Unpaid"),
  isAllowedToDrive: z.boolean().default(false),

  onboarding: z.object({
    stage: z.nativeEnum(OnboardingStage).default(OnboardingStage.NEW),
  }),

  profile: personalProfileValidationSchema.optional(),
  courseDetails: coursePreferenceValidationSchema.optional(),
  documents: verificationDocsValidationSchema.optional(),
  progress: progressTrackingValidationSchema.optional(),
});

// 3. Infer TypeScript types straight from Zod if needed for API requests
export type StudentInput = z.infer<typeof studentValidationSchema>;
