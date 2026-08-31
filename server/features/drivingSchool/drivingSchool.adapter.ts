import { IDrivingSchool } from "./drivingSchool.model";

// Strict contract shape for what goes over the public/private network wire
export interface ISafeDrivingSchoolResponse {
  id: string;
  founderId: string;
  ceoOrManager?: string;
  schoolName: string;
  subdomain: string;
  slogan?: string;
  logo?: string;
  businessProfile: {
    registrationNumber: string;
    licenseNo: string;
    registeredAddress: string;
    // Note: Tax numbers are strictly stripped out here for privacy protection
  };
  contactDetails: {
    corporateEmail: string;
    supportPhoneNo: string;
    whatsappInboundNo?: string;
    website?: string;
  };
  platformBilling: {
    tier: string;
    status: string;
  };
  metrics: {
    globalRating: number;
    totalBranchesCount: number;
    totalInstructorsCount: number;
  };
  createdAt: Date;
}

export class DrivingSchoolAdapter {
  /**
   * 🛡️ TRANSFORMATION GUARD: Cleanses a raw driving school database document
   * into a highly secure, network-safe object, stripping out critical platform metadata.
   */
  static transformToSafeResponse(
    doc: IDrivingSchool,
  ): ISafeDrivingSchoolResponse {
    // Handle both hydrated Mongoose documents and lean raw JSON objects smoothly
    const raw = typeof doc.toObject === "function" ? doc.toObject() : doc;

    return {
      id: String(raw._id),
      founderId: String(raw.founder?._id || raw.founder),
      ceoOrManager: raw.ceoOrManager,
      schoolName: raw.schoolName || "",
      subdomain: raw.subdomain || "",
      slogan: raw.slogan,
      logo: raw.logo,
      businessProfile: {
        registrationNumber: raw.businessProfile?.registrationNumber || "",
        licenseNo: raw.businessProfile?.licenseNo || "",
        registeredAddress: raw.businessProfile?.registeredAddress || "",
      },
      contactDetails: {
        corporateEmail: raw.contactDetails?.corporateEmail || "",
        supportPhoneNo: raw.contactDetails?.supportPhoneNo || "",
        whatsappInboundNo: raw.contactDetails?.whatsappInboundNo,
        website: raw.contactDetails?.website,
      },
      platformBilling: {
        tier: raw.platformBilling?.tier || "BASIC",
        status: raw.platformBilling?.status || "PENDING_VERIFICATION",
      },
      metrics: {
        globalRating: raw.metrics?.globalRating || 5.0,
        totalBranchesCount: raw.metrics?.totalBranchesCount || 0,
        totalInstructorsCount: raw.metrics?.totalInstructorsCount || 0,
      },
      createdAt: raw.createdAt,
    };
  }

  /**
   * Bulk-maps arrays of school records safely if needed for public marketplace directories
   */
  static transformList(docs: IDrivingSchool[]): ISafeDrivingSchoolResponse[] {
    if (!docs || !Array.isArray(docs)) return [];
    return docs.map((doc) => this.transformToSafeResponse(doc));
  }
}
