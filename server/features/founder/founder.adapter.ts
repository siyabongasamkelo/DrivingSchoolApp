import { IFounder } from "./founder.model";

// Strict contract shape for what goes over the network wire
export interface ISafeFounderResponse {
  id: string;
  drivingSchool: string;
  managedBranches: string[];
  profile: {
    fullName: string;
    email: string;
    contactNo: string;
    whatsAppNo: string;
    address: string;
    gender: string;
    image?: string;
  };
  administrativeControl: {
    accountStatus: string;
    isMasterFounder: boolean;
  };
  createdAt: Date;
}

export class FounderAdapter {
  /**
   * 🛡️ TRANSFORMATION GUARD: Cleanses a raw founder database document
   * into a secure, network-safe object, stripping out private identification assets.
   */
  static transformToSafeResponse(doc: IFounder): ISafeFounderResponse {
    // Handle both hydrated Mongoose documents and lean raw JSON objects smoothly
    const raw = typeof doc.toObject === "function" ? doc.toObject() : doc;

    return {
      id: String(raw._id),
      drivingSchool: String(raw.drivingSchool?._id || raw.drivingSchool),
      managedBranches: Array.isArray(raw.managedBranches)
        ? raw.managedBranches.map((b: any) => String(b._id || b))
        : [],
      profile: {
        fullName: raw.profile?.fullName || "",
        email: raw.profile?.email || "",
        contactNo: raw.profile?.contactNo || "",
        whatsAppNo: raw.profile?.whatsAppNo || "",
        address: raw.profile?.address || "",
        gender: raw.profile?.gender || "",
        image: raw.profile?.image,
      },
      administrativeControl: {
        accountStatus:
          raw.administrativeControl?.accountStatus || "PENDING_VERIFICATION",
        isMasterFounder: raw.administrativeControl?.isMasterFounder ?? true,
      },
      createdAt: raw.createdAt,
    };
  }

  /**
   * Bulk-maps arrays of founder records safely if needed for high-level indexes
   */
  static transformList(docs: IFounder[]): ISafeFounderResponse[] {
    if (!docs || !Array.isArray(docs)) return [];
    return docs.map((doc) => this.transformToSafeResponse(doc));
  }
}
