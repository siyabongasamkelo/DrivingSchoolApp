import { Schema, model, Document, Types } from "mongoose";

// --- ENUMS ---
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

// --- SUBDOCUMENT INTERFACES ---
interface IAddress {
  street?: string;
  suburb?: string;
  city?: string;
  postalCode?: string;
}

interface IPersonalProfile {
  fullName?: string;
  age?: number;
  gender?: "Male" | "Female" | "Other";
  phoneNo?: string;
  emailAddress?: string;
  address?: IAddress;
  disability?: string;
  image?: string;
}

interface ICoursePreference {
  drivingCourse?: string;
  drivingCode?: string; // e.g., Code 8, Code 10, Code 14
  preferredInstructors: Types.ObjectId[];
  preferredCars: Types.ObjectId[];
  preferredTime?: string;
  availability?: string; // e.g., "Weekends", "Mornings"
}

interface IVerificationDocs {
  idPhoto?: string;
  selfiePhoto?: string;
}

interface IProgressTracking {
  numberOfLessonsAvailable: number;
  previousSessions: Types.ObjectId[];
  overallScore: number;
  score: number;
}

// --- MAIN STUDENT INTERFACE ---
export interface IStudent extends Document {
  whatsappNo: string; // 🔑 The main WhatsApp query key
  drivingSchool?: string;
  branch?: string;
  status: AccountStatus;
  isActive: boolean;
  interestedInEmailAdverts: boolean;
  hasReferredSomeone: boolean;

  // Isolated Subdocuments
  onboarding: {
    stage: OnboardingStage;
  };
  profile: IPersonalProfile;
  courseDetails: ICoursePreference;
  documents: IVerificationDocs;
  progress: IProgressTracking;
  paymentStatus: "Unpaid" | "Partially Paid" | "Paid";
  isAllowedToDrive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// --- MONGOOSE SCHEMAS ---

const AddressSchema = new Schema<IAddress>(
  {
    street: String,
    suburb: String,
    city: String,
    postalCode: String,
  },
  { _id: false },
);

const PersonalProfileSchema = new Schema<IPersonalProfile>(
  {
    fullName: { type: String, trim: true },
    age: Number,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    phoneNo: String,
    emailAddress: { type: String, lowercase: true, trim: true },
    address: AddressSchema,
    disability: String,
    image: String,
  },
  { _id: false },
);

const CoursePreferenceSchema = new Schema<ICoursePreference>(
  {
    drivingCourse: String,
    drivingCode: String,
    preferredInstructors: [
      { type: Schema.Types.ObjectId, ref: "Instructor", default: [] },
    ],
    preferredCars: [
      { type: Schema.Types.ObjectId, ref: "Vehicle", default: [] },
    ],
    preferredTime: String,
    availability: String,
  },
  { _id: false },
);

const VerificationDocsSchema = new Schema<IVerificationDocs>(
  {
    idPhoto: String,
    selfiePhoto: String,
  },
  { _id: false },
);

const ProgressTrackingSchema = new Schema<IProgressTracking>(
  {
    numberOfLessonsAvailable: { type: Number, default: 0 },
    previousSessions: [
      { type: Schema.Types.ObjectId, ref: "Booking", default: [] },
    ],
    overallScore: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
  },
  { _id: false },
);

// --- MAIN SCHEMA ---
const StudentSchema = new Schema<IStudent>(
  {
    whatsappNo: { type: String, required: true, unique: true, index: true }, // 🚀 Primary Performance Index
    drivingSchool: String,
    branch: String,
    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.PENDING,
      index: true,
    }, // ⚡ Performance Index
    isActive: { type: Boolean, default: true },
    interestedInEmailAdverts: { type: Boolean, default: false },
    hasReferredSomeone: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partially Paid", "Paid"],
      default: "Unpaid",
    },
    isAllowedToDrive: { type: Boolean, default: false },

    onboarding: {
      stage: {
        type: String,
        enum: Object.values(OnboardingStage),
        default: OnboardingStage.NEW,
        index: true, // ⚡ Performance Index
      },
    },
    profile: PersonalProfileSchema,
    courseDetails: CoursePreferenceSchema,
    documents: VerificationDocsSchema,
    progress: ProgressTrackingSchema,
  },
  {
    timestamps: true,
  },
);

export const Student = model<IStudent>("Student", StudentSchema);
