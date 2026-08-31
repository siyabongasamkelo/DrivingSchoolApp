import { Schema, model, Document, Types } from "mongoose";

export interface IBranch extends Document {
  drivingSchool: Types.ObjectId; // FK to parent Driving School enterprise tenant
  manager?: Types.ObjectId; // FK to a Founder, Admin, or Senior Instructor

  branchName: string;
  slug: string; // URL-friendly lookup string (e.g., "johannesburg-central")
  branchNo: string; // System internal sequential number or label
  branchCode: string; // Operational code name (e.g., JHB-01)

  contactDetails: {
    email: string;
    contactNo: string;
    website?: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };

  brandingAssets: {
    image?: string; // Main branch location photo URL
    logo?: string; // Localized branch variation logo URL
  };

  operationalMetrics: {
    rating: number;
    availableCourses: string[]; // e.g., ["Code 8", "Code 14", "K53 Theory"]
    isActive: boolean;
  };

  operatingHours: {
    mondayToFriday: string; // e.g., "08:00 - 17:00"
    saturday?: string; // e.g., "08:00 - 13:00"
    sunday?: string; // e.g., "Closed"
  };

  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    drivingSchool: {
      type: Schema.Types.ObjectId,
      ref: "DrivingSchool",
      required: true,
      index: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "Instructor", // Can point to Instructor or User model depending on auth roles
    },
    branchName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    branchNo: {
      type: String,
      required: true,
      trim: true,
    },
    branchCode: {
      type: String,
      required: true,
      unique: true, // Guarantees global uniqueness across corporate operations
      trim: true,
      toUpperCase: true,
      index: true,
    },

    contactDetails: {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      contactNo: { type: String, required: true, trim: true },
      website: { type: String, trim: true },
      address: { type: String, required: true, trim: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    brandingAssets: {
      image: { type: String },
      logo: { type: String },
    },

    operationalMetrics: {
      rating: { type: Number, default: 5.0, min: 0, max: 5 },
      availableCourses: [{ type: String }],
      isActive: { type: Boolean, default: true, index: true },
    },

    operatingHours: {
      mondayToFriday: { type: String, default: "08:00 - 17:00" },
      saturday: { type: String, default: "08:00 - 13:00" },
      sunday: { type: String, default: "Closed" },
    },
  },
  {
    timestamps: true,
  },
);

// Compound administrative query index for listing active branches under a tenant school instantly
BranchSchema.index({ drivingSchool: 1, "operationalMetrics.isActive": 1 });

export const Branch = model<IBranch>("Branch", BranchSchema);
