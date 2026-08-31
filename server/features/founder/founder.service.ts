import { FounderRepository } from "./founder.repository";
import { IFounder } from "./founder.model";
import { ApiError } from "../../utils/ApiError";
import logger from "../../utils/logger";

export class FounderService {
  // ============================================================================
  // 1. ONBOARD NEW FOUNDER (Defensive Setup Sequence)
  // ============================================================================
  /**
   * Validates ecosystem prerequisites and claims a driving school tenant line
   */
  static async onboardFounder(payload: Partial<IFounder>): Promise<IFounder> {
    const { drivingSchool, profile } = payload;

    if (!drivingSchool || !profile?.fullName || !profile?.email) {
      logger.error(
        "Founder Onboarding Failed: Missing core registration parameters on payload",
      );
      throw new ApiError(
        400,
        "Driving school link, founder full name, and business email are strictly required.",
      );
    }

    // 🔒 Guard Clause 1: Prevent account duplicate overlaps
    logger.info(
      `🔍 [FounderService] Checking if email account is available: ${profile.email}`,
    );
    const existingEmail = await FounderRepository.findByEmail(profile.email);
    if (existingEmail) {
      throw new ApiError(
        409,
        "A system profile record with this administrative login email already exists.",
      );
    }

    // 🏢 Guard Clause 2: Enforce strict Multi-Tenant Ownership
    // One driving school can only have one master founder line mapped to it
    logger.info(
      `🔍 [FounderService] Verifying if Driving School ${drivingSchool} already has an owner`,
    );
    const schoolOwner = await FounderRepository.findByDrivingSchool(
      String(drivingSchool),
    );
    if (schoolOwner) {
      throw new ApiError(
        423, // Locked down
        "This driving school asset has already been claimed by a verified corporate founder.",
      );
    }

    try {
      const savedFounder = await FounderRepository.create(payload);
      logger.info(
        `🎯 Founder profile securely onboarded! ID: ${savedFounder._id}`,
      );
      return savedFounder;
    } catch (error: any) {
      logger.error(
        `Database Constraint Violation on Founder creation: ${error.message}`,
      );
      if (error.code === 11000) {
        throw new ApiError(
          409,
          "A conflict occurred. This email or driving school is already registered.",
        );
      }
      throw error;
    }
  }

  // ============================================================================
  // 2. GRANULAR IDENTITY MANAGEMENT (Fetch / Update / Allocate)
  // ============================================================================

  /**
   * Discovers a founder record via its database tracking token
   */
  static async getFounderDetails(founderId: string): Promise<IFounder> {
    if (!founderId) {
      throw new ApiError(400, "Founder identification token is required.");
    }

    const founder = await FounderRepository.findById(founderId);
    if (!founder) {
      throw new ApiError(
        404,
        "The requested founder management record could not be found.",
      );
    }
    return founder;
  }

  /**
   * Intercepts updates to ensure data alignment before running atomic mutations
   */
  static async updateFounderProfile(
    founderId: string,
    updatePayload: Partial<IFounder>,
  ): Promise<IFounder> {
    if (!founderId) {
      throw new ApiError(
        400,
        "Target founder identifier is required for modification.",
      );
    }

    logger.info(
      `🔄 [FounderService] Processing administrative adjustments for Founder: ${founderId}`,
    );

    const updatedRecord = await FounderRepository.update(
      founderId,
      updatePayload,
    );
    if (!updatedRecord) {
      throw new ApiError(
        404,
        "The targeted founder details could not be discovered to execute updates.",
      );
    }

    return updatedRecord;
  }

  /**
   * Binds an additional localized operations branch to the founder's tracking list
   */
  static async attachBranchToFounder(
    founderId: string,
    branchId: string,
  ): Promise<IFounder> {
    if (!founderId || !branchId) {
      throw new ApiError(
        400,
        "Both founder and branch identifiers must be provided.",
      );
    }

    const modifiedFounder = await FounderRepository.addBranchToControl(
      founderId,
      branchId,
    );
    if (!modifiedFounder) {
      throw new ApiError(
        404,
        "Failed to attach branch. Founder profile record was not found.",
      );
    }

    return modifiedFounder;
  }
}
