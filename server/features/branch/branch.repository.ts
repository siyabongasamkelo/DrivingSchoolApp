import { Branch, IBranch } from "./branch.model";
import { Types } from "mongoose";
import logger from "../../utils/logger";

export class BranchRepository {
  // ============================================================================
  // 1. BASELINE CRUD OPERATIONS
  // ============================================================================

  /**
   * Persists a completely new localized branch asset line into the database grid
   */
  static async create(branchData: Partial<IBranch>): Promise<IBranch> {
    logger.info(
      `💾 [BranchRepository] Creating new branch document line record: ${branchData.branchName}`,
    );
    const newBranch = new Branch(branchData);
    return await newBranch.save();
  }

  /**
   * Locates a single branch by its core database hexadecimal identifier
   */
  static async findById(branchId: string): Promise<IBranch | null> {
    logger.info(
      `🔍 [BranchRepository] Fetching branch profile details for ID: ${branchId}`,
    );
    return await Branch.findById(new Types.ObjectId(branchId))
      .populate("drivingSchool", "schoolName corporateEmail")
      .populate("manager", "profile.fullName profile.phoneNo");
  }

  /**
   * Performs a granular patch update on sub-document elements using atomic mongo setters
   */
  static async update(
    branchId: string,
    updateData: Partial<IBranch>,
  ): Promise<IBranch | null> {
    logger.info(
      `📝 [BranchRepository] Executing targeted document update patch on Branch ID: ${branchId}`,
    );
    return await Branch.findByIdAndUpdate(
      new Types.ObjectId(branchId),
      { $set: updateData },
      { new: true, runValidators: true },
    );
  }

  /**
   * Soft-deactivates the branch asset instead of performing a destructive hard drop
   */
  static async softDelete(branchId: string): Promise<IBranch | null> {
    logger.warn(
      `🚫 [BranchRepository] Flagging branch workspace line as inactive for ID: ${branchId}`,
    );
    return await Branch.findByIdAndUpdate(
      new Types.ObjectId(branchId),
      { $set: { "operationalMetrics.isActive": false } },
      { new: true },
    );
  }

  // ============================================================================
  // 2. ADVANCED OPERATIONAL FILTERS
  // ============================================================================

  /**
   * Extracts all active branches linked directly to a master driving school tenant group
   */
  static async findByDrivingSchool(
    drivingSchoolId: string,
  ): Promise<IBranch[]> {
    logger.info(
      `🏢 [BranchRepository] Gathering active branch lists for School Tenant ID: ${drivingSchoolId}`,
    );
    return await Branch.find({
      drivingSchool: new Types.ObjectId(drivingSchoolId),
      "operationalMetrics.isActive": true,
    })
      .sort({ branchName: 1 })
      .lean();
  }

  /**
   * Performs a case-insensitive sub-string regex query across the address property line
   */
  static async findByCityOrAddress(
    drivingSchoolId: string,
    searchQuery: string,
  ): Promise<IBranch[]> {
    logger.info(
      `🔍 [BranchRepository] Scanning branch address lines for location keyword match: ${searchQuery}`,
    );
    return await Branch.find({
      drivingSchool: new Types.ObjectId(drivingSchoolId),
      "operationalMetrics.isActive": true,
      "contactDetails.address": { $regex: searchQuery, $options: "i" }, // Case-insensitive wildcard match
    })
      .sort({ branchName: 1 })
      .lean();
  }

  /**
   * Pulls high-performing branch entities ordered chronologically by leaderboard metrics
   */
  static async findTopRated(
    drivingSchoolId: string,
    minRating: number = 4.0,
  ): Promise<IBranch[]> {
    logger.info(
      `⭐ [BranchRepository] Compiling top-tier branches with ratings >= ${minRating}`,
    );
    return await Branch.find({
      drivingSchool: new Types.ObjectId(drivingSchoolId),
      "operationalMetrics.isActive": true,
      "operationalMetrics.rating": { $gte: minRating },
    })
      .sort({ "operationalMetrics.rating": -1 })
      .limit(10)
      .lean();
  }
}
