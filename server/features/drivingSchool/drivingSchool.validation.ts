import { z } from "zod";
import { SubscriptionTier, TenantStatus } from "./drivingSchool.model";

// Reusable database hex code parameter interceptor
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Clean regex pattern to enforce URL-safe subdomains (alphanumeric and dashes only, no spaces)
const subdomainRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createDrivingSchoolSchema = z.object({
  founder: z
    .string({ message: "Master Corporate Founder reference ID is required." })
    .regex(objectIdRegex, "Invalid founder identifier format"),

  ceoOrManager: z
    .string()
    .trim()
    .min(2, "Executive name must be at least 2 characters long")
    .optional(),

  schoolName: z
    .string({ message: "Driving School commercial name is strictly required." })
    .trim()
    .min(3, "School name must be at least 3 characters long"),

  subdomain: z
    .string({
      message: "Unique multi-tenant application subdomain is required.",
    })
    .trim()
    .lowercase()
    .min(3, "Subdomain must be at least 3 characters long")
    .regex(
      subdomainRegex,
      "Subdomain must contain only lowercase letters, numbers, and dashes (no spaces)",
    ),

  slogan: z.string().trim().optional(),

  logo: z
    .string()
    .url("Brand logo asset must be a valid file storage URL link")
    .optional(),

  businessProfile: z.object({
    registrationNumber: z
      .string({ message: "Official business registration number is required." })
      .trim()
      .toUpperCase(),
    licenseNo: z
      .string({
        message:
          "Driving school operational training license certificate number is required.",
      })
      .trim()
      .toUpperCase(),
    taxNumber: z.string().trim().optional(),
    registeredAddress: z
      .string({
        message: "Legal registered business physical address is required.",
      })
      .trim()
      .min(5, "Registered address must be highly descriptive"),
  }),

  contactDetails: z.object({
    corporateEmail: z
      .string({ message: "Official corporate inquiry email is required." })
      .trim()
      .email("Invalid business email formatting"),
    supportPhoneNo: z
      .string({
        message: "Primary customer help support telephone line is required.",
      })
      .trim()
      .min(7, "Invalid support contact number length"),
    whatsappInboundNo: z.string().trim().min(7).optional(),
    website: z
      .string()
      .url("Corporate website must be a valid URL link")
      .trim()
      .optional(),
  }),

  platformBilling: z
    .object({
      tier: z.nativeEnum(SubscriptionTier).default(SubscriptionTier.BASIC),
      status: z
        .nativeEnum(TenantStatus)
        .default(TenantStatus.PENDING_VERIFICATION),
      maxBranchesAllowed: z.number().min(1).default(1),
      maxVehiclesAllowed: z.number().min(1).default(3),
    })
    .optional(),
});

/**
 * 🛡️ REFINED PARTIAL SCHEMA FOR GRANULAR PATCH TRANSACTIONS
 * Explicitly breaks down top-level properties and unlocks sub-objects natively.
 * This completely satisfies the modern TypeScript compiler and allows micro-updates!
 */
export const updateDrivingSchoolSchema = z.object({
  founder: createDrivingSchoolSchema.shape.founder.optional(),
  ceoOrManager: createDrivingSchoolSchema.shape.ceoOrManager,
  schoolName: createDrivingSchoolSchema.shape.schoolName.optional(),
  subdomain: createDrivingSchoolSchema.shape.subdomain.optional(),
  slogan: createDrivingSchoolSchema.shape.slogan,
  logo: createDrivingSchoolSchema.shape.logo,
  businessProfile: createDrivingSchoolSchema.shape.businessProfile
    .partial()
    .optional(),
  contactDetails: createDrivingSchoolSchema.shape.contactDetails
    .partial()
    .optional(),
  platformBilling: createDrivingSchoolSchema.shape.platformBilling
    .unwrap()
    .partial()
    .optional(),
});
