import { Schema, model, Document, Types } from "mongoose";

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export interface IBooking extends Document {
  drivingSchool: string;
  branch: string;
  student: Types.ObjectId;
  instructor: Types.ObjectId;
  vehicle: Types.ObjectId;
  slot: Types.ObjectId; // References the original pre-generated slot row
  date: Date;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string; // e.g., "Student needs practice with parallel parking"
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    drivingSchool: { type: String, required: true, trim: true, index: true },
    branch: { type: String, required: true, trim: true, index: true },
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
      index: true,
    },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    slot: {
      type: Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
      unique: true,
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.CONFIRMED,
      index: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  },
);

// ⚡ ADMINISTRATIVE INDEX: Fast lookups for admin dashboards tracking scheduling by date ranges
BookingSchema.index({ drivingSchool: 1, branch: 1, date: 1 });

export const Booking = model<IBooking>("Booking", BookingSchema);
