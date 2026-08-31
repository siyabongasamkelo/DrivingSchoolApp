import { Schema, model, Document, Types } from "mongoose";

// Enums to maintain strict type safety across the system
export enum EmploymentType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
}

export enum GenderType {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export interface IInstructor extends Document {
  drivingSchool: Types.ObjectId; // FK
  branch: Types.ObjectId; // FK
  assignedVehicle?: Types.ObjectId; // FK (Optional if vehicle down for service)
  currentStudents: Types.ObjectId[]; // FK Array [id, id, id]

  profile: {
    fullName: string;
    email: string;
    phoneNo: string;
    whatsAppNo: string;
    address: string;
    age: number;
    gender: GenderType;
    race?: string;
    disability?: string;
    image?: string; // Profile picture URL
  };

  licenseDetails: {
    licenseCode: string; // e.g., Code 8, Code 10, Code 14
    idNo: string; // National ID number
    yearsOfExperience: number;
  };

  employmentProfile: {
    employmentType: EmploymentType;
    workingHours: string[]; // e.g., ["08:00-09:00", "09:15-10:15"]
    rating: number;
    reviews: Types.ObjectId[]; // Array referencing a Review schema if built later
    isActive: boolean;
    isTracked: boolean; // Enables real-time GPS fleet telemetry mapping
  };

  verificationAssets: {
    idPhoto?: string; // Document image scan URL
    selfie?: string; // Liveness detection selfie URL
    biometric?: string; // Biometric metadata hash/string token
  };

  createdAt: Date;
  updatedAt: Date;
}

const InstructorSchema = new Schema<IInstructor>(
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
    assignedVehicle: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    currentStudents: [{ type: Schema.Types.ObjectId, ref: "Student" }],

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
      phoneNo: { type: String, required: true, trim: true },
      whatsAppNo: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      age: { type: Number, required: true, min: 18 },
      gender: { type: String, enum: Object.values(GenderType), required: true },
      race: { type: String, trim: true },
      disability: { type: String, trim: true },
      image: { type: String },
    },

    licenseDetails: {
      licenseCode: { type: String, required: true, trim: true },
      idNo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
      },
      yearsOfExperience: { type: Number, required: true, min: 0, default: 0 },
    },

    employmentProfile: {
      employmentType: {
        type: String,
        enum: Object.values(EmploymentType),
        default: EmploymentType.FULL_TIME,
      },
      workingHours: [{ type: String }],
      rating: { type: Number, default: 5.0, min: 0, max: 5 },
      reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
      isActive: { type: Boolean, default: true, index: true },
      isTracked: { type: Boolean, default: false },
    },

    verificationAssets: {
      idPhoto: { type: String },
      selfie: { type: String },
      biometric: { type: String },
    },
  },
  {
    timestamps: true,
  },
);

// Compound administrative index for fast operational filtering
InstructorSchema.index({
  drivingSchool: 1,
  branch: 1,
  "employmentProfile.isActive": 1,
});

export const Instructor = model<IInstructor>("Instructor", InstructorSchema);
