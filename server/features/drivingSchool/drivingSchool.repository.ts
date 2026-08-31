import {
  DrivingSchool,
  IDrivingSchool,
  TenantStatus,
} from "./drivingSchool.model";
import { Types } from "mongoose";
import logger from "../../utils/logger";

export class DrivingSchoolRepository {
  // ============================================================================
  // 1. BASELINE CRUD OPERATIONS
  // ============================================================================

  /**
   * Persists a completely new driving school tenant enterprise line into the system core
   */
  static async create(
    schoolData: Partial<IDrivingSchool>,
  ): Promise<IDrivingSchool> {
    logger.info(
      `💾 [DrivingSchoolRepository] Persisting master tenant entity for: ${schoolData.schoolName}`,
    );
    const newSchool = new DrivingSchool(schoolData);
    return await newSchool.save();
  }

  /**
   * Locates a single driving school record via its primary database identity token
   */
  static async findById(schoolId: string): Promise<IDrivingSchool | null> {
    logger.info(
      `🔍 [DrivingSchoolRepository] Discovering driving school data records for ID: ${schoolId}`,
    );
    return await DrivingSchool.findById(new Types.ObjectId(schoolId)).populate(
      "founder",
      "profile.fullName profile.email profile.contactNo",
    );
  }

  /**
   * Performs targeted adjustments on nested sub-documents using atomic Mongoose operators
   */
  static async update(
    schoolId: string,
    updateData: Partial<IDrivingSchool>,
  ): Promise<IDrivingSchool | null> {
    logger.info(
      `📝 [DrivingSchoolRepository] Applying configuration patches to Driving School ID: ${schoolId}`,
    );
    return await DrivingSchool.findByIdAndUpdate(
      new Types.ObjectId(schoolId),
      { $set: updateData },
      { new: true, runValidators: true },
    );
  }

  /**
   * Complete database elimination of a driving school tenant (Reserved strictly for root platform super admins)
   */
  static async hardDelete(schoolId: string): Promise<IDrivingSchool | null> {
    logger.warn(
      `💥 [DrivingSchoolRepository] Hard destroying tenant entry from core database grid. ID: ${schoolId}`,
    );
    return await DrivingSchool.findByIdAndDelete(new Types.ObjectId(schoolId));
  }

  // ============================================================================
  // 2. SaaS ROUTING & TENANT ACCOUNT LOOKUPS
  // ============================================================================

  /**
   * Locates a tenant using its unique URL prefix slug line for front-end subdomains
   */
  static async findBySubdomain(
    subdomain: string,
  ): Promise<IDrivingSchool | null> {
    logger.info(
      `🌐 [DrivingSchoolRepository] Resolving multi-tenant context for subdomain: ${subdomain}`,
    );
    return await DrivingSchool.findOne({
      subdomain: subdomain.toLowerCase().trim(),
    }).lean();
  }

  /**
   * Instantly changes a school's platform service accessibility status
   */
  static async updateTenantStatus(
    schoolId: string,
    newStatus: TenantStatus,
  ): Promise<IDrivingSchool | null> {
    logger.info(
      `🔒 [DrivingSchoolRepository] Toggling tenant authority state for School ID ${schoolId} to: ${newStatus}`,
    );
    return await DrivingSchool.findByIdAndUpdate(
      new Types.ObjectId(schoolId),
      { $set: { "platformBilling.status": newStatus } },
      { new: true },
    );
  }

  // ============================================================================
  // 3. PERFORMANCE OPTIMIZATION UTILITIES
  // ============================================================================

  /**
   * Dynamically increments or decrements total branch/instructor cache counters atomically
   */
  static async incrementMetricCounts(
    schoolId: string,
    field: "totalBranchesCount" | "totalInstructorsCount",
    amount: number, // Pass 1 to increment, -1 to decrement
  ): Promise<void> {
    logger.info(
      `⚡ [DrivingSchoolRepository] Modifying counter metric '${field}' by ${amount} on School ID: ${schoolId}`,
    );
    await DrivingSchool.updateOne(
      { _id: new Types.ObjectId(schoolId) },
      { $inc: { [`metrics.${field}`]: amount } }, // Highly efficient atomic increment operation
    );
  }
}
