import { Schema, model, Document, Types } from "mongoose";

export enum SubscriptionTier {
  BASIC = "BASIC",
  PREMIUM = "PREMIUM",
  ENTERPRISE = "ENTERPRISE",
}

export enum TenantStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
}

export interface IDrivingSchool extends Document {
  founder: Types.ObjectId; // FK to Founder model (the master account holder)
  ceoOrManager?: string; // Explicit name of the current operating executive

  schoolName: string;
  subdomain: string; // URL identifier (e.g., "apex-academy")
  slogan?: string;
  logo?: string; // Main brand logo file URL link

  businessProfile: {
    registrationNumber: string; // Official corporate legal registration code
    licenseNo: string; // Driving school operator certificate/permit number
    taxNumber?: string;
    registeredAddress: string;
  };

  contactDetails: {
    corporateEmail: string;
    supportPhoneNo: string;
    whatsappInboundNo?: string;
    website?: string;
  };

  platformBilling: {
    tier: SubscriptionTier;
    status: TenantStatus;
    maxBranchesAllowed: number;
    maxVehiclesAllowed: number;
  };

  metrics: {
    globalRating: number;
    totalBranchesCount: number;
    totalInstructorsCount: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const DrivingSchoolSchema = new Schema<IDrivingSchool>(
  {
    founder: {
      type: Schema.Types.ObjectId,
      ref: "Founder",
      required: true,
      index: true,
    },
    ceoOrManager: { type: String, trim: true },
    schoolName: { type: String, required: true, trim: true },
    subdomain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    slogan: { type: String, trim: true },
    logo: { type: String },

    businessProfile: {
      registrationNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      licenseNo: { type: String, required: true, unique: true, trim: true },
      taxNumber: { type: String, trim: true },
      registeredAddress: { type: String, required: true, trim: true },
    },

    contactDetails: {
      corporateEmail: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
      },
      supportPhoneNo: { type: String, required: true, trim: true },
      whatsappInboundNo: { type: String, trim: true },
      website: { type: String, trim: true },
    },

    platformBilling: {
      tier: {
        type: String,
        enum: Object.values(SubscriptionTier),
        default: SubscriptionTier.BASIC,
      },
      status: {
        type: String,
        enum: Object.values(TenantStatus),
        default: TenantStatus.PENDING_VERIFICATION,
        index: true,
      },
      maxBranchesAllowed: { type: Number, default: 1 },
      maxVehiclesAllowed: { type: Number, default: 3 },
    },

    metrics: {
      globalRating: { type: Number, default: 5.0, min: 0, max: 5 },
      totalBranchesCount: { type: Number, default: 0 },
      totalInstructorsCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for rapid performance scanning on general directory indexes
DrivingSchoolSchema.index({ "platformBilling.status": 1, schoolName: 1 });

export const DrivingSchool = model<IDrivingSchool>(
  "DrivingSchool",
  DrivingSchoolSchema,
);
