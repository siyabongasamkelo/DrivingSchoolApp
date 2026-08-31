import { z } from "zod";
import { GenderType, AccountStatus } from "./founder.model";

// Reusable database hex code parameter interceptor
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createFounderSchema = z.object({
  drivingSchool: z
    .string({ message: "Master Driving School ID link is strictly required." })
    .regex(objectIdRegex, "Invalid driving school identifier format"),

  managedBranches: z
    .array(z.string().regex(objectIdRegex, "Invalid branch identifier format"))
    .optional()
    .default([]),

  profile: z.object({
    fullName: z
      .string({ message: "Founder full name is required." })
      .trim()
      .min(2, "Name must be at least 2 characters long"),
    email: z
      .string({ message: "Founder login email account is required." })
      .trim()
      .email("Invalid email address formatting"),
    contactNo: z
      .string({ message: "Primary contact phone number is required." })
      .trim()
      .min(7, "Invalid contact number length"),
    whatsAppNo: z
      .string({ message: "WhatsApp notification channel number is required." })
      .trim()
      .min(7, "Invalid WhatsApp number length"),
    address: z
      .string({ message: "Residential/Corporate address field is required." })
      .trim()
      .min(5, "Address must be at least 5 characters long"),
    gender: z.nativeEnum(GenderType, {
      message: "Gender configuration must be MALE, FEMALE, or OTHER",
    }),
    image: z
      .string()
      .url("Profile image must be a valid document file URL link")
      .optional(),
  }),

  verificationAssets: z
    .object({
      idPhoto: z
        .string()
        .url("National ID photo asset must be a valid URL")
        .optional(),
      businessRegistrationDoc: z
        .string()
        .url("Business registration document must be a valid URL")
        .optional(),
    })
    .optional(),

  administrativeControl: z
    .object({
      accountStatus: z
        .nativeEnum(AccountStatus)
        .default(AccountStatus.PENDING_VERIFICATION),
      isMasterFounder: z.boolean().optional().default(true),
    })
    .optional(),
});

/**
 * 🛡️ REFINED PARTIAL SCHEMA FOR GRANULAR UPDATES
 * We break down the top-level keys and explicitly call .partial() on the nested objects.
 * This satisfies the TypeScript compiler perfectly and lets you update just one nested field!
 */
export const updateFounderSchema = z.object({
  drivingSchool: createFounderSchema.shape.drivingSchool.optional(),
  managedBranches: createFounderSchema.shape.managedBranches.optional(),
  profile: createFounderSchema.shape.profile.partial().optional(),
  verificationAssets: createFounderSchema.shape.verificationAssets
    .unwrap()
    .partial()
    .optional(),
  administrativeControl: createFounderSchema.shape.administrativeControl
    .unwrap()
    .partial()
    .optional(),
});
