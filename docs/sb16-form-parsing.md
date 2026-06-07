# PTO/SB/16 Form Parsing

The app parses the USPTO PTO/SB/16 provisional application cover sheet as a fillable PDF. The current parser is optimized for AcroForm PDFs, including the blank `pdf/sb0016_2.pdf` file in this project.

## Parser Decision Tree

![SB/16 parser decision tree](./sb16_parser_decision_tree.png)

## AcroForm Extraction

`src/parser.ts` uses `pdf-lib`:

1. Read the uploaded `File` as an `ArrayBuffer`.
2. Load the PDF with `PDFDocument.load(bytes, { ignoreEncryption: true })`.
3. Access the form with `doc.getForm()`.
4. Enumerate fields with `form.getFields()`.
5. Store each field name and value in `rawFields`.

Supported field classes:

- `PDFTextField`: read with `getText()`.
- `PDFCheckBox`: read as `checked` or blank.
- `PDFRadioGroup`: read with `getSelected()`.
- `PDFDropdown`: read with `getSelected().join(", ")`.

Unknown field types are preserved only as blank values in the first version.

## Raw Field Preservation

The parser keeps the PDF field names exactly as returned by the form. Examples from the SB/16 file include:

- `TITLE OF THE INVENTION 500 characters maxRow1`
- `Given Name first and middle if anyRow1`
- `Family Name or SurnameRow1`
- `Residence City and either State or Foreign CountryRow1`
- `Firm or Individual Name`
- `TYPED OR PRINTED NAME`
- `DOCKET NUMBER`

This raw map is important because USPTO form field names are not always clean client schema names. Preserving them allows audit, remapping, and regression checks when a form version changes.

## Normalized Mapping

`normalizeSb16Fields()` maps known raw fields into `NormalizedSb16`.

Mapped groups:

- invention title
- inventor rows
- correspondence address
- entity status
- application parts
- government-interest fields
- signer name
- signature date
- docket number
- fee-payment method

Inventor rows are generated from rows 1 through 5. Blank rows are dropped.

Entity status is derived from checkbox fields:

- `Check Box37`: small entity
- `Check Box38`: micro entity
- neither checked: undisclosed

Fee payment method is derived from checkboxes and deposit-account text:

- `Check Box39`: check or money order
- `Check Box40`: credit card PTO-2038
- `Account Number`: deposit account

## Blank-Form Handling

The included blank SB/16 PDF has AcroForm fields but no user-entered values. That is still a successful form extraction because the parser can detect the fields and expose the mapping.

The sample data in `src/sampleData.ts` represents this state:

- `hasAcroFormFields: true`
- `fallbackNeeded: false`
- `warnings: ["Blank form sample: required fields are available but not filled."]`

## Validation Warnings

`validateNormalizedSb16()` currently warns when:

- invention title is missing
- no inventors were extracted
- attorney docket number is missing
- signer name is missing

These warnings are intake-quality warnings, not legal determinations. A missing field may be acceptable in a draft or blank form but should be reviewed before relying on the record.

## Flattened Or Scanned PDFs

If `form.getFields()` returns no fields, the parser sets:

- `hasAcroFormFields: false`
- `fallbackNeeded: true`
- warning: `No AcroForm fields were found. Use OCR or coordinate extraction fallback.`

The first version does not implement OCR or coordinate extraction. Future fallback paths should preserve the same output contract: raw extraction evidence plus normalized client fields.

## Repeatability Requirements

For repeatable extraction:

- keep raw field names in exported JSON
- keep normalized mappings explicit in code
- treat checkbox field names as version-specific
- test against blank, filled, flattened, and scanned samples
- record the PDF filename and capture time as a `SourceRecord`
- do not overwrite operator edits without source evidence
