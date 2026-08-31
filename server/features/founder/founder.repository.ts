import { Founder, IFounder } from "./founder.model";
import { Types } from "mongoose";
import logger from "../../utils/logger";

export class FounderRepository {
  // ============================================================================
  // 1. BASELINE CRUD OPERATIONS
  // ============================================================================

  /**
   * Persists a completely new founder profile into the platform grid
   */
  static async create(founderData: Partial<IFounder>): Promise<IFounder> {
    logger.info(
      `💾 [FounderRepository] Persisting fresh founder document for: ${founderData.profile?.fullName}`,
    );
    const newFounder = new Founder(founderData);
    return await newFounder.save();
  }

  /**
   * Locates a single founder by their core hexadecimal identity token
   */
  static async findById(founderId: string): Promise<IFounder | null> {
    logger.info(
      `🔍 [FounderRepository] Fetching founder profile record for ID: ${founderId}`,
    );
    return await Founder.findById(new Types.ObjectId(founderId))
      .populate("drivingSchool")
      .populate("managedBranches", "branchName address phoneNo");
  }

  /**
   * Performs granular, type-safe modifications using atomic Mongoose operators
   */
  static async update(
    founderId: string,
    updateData: Partial<IFounder>,
  ): Promise<IFounder | null> {
    logger.info(
      `📝 [FounderRepository] Applying targeted update patch on Founder ID: ${founderId}`,
    );
    return await Founder.findByIdAndUpdate(
      new Types.ObjectId(founderId),
      { $set: updateData },
      { new: true, runValidators: true },
    );
  }

  /**
   * Drops a founder cleanly from the grid (Hard deletion reserved for master admin)
   */
  static async hardDelete(founderId: string): Promise<IFounder | null> {
    logger.warn(
      `💥 [FounderRepository] Hard executing structural database removal for Founder ID: ${founderId}`,
    );
    return await Founder.findByIdAndDelete(new Types.ObjectId(founderId));
  }

  // ============================================================================
  // 2. IDENTITY & CORPORATE TENANT LOOKUPS (Advanced Needs)
  // ============================================================================

  /**
   * Fetches founder tracking state matching an email address for identity checks
   */
  static async findByEmail(email: string): Promise<IFounder | null> {
    logger.info(
      `🔍 [FounderRepository] Scanning administrative records for account email: ${email}`,
    );
    return await Founder.findOne({
      "profile.email": email.toLowerCase().trim(),
    });
  }

  /**
   * Locates the active legal owner link mapped directly to a single driving school entity
   */
  static async findByDrivingSchool(
    drivingSchoolId: string,
  ): Promise<IFounder | null> {
    logger.info(
      `🏢 [FounderRepository] Querying master owner line for Driving School: ${drivingSchoolId}`,
    );
    return await Founder.findOne({
      drivingSchool: new Types.ObjectId(drivingSchoolId),
    })
      .populate("managedBranches")
      .lean();
  }

  // ============================================================================
  // 3. ATOMIC RELATIONSHIP RE-ALLOCATION
  // ============================================================================

  /**
   * Pushes a new branch token into the founder's control array safely without wiping out existing links
   */
  static async addBranchToControl(
    founderId: string,
    branchId: string,
  ): Promise<IFounder | null> {
    logger.info(
      `📍 [FounderRepository] Binding new branch asset context link ${branchId} to Founder ${founderId}`,
    );
    return await Founder.findByIdAndUpdate(
      new Types.ObjectId(founderId),
      { $addToSet: { managedBranches: new Types.ObjectId(branchId) } }, // $addToSet guarantees no duplicate elements in array
      { new: true },
    );
  }
}
