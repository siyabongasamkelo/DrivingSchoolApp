import { IStudent } from "./student.model";

// 1. Clean response interface for your Web/Admin Dashboard Frontend
export interface ISanitizedStudentResponse {
  id: string;
  whatsappNo: string;
  isActive: boolean;
  paymentStatus: "Unpaid" | "Partially Paid" | "Paid";
  onboardingStage: string;
  profile: {
    fullName: string;
    age?: number;
    gender?: string;
    phoneNo?: string;
    emailAddress?: string;
    city?: string;
  };
  courseDetails: {
    drivingCourse?: string;
    drivingCode?: string;
    preferredTime?: string;
  };
  progress: {
    numberOfLessonsAvailable: number;
    lessonsCompletedCount: number;
  };
}

// 2. Ultra-light context interface for your WhatsApp Chatbot Engine
export interface IBotContextResponse {
  whatsappNo: string;
  onboardingStage: string;
  fullName: string;
  paymentStatus: "Unpaid" | "Partially Paid" | "Paid";
  isAllowedToDrive: boolean;
  lessonsLeft: number;
}

export class StudentAdapter {
  /**
   * Transforms a raw database student document into a clean, safe payload
   * for the Client App or Admin Dashboard. Completely hides document photos and raw scores.
   */
  static toClient(student: IStudent): ISanitizedStudentResponse {
    return {
      id: student._id.toString(),
      whatsappNo: student.whatsappNo,
      isActive: student.isActive,
      paymentStatus: student.paymentStatus,
      onboardingStage: student.onboarding.stage,
      profile: {
        fullName: student.profile?.fullName || "Prospect Learner",
        age: student.profile?.age,
        gender: student.profile?.gender,
        phoneNo: student.profile?.phoneNo,
        emailAddress: student.profile?.emailAddress,
        city: student.profile?.address?.city,
      },
      courseDetails: {
        drivingCourse: student.courseDetails?.drivingCourse,
        drivingCode: student.courseDetails?.drivingCode,
        preferredTime: student.courseDetails?.preferredTime,
      },
      progress: {
        numberOfLessonsAvailable:
          student.progress?.numberOfLessonsAvailable || 0,
        lessonsCompletedCount: student.progress?.previousSessions?.length || 0,
      },
    };
  }

  /**
   * Transforms a student into a lightweight context state object
   * optimized entirely for quick evaluations inside the WhatsApp Bot Engine.
   */
  static toBotContext(student: IStudent): IBotContextResponse {
    return {
      whatsappNo: student.whatsappNo,
      onboardingStage: student.onboarding.stage,
      fullName: student.profile?.fullName || "",
      paymentStatus: student.paymentStatus,
      isAllowedToDrive: student.isAllowedToDrive,
      lessonsLeft: student.progress?.numberOfLessonsAvailable || 0,
    };
  }
}
