import { IInstructor } from "./instructor.model";

// Define clear, strict contract shapes for what goes over the wire
export interface ISafeInstructorResponse {
  id: string;
  fullName: string;
  email: string;
  phoneNo: string;
  whatsAppNo: string;
  gender: string;
  image?: string;
  licenseCode: string;
  yearsOfExperience: number;
  employmentType: string;
  workingHours: string[];
  rating: number;
  isActive: boolean;
  isTracked: boolean;
  assignedVehicle?: {
    id: string;
    make: string;
    modelName: string;
    plateNumber: string;
  } | null;
}

export class InstructorAdapter {
  /**
   * 🛡️ TRANSFORMATION GUARD: Cleanses a single database document into a highly secure,
   * network-safe object, stripping out critical elements like national ID numbers and biometrics.
   */
  static transformToSafeResponse(doc: IInstructor): ISafeInstructorResponse {
    // If the document is using .lean(), we access properties directly.
    // If it's a full Mongoose document, we convert it cleanly.
    const raw = typeof doc.toObject === "function" ? doc.toObject() : doc;

    return {
      id: String(raw._id),
      fullName: raw.profile?.fullName || "",
      email: raw.profile?.email || "",
      phoneNo: raw.profile?.phoneNo || "",
      whatsAppNo: raw.profile?.whatsAppNo || "",
      gender: raw.profile?.gender || "",
      image: raw.profile?.image,
      licenseCode: raw.licenseDetails?.licenseCode || "",
      yearsOfExperience: raw.licenseDetails?.yearsOfExperience || 0,
      employmentType: raw.employmentProfile?.employmentType || "FULL_TIME",
      workingHours: raw.employmentProfile?.workingHours || [],
      rating: raw.employmentProfile?.rating || 5.0,
      isActive: raw.employmentProfile?.isActive ?? true,
      isTracked: raw.employmentProfile?.isTracked ?? false,
      assignedVehicle:
        raw.assignedVehicle &&
        typeof raw.assignedVehicle === "object" &&
        "_id" in raw.assignedVehicle
          ? {
              id: String((raw.assignedVehicle as any)._id),
              make: (raw.assignedVehicle as any).make || "",
              modelName: (raw.assignedVehicle as any).modelName || "",
              plateNumber: (raw.assignedVehicle as any).plateNumber || "",
            }
          : null,
    };
  }

  /**
   * Maps full arrays of instructor records safely for bulk directory lists
   */
  static transformList(docs: IInstructor[]): ISafeInstructorResponse[] {
    if (!docs || !Array.isArray(docs)) return [];
    return docs.map((doc) => this.transformToSafeResponse(doc));
  }

  /**
   * 🤖 BOT CHANNEL SPECIALIST: Formats a collection of instructors into a clean,
   * hyper-readable conversational text block optimized for a mobile WhatsApp screen menu.
   */
  static transformToWhatsAppStaffMenu(
    docs: IInstructor[],
    branchName: string,
  ): string {
    if (!docs || docs.length === 0) {
      return `📭 *DriveEasy Academy Notification*\n\nWe couldn't find any active driving instructors deployed at our *${branchName}* branch at this moment.`;
    }

    let menuText = `🚗 *DRIVEEASY ACADEMY ROSTER* 🚗\n`;
    menuText += `📍 Branch: *${branchName}*\n`;
    menuText += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    menuText += `Reply with the instructor ID number or choose their availability profile during your online slot selection:\n\n`;

    docs.forEach((instructor, index) => {
      const name = instructor.profile?.fullName || "Staff Member";
      const rating = instructor.employmentProfile?.rating || 5.0;
      const code = instructor.licenseDetails?.licenseCode || "Code 8";
      const exp = instructor.licenseDetails?.yearsOfExperience || 0;

      // Creating visual stars based on their dashboard metric ratings
      const starRating = "⭐".repeat(Math.round(rating));

      menuText += `*${index + 1}. ${name}*\n`;
      menuText += `🏅 Rating: ${rating.toFixed(1)} ${starRating}\n`;
      menuText += `🪪 License: ${code} (${exp} years exp)\n`;
      menuText += `⏱️ Hours: ${instructor.employmentProfile?.workingHours?.join(", ") || "Flexible schedules"}\n`;
      menuText += `----------------------------\n`;
    });

    menuText += `\n🤖 _Powered by DriveEasy automated conversation assistants._`;
    return menuText;
  }
}
