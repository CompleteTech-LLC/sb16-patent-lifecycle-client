export type IdentifierAuthority = "internal" | "uspto" | "pct" | "family-provider" | "provider-reference";

export type LifecycleStatus =
  | "intake"
  | "provisional-filed"
  | "nonprovisional-filed"
  | "published"
  | "in-prosecution"
  | "allowed"
  | "granted"
  | "maintenance"
  | "expired"
  | "abandoned";

export type LifecycleEventType =
  | "provisional_cover_sheet_parsed"
  | "provisional_filed"
  | "nonprovisional_or_pct_filed"
  | "application_published"
  | "office_action_received"
  | "response_filed"
  | "notice_of_allowance"
  | "issue_fee_paid"
  | "patent_granted"
  | "maintenance_fee_window_opened"
  | "maintenance_fee_paid_or_missed"
  | "patent_expired_abandoned_or_terminally_disclaimed";

export interface Inventor {
  id: string;
  givenName: string;
  familyName: string;
  residence: string;
}

export interface Assignee {
  id: string;
  name: string;
  country?: string;
}

export interface PatentIdentifier {
  id: string;
  label: string;
  value: string;
  authority: IdentifierAuthority;
  source: string;
  isOfficialLegalIdentifier: boolean;
}

export interface LifecycleEvent {
  id: string;
  type: LifecycleEventType;
  label: string;
  date: string;
  status: "complete" | "pending" | "blocked";
  sourceRecordIds: string[];
  notes?: string;
}

export interface SourceRecord {
  id: string;
  label: string;
  sourceType: "pdf" | "manual" | "stub" | "external";
  capturedAt: string;
  url?: string;
  rawFieldNames?: string[];
}

export interface Deadline {
  id: string;
  label: string;
  dueDate: string;
  status: "open" | "satisfied" | "missed" | "watch";
  basis: string;
}

export interface CorrespondenceAddress {
  firmOrIndividualName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  telephone: string;
  email: string;
}

export interface NormalizedSb16 {
  inventionTitle: string;
  inventors: Inventor[];
  correspondenceAddress: CorrespondenceAddress;
  entityStatus: "undisclosed" | "small" | "micro";
  applicationParts: {
    applicationDataSheet: boolean;
    drawings: boolean;
    drawingSheetCount: string;
    specificationPageCount: string;
    cds: boolean;
    cdCount: string;
    other: string;
  };
  governmentInterest: {
    madeByGovernment: boolean;
    madeUnderContract: boolean;
    agencyName: string;
    contractNumber: string;
  };
  signerName: string;
  signatureDate: string;
  docketNumber: string;
  feePaymentMethod: string;
}

export interface PdfExtractionResult {
  fileName: string;
  hasAcroFormFields: boolean;
  rawFields: Record<string, string>;
  normalized: NormalizedSb16;
  fallbackNeeded: boolean;
  warnings: string[];
}

export interface PatentMatter {
  inventionId: string;
  matterId: string;
  inventionDisclosureId: string;
  attorneyDocketNumber: string;
  title: string;
  assignee: Assignee;
  inventors: Inventor[];
  currentLifecycleStatus: LifecycleStatus;
  expectedExpirationDate: string;
  maintenanceFeeStatus: string;
  notes: string;
  identifiers: PatentIdentifier[];
  lifecycleEvents: LifecycleEvent[];
  sourceRecords: SourceRecord[];
  deadlines: Deadline[];
}
