import {
  Student,
  IStudent,
  OnboardingStage,
  AccountStatus,
} from "./student.model";
import { Types } from "mongoose";

export class StudentRepository {
  // ==========================================
  // 1. STANDARD CRUD OPERATIONS
  // ==========================================

  /**
   * Creates a brand new student profile
   */
  async create(studentData: Partial<IStudent>): Promise<IStudent> {
    const student = new Student(studentData);
    return await student.save();
  }

  /**
   * Finds a student explicitly by their unique database identifier
   */
  async getById(id: string): Promise<IStudent | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Student.findById(id);
  }

  /**
   * Primary lookup used by the WhatsApp Webhook engine on every incoming message
   */
  async getByWhatsappNo(whatsappNo: string): Promise<IStudent | null> {
    return await Student.findOne({ whatsappNo });
  }

  /**
   * Updates specific subdocument fields atomically using an id
   */
  async update(
    id: string,
    updateData: Partial<IStudent>,
  ): Promise<IStudent | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Student.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );
  }

  /**
   * Performs a soft delete to ensure historical financial/booking records are kept intact
   */
  async softDelete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await Student.findByIdAndUpdate(id, {
      $set: { isActive: false },
    });
    return result !== null;
  }

  // ==========================================
  // 2. DOMAIN-SPECIFIC SEARCH QUERIES
  // ==========================================

  /**
   * Retrieves all students belonging to a specific school branch
   */
  async getByBranch(
    drivingSchool: string,
    branch: string,
  ): Promise<IStudent[]> {
    return await Student.find({
      drivingSchool,
      branch,
      isActive: true,
    });
  }

  /**
   * Filters students by branch AND their targeted driver code license (e.g., Code 8, 10, 14)
   */
  async getByBranchAndDrivingCode(
    drivingSchool: string,
    branch: string,
    code: string,
  ): Promise<IStudent[]> {
    return await Student.find({
      drivingSchool,
      branch,
      "courseDetails.drivingCode": code,
      isActive: true,
    });
  }

  /**
   * Finds all students assigned to a specific instructor
   */
  async getByInstructor(instructorId: string): Promise<IStudent[]> {
    if (!Types.ObjectId.isValid(instructorId)) return [];
    return await Student.find({
      "courseDetails.preferredInstructors": new Types.ObjectId(instructorId),
      isActive: true,
    });
  }

  /**
   * Finds students stuck at specific onboarding milestones (Great for bot broadcasts)
   */
  async getByOnboardingStage(stage: OnboardingStage): Promise<IStudent[]> {
    return await Student.find({ "onboarding.stage": stage, isActive: true });
  }

  /**
   * Finds accounts awaiting document approval checks by the admin panel
   */
  async getPendingApprovals(): Promise<IStudent[]> {
    return await Student.find({
      status: AccountStatus.PENDING,
      "onboarding.stage": OnboardingStage.COMPLETED,
      isActive: true,
    });
  }
}
