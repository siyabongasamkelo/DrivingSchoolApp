import { IBranch } from "./branch.model";

// Strict contract shape for what goes over the network wire
export interface ISafeBranchResponse {
  id: string;
  drivingSchoolId: string;
  manager?: {
    id: string;
    fullName: string;
    phoneNo: string;
  } | null;
  branchName: string;
  slug: string;
  branchNo: string;
  branchCode: string;
  contactDetails: {
    email: string;
    contactNo: string;
    website?: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  brandingAssets: {
    image?: string;
    logo?: string;
  };
  operationalMetrics: {
    rating: number;
    availableCourses: string[];
    isActive: boolean;
  };
  operatingHours: {
    mondayToFriday: string;
    saturday: string;
    sunday: string;
  };
  createdAt: Date;
}

export class BranchAdapter {
  /**
   * 🛡️ TRANSFORMATION GUARD: Cleanses a raw branch database document
   * into a clean, network-safe object ready for UI rendering.
   */
  static transformToSafeResponse(doc: IBranch): ISafeBranchResponse {
    // Handle both hydrated Mongoose documents and lean raw JSON objects smoothly
    const raw = typeof doc.toObject === "function" ? doc.toObject() : doc;

    return {
      id: String(raw._id),
      drivingSchoolId: String(raw.drivingSchool?._id || raw.drivingSchool),
      manager:
        raw.manager && typeof raw.manager === "object" && "_id" in raw.manager
          ? {
              id: String((raw.manager as any)._id),
              fullName:
                (raw.manager as any).profile?.fullName || "Assigned Manager",
              phoneNo: (raw.manager as any).profile?.phoneNo || "",
            }
          : null,
      branchName: raw.branchName || "",
      slug: raw.slug || "",
      branchNo: raw.branchNo || "",
      branchCode: raw.branchCode || "",
      contactDetails: {
        email: raw.contactDetails?.email || "",
        contactNo: raw.contactDetails?.contactNo || "",
        website: raw.contactDetails?.website,
        address: raw.contactDetails?.address || "",
        coordinates: raw.contactDetails?.coordinates,
      },
      brandingAssets: {
        image: raw.brandingAssets?.image,
        logo: raw.brandingAssets?.logo,
      },
      operationalMetrics: {
        rating: raw.operationalMetrics?.rating || 5.0,
        availableCourses: raw.operationalMetrics?.availableCourses || [],
        isActive: raw.operationalMetrics?.isActive ?? true,
      },
      operatingHours: {
        mondayToFriday: raw.operatingHours?.mondayToFriday || "08:00 - 17:00",
        saturday: raw.operatingHours?.saturday || "08:00 - 13:00",
        sunday: raw.operatingHours?.sunday || "Closed",
      },
      createdAt: raw.createdAt,
    };
  }

  /**
   * Bulk-maps arrays of branch records safely for local lookups or multi-branch lists
   */
  static transformList(docs: IBranch[]): ISafeBranchResponse[] {
    if (!docs || !Array.isArray(docs)) return [];
    return docs.map((doc) => this.transformToSafeResponse(doc));
  }
}
