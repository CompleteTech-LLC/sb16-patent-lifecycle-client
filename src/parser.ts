import { PDFCheckBox, PDFDocument, PDFDropdown, PDFRadioGroup, PDFTextField } from "pdf-lib";
import type { Inventor, NormalizedSb16, PdfExtractionResult } from "./types";

const text = (fields: Record<string, string>, name: string) => fields[name]?.trim() ?? "";
const checked = (fields: Record<string, string>, name: string) => {
  const value = fields[name]?.trim().toLowerCase();
  return Boolean(value && value !== "off" && value !== "false" && value !== "0");
};

export async function extractSb16FromPdf(file: File): Promise<PdfExtractionResult> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const form = doc.getForm();
  const fields = form.getFields();
  const rawFields: Record<string, string> = {};

  for (const field of fields) {
    rawFields[field.getName()] = readFieldValue(field);
  }

  const hasAcroFormFields = fields.length > 0;
  const normalized = normalizeSb16Fields(rawFields);
  const warnings = validateNormalizedSb16(normalized);

  return {
    fileName: file.name,
    hasAcroFormFields,
    rawFields,
    normalized,
    fallbackNeeded: !hasAcroFormFields,
    warnings: hasAcroFormFields ? warnings : ["No AcroForm fields were found. Use OCR or coordinate extraction fallback."],
  };
}

function readFieldValue(field: ReturnType<ReturnType<PDFDocument["getForm"]>["getFields"]>[number]) {
  if (field instanceof PDFTextField) return field.getText() ?? "";
  if (field instanceof PDFCheckBox) return field.isChecked() ? "checked" : "";
  if (field instanceof PDFRadioGroup) return field.getSelected() ?? "";
  if (field instanceof PDFDropdown) return field.getSelected().join(", ");
  return "";
}

export function normalizeSb16Fields(fields: Record<string, string>): NormalizedSb16 {
  const inventors: Inventor[] = Array.from({ length: 5 }, (_, index) => {
    const row = index + 1;
    return {
      id: `inventor-${row}`,
      givenName: text(fields, `Given Name first and middle if anyRow${row}`),
      familyName: text(fields, `Family Name or SurnameRow${row}`),
      residence: text(fields, `Residence City and either State or Foreign CountryRow${row}`),
    };
  }).filter((inventor) => inventor.givenName || inventor.familyName || inventor.residence);

  const entityStatus = checked(fields, "Check Box37") ? "small" : checked(fields, "Check Box38") ? "micro" : "undisclosed";
  const feePaymentMethod = checked(fields, "Check Box39")
    ? "check_or_money_order"
    : checked(fields, "Check Box40")
      ? "credit_card_pto_2038"
      : text(fields, "Account Number")
        ? "deposit_account"
        : "";

  return {
    inventionTitle: text(fields, "TITLE OF THE INVENTION 500 characters maxRow1"),
    inventors,
    correspondenceAddress: {
      firmOrIndividualName: text(fields, "Firm or Individual Name"),
      address: text(fields, "Address"),
      city: text(fields, "City"),
      state: text(fields, "State"),
      zip: text(fields, "Zip"),
      country: text(fields, "Country"),
      telephone: text(fields, "Telephone"),
      email: text(fields, "Email"),
    },
    entityStatus,
    applicationParts: {
      applicationDataSheet: checked(fields, "Check Box41"),
      drawings: checked(fields, "Check Box42"),
      drawingSheetCount: text(fields, "Number of Sheets"),
      specificationPageCount: text(fields, "Number of Pages"),
      cds: checked(fields, "Check Box43"),
      cdCount: text(fields, "CDs Number of CDs"),
      other: text(fields, "Other specify"),
    },
    governmentInterest: {
      madeByGovernment: checked(fields, "Check Box50"),
      madeUnderContract: checked(fields, "Check Box51"),
      agencyName: [text(fields, "Yes the invention was made by an agency of the US Government The US Government agency name is 1"), text(fields, "Yes the invention was made by an agency of the US Government The US Government agency name is 2")]
        .filter(Boolean)
        .join(" "),
      contractNumber: [text(fields, "Government contract number are 1"), text(fields, "Government contract number are 2")]
        .filter(Boolean)
        .join(" "),
    },
    signerName: text(fields, "TYPED OR PRINTED NAME"),
    signatureDate: text(fields, "DATE"),
    docketNumber: text(fields, "DOCKET NUMBER"),
    feePaymentMethod,
  };
}

export function validateNormalizedSb16(normalized: NormalizedSb16) {
  const warnings: string[] = [];
  if (!normalized.inventionTitle) warnings.push("Missing invention title.");
  if (normalized.inventors.length === 0) warnings.push("No inventors were extracted.");
  if (!normalized.docketNumber) warnings.push("No attorney docket number was extracted.");
  if (!normalized.signerName) warnings.push("No signer name was extracted.");
  return warnings;
}
