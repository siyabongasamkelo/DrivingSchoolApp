import { Instructor, IInstructor } from "./instructor.model";
import { Types } from "mongoose";
import logger from "../../utils/logger";

export class InstructorRepository {
  // ============================================================================
  // 1. BASELINE CRUD OPERATIONS
  // ============================================================================

  /**
   * Persists a completely new instructor profile into the database grid
   */
  static async create(
    instructorData: Partial<IInstructor>,
  ): Promise<IInstructor> {
    logger.info(
      `💾 [InstructorRepository] Creating new instructor line record for: ${instructorData.profile?.fullName}`,
    );
    const newInstructor = new Instructor(instructorData);
    return await newInstructor.save();
  }

  /**
   * Locates a single instructor by their core database hexadecimal identifier
   */
  static async findById(instructorId: string): Promise<IInstructor | null> {
    logger.info(
      `🔍 [InstructorRepository] Fetching instructor record details for ID: ${instructorId}`,
    );
    return await Instructor.findById(new Types.ObjectId(instructorId))
      .populate("assignedVehicle")
      .populate("currentStudents", "profile.fullName phoneNo");
  }

  /**
   * Performs a granular patch update on sub-document elements using atomic mongo setters
   */
  static async update(
    instructorId: string,
    updateData: Partial<IInstructor>,
  ): Promise<IInstructor | null> {
    logger.info(
      `📝 [InstructorRepository] Executing targeted document update patch on Instructor ID: ${instructorId}`,
    );
    return await Instructor.findByIdAndUpdate(
      new Types.ObjectId(instructorId),
      { $set: updateData },
      { new: true, runValidators: true },
    );
  }

  /**
   * Soft-deletes or toggles the structural active flag instead of a destructive hard drop
   */
  static async softDelete(instructorId: string): Promise<IInstructor | null> {
    logger.info(
      `🚫 [InstructorRepository] Soft-deactivating operational instructor workspace line for ID: ${instructorId}`,
    );
    return await Instructor.findByIdAndUpdate(
      new Types.ObjectId(instructorId),
      { $set: { "employmentProfile.isActive": false } },
      { new: true },
    );
  }

  // ============================================================================
  // 2. TENANT & GEOGRAPHIC FILTERS (Your suggestions!)
  // ============================================================================

  /**
   * Extracts all active instructors linked directly to a master driving school tenant group
   */
  static async findByDrivingSchool(
    drivingSchoolId: string,
  ): Promise<IInstructor[]> {
    logger.info(
      `🏢 [InstructorRepository] Extracting staff lists for Driving School Tenant: ${drivingSchoolId}`,
    );
    return await Instructor.find({
      drivingSchool: new Types.ObjectId(drivingSchoolId),
      "employmentProfile.isActive": true,
    })
      .select(
        "profile.fullName profile.phoneNo licenseDetails.licenseCode employmentProfile.employmentType",
      )
      .sort({ "profile.fullName": 1 })
      .lean();
  }

  /**
   * Filters staff down to a single localized business branch asset line
   */
  static async findByBranch(
    drivingSchoolId: string,
    branchId: string,
  ): Promise<IInstructor[]> {
    logger.info(
      `📍 [InstructorRepository] Querying branch roster for School: ${drivingSchoolId} -> Branch: ${branchId}`,
    );
    return await Instructor.find({
      drivingSchool: new Types.ObjectId(drivingSchoolId),
      branch: new Types.ObjectId(branchId),
      "employmentProfile.isActive": true,
    })
      .populate("assignedVehicle", "make modelName plateNumber")
      .sort({ "profile.fullName": 1 })
      .lean();
  }

  /**
   * Extracts high performing instructors ordered chronologically by rating scores for leaderboard panels
   */
  static async findTopRated(
    drivingSchoolId: string,
    minRating: number = 4.0,
  ): Promise<IInstructor[]> {
    logger.info(
      `⭐ [InstructorRepository] Pulling top-tier performers with ratings >= ${minRating}`,
    );
    return await Instructor.find({
      drivingSchool: new Types.ObjectId(drivingSchoolId),
      "employmentProfile.isActive": true,
      "employmentProfile.rating": { $gte: minRating },
    })
      .sort({ "employmentProfile.rating": -1 })
      .limit(10)
      .lean();
  }

  // ============================================================================
  // 3. SCHEDULING LOGIC & VEHICLE RE-ALLOCATION
  // ============================================================================

  /**
   * Finds all active instructors at a branch who have a specific working hour block in their profile array.
   * Perfect for initial availability matches before the booking slot layer crosscheck.
   */
  static async findByAvailabilitySlot(
    branchId: string,
    targetTimeSlot: string,
  ): Promise<IInstructor[]> {
    logger.info(
      `📅 [InstructorRepository] Querying staff working profiles containing time frame: ${targetTimeSlot}`,
    );
    return await Instructor.find({
      branch: new Types.ObjectId(branchId),
      "employmentProfile.isActive": true,
      "employmentProfile.workingHours": targetTimeSlot, // Mongo natively checks arrays if the value matches any string element!
    }).lean();
  }

  /**
   * Dynamically swaps or drops an instructor's vehicle assignment link when rolling tracking fleets
   */
  static async updateAssignedVehicle(
    instructorId: string,
    vehicleId: string | null,
  ): Promise<IInstructor | null> {
    logger.info(
      `🚗 [InstructorRepository] Updating vehicle bond config on Instructor: ${instructorId} to Vehicle: ${vehicleId}`,
    );
    return await Instructor.findByIdAndUpdate(
      new Types.ObjectId(instructorId),
      {
        $set: {
          assignedVehicle: vehicleId
            ? new Types.ObjectId(vehicleId)
            : undefined,
        },
      },
      { new: true },
    );
  }
}
