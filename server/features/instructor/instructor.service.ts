import { InstructorRepository } from "./instructor.repository";
import { IInstructor } from "./instructor.model";
import { ApiError } from "../../utils/ApiError";
import logger from "../../utils/logger";
import { Types } from "mongoose";

export class InstructorService {
  // ============================================================================
  // 1. ONBOARD NEW INSTRUCTOR (Defensive Creation Sequence)
  // ============================================================================
  /**
   * Validates structural prerequisites and registers a new driving school instructor asset.
   */
  static async onboardInstructor(
    payload: Partial<IInstructor>,
  ): Promise<IInstructor> {
    const { drivingSchool, branch, profile, licenseDetails } = payload;

    // Strict structural check upfront to enforce architectural contract patterns
    if (
      !drivingSchool ||
      !branch ||
      !profile?.fullName ||
      !profile?.email ||
      !licenseDetails?.idNo
    ) {
      logger.error(
        "Instructor Onboarding Failed: Missing primary entity identity parameters on payload",
      );
      throw new ApiError(
        400,
        "Driving school, branch, instructor full name, email, and national ID number are strictly required.",
      );
    }

    // Business Logic Check: Prevent staff duplication across the platform tenant system
    // (Assuming we query by email or ID Number to protect system constraints)
    logger.info(
      `🔍 [InstructorService] Verifying asset uniqueness for email: ${profile.email}`,
    );

    // We can add a quick check down the line if we want, but for now we pass cleanly to repository
    try {
      const savedInstructor = await InstructorRepository.create(payload);
      logger.info(
        `🎯 Instructor profile securely created and active! ID: ${savedInstructor._id}`,
      );
      return savedInstructor;
    } catch (error: any) {
      logger.error(
        `Database Constraint Violation on Instructor creation: ${error.message}`,
      );
      if (error.code === 11000) {
        throw new ApiError(
          409,
          "An instructor record with this email address or National ID number already exists.",
        );
      }
      throw error;
    }
  }

  // ============================================================================
  // 2. TARGETED PROFILE SETTER (Granular Updates)
  // ============================================================================
  /**
   * Intercepts updates to ensure the targeted instructor row exists before patching data blocks.
   */
  static async updateProfile(
    instructorId: string,
    updatePayload: Partial<IInstructor>,
  ): Promise<IInstructor> {
    if (!instructorId) {
      throw new ApiError(
        400,
        "Target instructor identification token is required for modification.",
      );
    }

    logger.info(
      `🔄 [InstructorService] Processing profile updates for Instructor Asset: ${instructorId}`,
    );

    const updatedRecord = await InstructorRepository.update(
      instructorId,
      updatePayload,
    );
    if (!updatedRecord) {
      logger.error(
        `Update Aborted: Instructor ID ${instructorId} was not discovered in system lines.`,
      );
      throw new ApiError(
        404,
        "The requested instructor profile could not be located to execute updates.",
      );
    }

    return updatedRecord;
  }

  // ============================================================================
  // 3. VEHICLE FLEET MANAGEMENT ASSIGNMENT LINK
  // ============================================================================
  /**
   * Binds a vehicle asset tracking token to an instructor or cuts the bond if null is passed.
   */
  static async bindVehicleAsset(
    instructorId: string,
    vehicleId: string | null,
  ): Promise<IInstructor> {
    if (!instructorId) {
      throw new ApiError(
        400,
        "Instructor identifier is strictly required to execute vehicle tracking bonds.",
      );
    }

    logger.info(
      `🚗 [InstructorService] Coordinating vehicle assignment shift. Instructor: ${instructorId} -> Vehicle: ${vehicleId}`,
    );

    // Verify the instructor exists first before attempting vehicle mutation bindings
    const checkInstructor = await InstructorRepository.findById(instructorId);
    if (!checkInstructor) {
      throw new ApiError(
        404,
        "Target instructor record could not be found to re-allocate vehicle assets.",
      );
    }

    const modifiedInstructor = await InstructorRepository.updateAssignedVehicle(
      instructorId,
      vehicleId,
    );
    if (!modifiedInstructor) {
      throw new ApiError(
        500,
        "Internal tracking alignment fault occurred while updating vehicle records.",
      );
    }

    return modifiedInstructor;
  }

  // ============================================================================
  // 4. OPERATIONAL BRANCH SHEET LOGIC (Lookup Routines)
  // ============================================================================
  /**
   * Coordinates multitenant lookups for school management panels.
   */
  static async listBranchStaff(
    drivingSchoolId: string,
    branchId: string,
  ): Promise<IInstructor[]> {
    if (!drivingSchoolId || !branchId) {
      throw new ApiError(
        400,
        "Both driving school and local branch context variables must be provided.",
      );
    }

    logger.info(
      `📍 [InstructorService] Gathering active operations list for branch cluster: ${branchId}`,
    );
    return await InstructorRepository.findByBranch(drivingSchoolId, branchId);
  }

  /**
   * Pulls top-performing instructor assets for the leaderboards or automated selection weights.
   */
  static async getTopPerformers(
    drivingSchoolId: string,
  ): Promise<IInstructor[]> {
    if (!drivingSchoolId) {
      throw new ApiError(
        400,
        "Driving school brand identifier context is required.",
      );
    }
    return await InstructorRepository.findTopRated(drivingSchoolId);
  }

  /**
   * Deactivates the instructor's active login state, making them invisible to the bot calendar arrays.
   */
  static async removeStaffFromService(
    instructorId: string,
  ): Promise<IInstructor> {
    if (!instructorId) {
      throw new ApiError(
        400,
        "Target instructor ID parameter is required for service removal.",
      );
    }

    const terminatedProfile =
      await InstructorRepository.softDelete(instructorId);
    if (!terminatedProfile) {
      throw new ApiError(
        404,
        "Instructor record not found to pull from scheduling registries.",
      );
    }

    logger.warn(
      `⚠️ Instructor ID ${instructorId} has been flagged off active duty registries.`,
    );
    return terminatedProfile;
  }
}
