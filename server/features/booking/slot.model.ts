import { Schema, model, Document, Types } from "mongoose";

export interface ISlot extends Document {
  drivingSchool: string; // 🏢 Multi-tenant tenant separator
  branch: string; // 📍 Local sub-tenant locator
  instructor: Types.ObjectId;
  vehicle: Types.ObjectId;
  date: Date; // Stored as YYYY-MM-DD at midnight for clean parsing
  startTime: string; // e.g., "08:00"
  endTime: string; // e.g., "09:00"
  isBooked: boolean;
  bookedBy: Types.ObjectId | null; // Links to Student ID if claimed
  bookingRef: Types.ObjectId | null; // Links to finalized Booking receipt
  createdAt: Date;
  updatedAt: Date;
}

const SlotSchema = new Schema<ISlot>(
  {
    drivingSchool: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    bookedBy: { type: Schema.Types.ObjectId, ref: "Student", default: null },
    bookingRef: { type: Schema.Types.ObjectId, ref: "Booking", default: null },
  },
  {
    timestamps: true,
  },
);

// ⚡ PERFORMANCE CHAMPION: Compound index for ultra-fast WhatsApp Bot availability menus
SlotSchema.index({ drivingSchool: 1, branch: 1, date: 1, isBooked: 1 });

// 🛡️ SECURITY INDEX: Prevents the background cron engine from accidentally double-seeding the same slot
SlotSchema.index(
  { drivingSchool: 1, branch: 1, instructor: 1, date: 1, startTime: 1 },
  { unique: true },
);

export const Slot = model<ISlot>("Slot", SlotSchema);
