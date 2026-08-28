import { z } from "zod";
import { Types } from "mongoose";

// 🚀 Re-using your exact reusable MongoDB ObjectId transformation magic!
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid database identifier format" })
  .transform((val) => new Types.ObjectId(val));

// ==========================================
// 1. ADMIN MANUAL BOOKING VALIDATION
// ==========================================
export const adminBookingSchema = z.object({
  drivingSchool: z
    .string({ message: "Driving school tenant brand name is required." })
    .trim()
    .min(2, "School name must be at least 2 characters"),

  branch: z
    .string({ message: "Branch location identity string is required." })
    .trim()
    .min(2, "Branch name must be at least 2 characters"),

  student: z.string({
    message: "Target student identification token is required.",
  }), // Handled cleanly via your string parameter interceptor down the line

  slot: z.string({
    message: "Pre-generated inventory slot token is required.",
  }),

  notes: z.string().trim().optional(),
});

// ==========================================
// 2. BOT: VACANT SLOT LOOKUP VALIDATION
// ==========================================
export const botSlotLookupSchema = z.object({
  drivingSchool: z
    .string({
      message: "Driving school identifier is required for bot routing.",
    })
    .trim(),

  branch: z
    .string({
      message: "Branch location is required to map available calendar spaces.",
    })
    .trim(),

  targetDate: z
    .string({ message: "Target date string is required (Format: YYYY-MM-DD)." })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Date must strictly match YYYY-MM-DD formatting conventions.",
    ),
});

// ==========================================
// 3. BOT: INLINE SELECTION RESERVATION VALIDATION
// ==========================================
export const botReserveSchema = z.object({
  drivingSchool: z.string({ message: "Driving school context is required." }),
  branch: z.string({ message: "Local branch allocation context is required." }),

  studentId: z.string({
    message: "Student identity token is required to assign inventory slots.",
  }),

  targetSlotId: z.string({
    message: "Target slot identity token is required to execute inline locks.",
  }),
});
