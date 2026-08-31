import { DrivingSchoolRepository } from "./drivingSchool.repository";
import { IDrivingSchool, TenantStatus } from "./drivingSchool.model";
import { ApiError } from "../../utils/ApiError";
import logger from "../../utils/logger";

export class DrivingSchoolService {
  // ============================================================================
  // 1. REGISTER NEW DRIVING SCHOOL TENANT (Defensive Core Flow)
  // ============================================================================
  /**
   * Verifies structural multi-tenant availability and initializes a root corporate profile
   */
  static async setupDrivingSchool(
    payload: Partial<IDrivingSchool>,
  ): Promise<IDrivingSchool> {
    const { schoolName, subdomain, businessProfile, contactDetails } = payload;

    // Strict parameter prerequisite verification upfront
    if (
      !schoolName ||
      !subdomain ||
      !businessProfile?.registrationNumber ||
      !businessProfile?.licenseNo ||
      !contactDetails?.corporateEmail
    ) {
      logger.error(
        "Driving School Setup Failed: Mandatory platform onboarding variables missing from payload",
      );
      throw new ApiError(
        400,
        "School name, subdomain string, registration number, training license code, and corporate email are strictly required.",
      );
    }

    // 🔒 Guard Clause 1: Verify URL Subdomain availability across the ecosystem grid
    logger.info(
      `🔍 [DrivingSchoolService] Verifying subdomain link allocation status for: ${subdomain}`,
    );
    const existingSubdomain =
      await DrivingSchoolRepository.findBySubdomain(subdomain);
    if (existingSubdomain) {
      throw new ApiError(
        409,
        `The application subdomain '${subdomain.toLowerCase()}' is already claimed by an active driving academy.`,
      );
    }

    try {
      const savedSchool = await DrivingSchoolRepository.create(payload);
      logger.info(
        `🎯 Multi-tenant driving school registered and locked into verification lines! ID: ${savedSchool._id}`,
      );
      return savedSchool;
    } catch (error: any) {
      logger.error(
        `Database Constraint Violation on Driving School tenant setup: ${error.message}`,
      );

      // Catch duplicate field errors smoothly (e.g., registrationNumber or licenseNo indexes)
      if (error.code === 11000) {
        throw new ApiError(
          409,
          "Registration Conflict: A driving school with this corporate registration number, training license code, or email address already exists.",
        );
      }
      throw error;
    }
  }

  // ============================================================================
  // 2. ROOT TENANT CONFIGURATION LOOKUPS
  // ============================================================================

  /**
   * Discovers complete configuration schemas for a driving school via its primary ID token
   */
  static async getSchoolProfile(schoolId: string): Promise<IDrivingSchool> {
    if (!schoolId) {
      throw new ApiError(
        400,
        "Driving school tracking token identifier is required.",
      );
    }

    const school = await DrivingSchoolRepository.findById(schoolId);
    if (!school) {
      throw new ApiError(
        404,
        "The requested driving school corporate profile could not be located.",
      );
    }
    return school;
  }

  /**
   * Resolves a tenant profile based on a URL subdomain match (Essential for client portals)
   */
  static async resolveTenantBySubdomain(
    subdomainString: string,
  ): Promise<IDrivingSchool> {
    if (!subdomainString) {
      throw new ApiError(
        400,
        "Subdomain parameter is required to resolve tenant matrix.",
      );
    }

    const school =
      await DrivingSchoolRepository.findBySubdomain(subdomainString);
    if (!school) {
      throw new ApiError(
        404,
        "No driving school platform profile is mapped onto this web subdomain.",
      );
    }
    return school;
  }

  // ============================================================================
  // 3. ADMINISTRATIVE SETTERS & STATUS CONTROLS
  // ============================================================================

  /**
   * Intercepts updates to ensure compliance parameters remain uncompromised during patches
   */
  static async updateSchoolDetails(
    schoolId: string,
    updatePayload: Partial<IDrivingSchool>,
  ): Promise<IDrivingSchool> {
    if (!schoolId) {
      throw new ApiError(
        400,
        "Target driving school identifier is required to save adjustments.",
      );
    }

    // Force strict structure: block raw manual modifications to metrics from the profile patch endpoint
    if (updatePayload.metrics) {
      delete (updatePayload as any).metrics;
    }

    logger.info(
      `🔄 [DrivingSchoolService] Executing corporate adjustments for Driving School: ${schoolId}`,
    );

    const updatedRecord = await DrivingSchoolRepository.update(
      schoolId,
      updatePayload,
    );
    if (!updatedRecord) {
      throw new ApiError(
        404,
        "Driving school update aborted. Corporate record not found in system grids.",
      );
    }

    return updatedRecord;
  }

  /**
   * Toggles the subscription visibility state of a tenant instantly across the global infrastructure
   */
  static async toggleTenantAccessState(
    schoolId: string,
    targetState: TenantStatus,
  ): Promise<IDrivingSchool> {
    if (!schoolId || !targetState) {
      throw new ApiError(
        400,
        "Both school identifier and target authorization state are required.",
      );
    }

    const modifiedSchool = await DrivingSchoolRepository.updateTenantStatus(
      schoolId,
      targetState,
    );
    if (!modifiedSchool) {
      throw new ApiError(
        404,
        "Failed to toggle status. Target driving school profile record was not discovered.",
      );
    }

    logger.warn(
      `⚠️ Corporate Tenant ID ${schoolId} system authority status shifted to: ${targetState}`,
    );
    return modifiedSchool;
  }
}
