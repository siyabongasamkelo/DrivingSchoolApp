import { Schema, model, Document, Types } from "mongoose";

// Enums to maintain strict type safety across the administrative layer
export enum AccountStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
}

export enum GenderType {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export interface IFounder extends Document {
  drivingSchool: Types.ObjectId; // The primary enterprise school they own
  managedBranches: Types.ObjectId[]; // Array of branch links under their control

  profile: {
    fullName: string;
    email: string;
    contactNo: string;
    whatsAppNo: string;
    address: string;
    gender: GenderType;
    image?: string; // Profile avatar URL
  };

  verificationAssets: {
    idPhoto?: string; // National ID scan URL
    businessRegistrationDoc?: string; // Business setup proof URL
  };

  administrativeControl: {
    accountStatus: AccountStatus;
    isMasterFounder: boolean; // True if they are the primary owner/payer
  };

  createdAt: Date;
  updatedAt: Date;
}

const FounderSchema = new Schema<IFounder>(
  {
    drivingSchool: {
      type: Schema.Types.ObjectId,
      ref: "DrivingSchool",
      required: true,
      unique: true, // A driving school can only have one master owner line mapped here
      index: true,
    },
    managedBranches: [
      {
        type: Schema.Types.ObjectId,
        ref: "Branch",
      },
    ],

    profile: {
      fullName: { type: String, required: true, trim: true },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
      },
      contactNo: { type: String, required: true, trim: true },
      whatsAppNo: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      gender: { type: String, enum: Object.values(GenderType), required: true },
      image: { type: String },
    },

    verificationAssets: {
      idPhoto: { type: String },
      businessRegistrationDoc: { type: String },
    },

    administrativeControl: {
      accountStatus: {
        type: String,
        enum: Object.values(AccountStatus),
        default: AccountStatus.PENDING_VERIFICATION,
        index: true,
      },
      isMasterFounder: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for quick dashboard security lookups
FounderSchema.index({
  "profile.email": 1,
  "administrativeControl.accountStatus": 1,
});

export const Founder = model<IFounder>("Founder", FounderSchema);
