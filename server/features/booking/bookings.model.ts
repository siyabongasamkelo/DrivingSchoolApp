import { Schema, model, Document, Types } from "mongoose";

// 1. Define Enums for Strict Typing
export enum OnboardingStage {
  NEW = "NEW",
  AWAITING_NAME = "AWAITING_NAME",
  AWAITING_COURSE = "AWAITING_COURSE",
  AWAITING_DOCUMENTS = "AWAITING_DOCUMENTS",
  AWAITING_PAYMENT = "AWAITING_PAYMENT",
  COMPLETED = "COMPLETED",
}

export enum AccountStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

// 2. Define the TypeScript Interface for the Student Document
export interface IStudent extends Document {
  fullName?: string;
  address?: {
    street?: string;
    suburb?: string;
    city?: string;
    postalCode?: string;
  };
  phoneNo?: string;
  emailAddress?: string;
  drivingCourse?: string;
  drivingCode?: string; // e.g., Code 8, Code 10, Code 14
  preferredInstructors: Types.ObjectId[]; // References Instructor Model
  preferredCars: Types.ObjectId[]; // References Vehicle/Car Model
  gender?: "Male" | "Female" | "Other";
  interestedInEmailAdverts: boolean;
  whatsappNo: string; // 🔑 Primary lookup key for the WhatsApp Webhook
  onboardingStage: OnboardingStage; // Tracks current bot conversation position
  availability?: string; // e.g., "Weekends", "Mornings"
  disability?: string;
  paymentStatus: "Unpaid" | "Partially Paid" | "Paid";
  isAllowedToDrive: boolean; // Managed by admin after verification & payment
  numberOfLessonsAvailable: number; // Decrements when they book a slot
  previousSessions: Types.ObjectId[]; // References past Bookings/Lessons
  overallScore: number;
  hasReferredSomeone: boolean;
  preferredTime?: string;
  age?: number;
  image?: string; // Profile image url
  idPhoto?: string; // Verification document url from WhatsApp image payload
  selfiePhoto?: string; // Verification selfie url
  isActive: boolean;
  score: number;
  drivingSchool?: string;
  branch?: string;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

// 3. Define the Mongoose Schema matching the Interface
const StudentSchema = new Schema<IStudent>(
  {
    fullName: { type: String, trim: true },
    address: {
      street: { type: String },
      suburb: { type: String },
      city: { type: String },
      postalCode: { type: String },
    },
    phoneNo: { type: String },
    emailAddress: { type: String, lowercase: true, trim: true },
    drivingCourse: { type: String },
    drivingCode: { type: String },
    preferredInstructors: [
      { type: Schema.Types.ObjectId, ref: "Instructor", default: [] },
    ],
    preferredCars: [
      { type: Schema.Types.ObjectId, ref: "Vehicle", default: [] },
    ],
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    interestedInEmailAdverts: { type: Boolean, default: false },
    whatsappNo: { type: String, required: true, unique: true, index: true }, // Highly optimized for bot queries
    onboardingStage: {
      type: String,
      enum: Object.values(OnboardingStage),
      default: OnboardingStage.NEW,
    },
    availability: { type: String },
    disability: { type: String },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partially Paid", "Paid"],
      default: "Unpaid",
    },
    isAllowedToDrive: { type: Boolean, default: false },
    numberOfLessonsAvailable: { type: Number, default: 0 },
    previousSessions: [
      { type: Schema.Types.ObjectId, ref: "Booking", default: [] },
    ],
    overallScore: { type: Number, default: 0 },
    hasReferredSomeone: { type: Boolean, default: false },
    preferredTime: { type: String },
    age: { type: Number },
    image: { type: String },
    idPhoto: { type: String },
    selfiePhoto: { type: String },
    isActive: { type: Boolean, default: true },
    score: { type: Number, default: 0 },
    drivingSchool: { type: String },
    branch: { type: String },
    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.PENDING,
    },
  },
  {
    timestamps: true, // Automatically creates and manages createdAt & updatedAt fields
  },
);

// 4. Export the Model
export const Student = model<IStudent>("Student", StudentSchema);
