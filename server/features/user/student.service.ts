import { StudentRepository } from "./student.repository";
import { ApiError } from "../../utils/ApiError";
import logger from "../../utils/logger";
import { IStudent, OnboardingStage } from "./student.model";

const repo = new StudentRepository();

export class StudentService {
  // ==========================================
  // 1. CREATE A NEW STUDENT
  // ==========================================
  static async createStudent(
    studentData: Partial<IStudent>,
  ): Promise<IStudent> {
    if (!studentData.whatsappNo) {
      logger.error(
        "Student Creation Failed: Missing primary whatsappNo identity payload",
      );
      throw new ApiError(
        400,
        "WhatsApp number is strictly required to initialize a learner profile.",
      );
    }

    // Check if the student already exists to prevent duplicate profiles in the bot
    const existingStudent = await repo.getByWhatsappNo(studentData.whatsappNo);
    if (existingStudent) {
      logger.warn(
        `Student Creation Aborted: Account with WhatsApp ${studentData.whatsappNo} already exists`,
      );
      throw new ApiError(
        409,
        "A student account with this WhatsApp number is already registered.",
      );
    }

    const newStudent = await repo.create(studentData);
    logger.info(
      `🎯 New Student profile registered successfully via WhatsApp: ${newStudent.whatsappNo}`,
    );
    return newStudent;
  }

  // ==========================================
  // 2. GET STUDENT BY ID
  // ==========================================
  static async getStudentById(id: string): Promise<IStudent> {
    const student = await repo.getById(id);

    if (!student || !student.isActive) {
      logger.error(
        `Student Lookup Failed: Database ID ${id} does not exist or is inactive`,
      );
      throw new ApiError(
        404,
        "Student profile could not be located or has been archived.",
      );
    }

    logger.info(`Student profile for ID ${id} retrieved successfully.`);
    return student;
  }

  // ==========================================
  // 3. GET STUDENT BY WHATSAPP NUMBER (Bot Engine Primary Endpoint)
  // ==========================================
  static async getStudentByWhatsappNo(whatsappNo: string): Promise<IStudent> {
    const student = await repo.getByWhatsappNo(whatsappNo);

    if (!student || !student.isActive) {
      logger.error(
        `Bot Lookup Failed: WhatsApp number ${whatsappNo} is not registered`,
      );
      throw new ApiError(
        404,
        "No active driving school profile discovered for this phone number.",
      );
    }

    logger.info(
      `Bot verification successful: Retrieved account data for WhatsApp user ${whatsappNo}`,
    );
    return student;
  }

  // ==========================================
  // 4. UPDATE STUDENT DATA
  // ==========================================
  static async updateStudent(
    id: string,
    updateData: Partial<IStudent>,
  ): Promise<IStudent> {
    // Basic verification check before running execution block
    await this.getStudentById(id);

    const updatedStudent = await repo.update(id, updateData);
    if (!updatedStudent) {
      logger.error(
        `Student Update Failed: Error persisting updates for ID ${id}`,
      );
      throw new ApiError(
        500,
        "Failed to apply updates to the student database record.",
      );
    }

    logger.info(
      `Student profile updates persisted successfully for Database ID: ${id}`,
    );
    return updatedStudent;
  }

  // ==========================================
  // 5. SOFT DELETE STUDENT
  // ==========================================
  static async removeStudent(id: string): Promise<void> {
    await this.getStudentById(id); // Throws 404 error if student doesn't exist

    const success = await repo.softDelete(id);
    if (!success) {
      logger.error(
        `Student Deletion Failed: Soft-delete execution failed for ID ${id}`,
      );
      throw new ApiError(
        500,
        "Internal error encountered while archiving the student profile.",
      );
    }

    logger.warn(
      `⚠️ Student profile safely archived (Soft-Deleted) for ID: ${id}`,
    );
  }

  // ==========================================
  // 6. DOMAIN SEARCH LOOKUPS
  // ==========================================

  static async getStudentsByBranch(
    drivingSchool: string,
    branch: string,
  ): Promise<IStudent[]> {
    if (!drivingSchool || !branch) {
      logger.error(
        "Branch Search Failed: Missing driving school name or branch location parameters",
      );
      throw new ApiError(
        400,
        "Driving school company and branch location are required parameters.",
      );
    }

    const students = await repo.getByBranch(drivingSchool, branch);
    logger.info(
      `Discovered ${students.length} active students registered at the ${drivingSchool} - [${branch}] branch.`,
    );
    return students;
  }

  static async getStudentsByBranchAndCode(
    drivingSchool: string,
    branch: string,
    code: string,
  ): Promise<IStudent[]> {
    if (!drivingSchool || !branch || !code) {
      logger.error(
        "License Code Filtering Failed: Missing operational search parameters",
      );
      throw new ApiError(
        400,
        "Driving school, branch, and target license code (e.g. Code 8) are strictly required.",
      );
    }

    const students = await repo.getByBranchAndDrivingCode(
      drivingSchool,
      branch,
      code,
    );
    logger.info(
      `Discovered ${students.length} students tracking driving license [${code}] at ${branch} branch.`,
    );
    return students;
  }

  static async getStudentsByInstructor(
    instructorId: string,
  ): Promise<IStudent[]> {
    if (!instructorId) {
      logger.error(
        "Instructor Search Failed: Missing instructor object identifier",
      );
      throw new ApiError(
        400,
        "A valid instructor identification token is required.",
      );
    }

    const students = await repo.getByInstructor(instructorId);
    logger.info(
      `Retrieved ${students.length} active students currently assigned to Instructor ID: ${instructorId}`,
    );
    return students;
  }

  static async getStudentsByOnboardingStage(
    stage: OnboardingStage,
  ): Promise<IStudent[]> {
    const students = await repo.getByOnboardingStage(stage);
    logger.info(
      `Campaign Audit: Located ${students.length} prospects currently matching onboarding stage: [${stage}]`,
    );
    return students;
  }

  static async getPendingApprovals(): Promise<IStudent[]> {
    const students = await repo.getPendingApprovals();
    logger.info(
      `Dashboard Audit: Discovered ${students.length} completed registrations awaiting document verification checks.`,
    );
    return students;
  }
}
