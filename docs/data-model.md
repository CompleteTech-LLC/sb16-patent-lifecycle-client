# Data Model

All primary client types are defined in `src/types.ts`. The model separates the internal portfolio record from linked identifiers, dated lifecycle events, parsed form output, source records, and deadlines.

## Relationship Diagram

![Data model relationships](./data_model_relationships.png)

## PatentMatter

`PatentMatter` is the main client record.

Fields:

- `inventionId`: internal invention-level portfolio key.
- `matterId`: internal matter-level key.
- `inventionDisclosureId`: assignee or company invention disclosure reference.
- `attorneyDocketNumber`: counsel or assignee docket reference.
- `title`: working title for the matter.
- `assignee`: current assignee object.
- `inventors`: normalized inventor list.
- `currentLifecycleStatus`: high-level lifecycle status.
- `expectedExpirationDate`: user-entered or future-calculated expiration date.
- `maintenanceFeeStatus`: user-entered or future-enriched maintenance state.
- `notes`: operator notes and source links.
- `identifiers`: linked internal, USPTO, PCT, and provider identifiers.
- `lifecycleEvents`: dated lifecycle history.
- `sourceRecords`: evidence records supporting extracted or edited data.
- `deadlines`: docketing or watch deadlines.

Required for a usable portfolio record:

- `inventionId`
- `matterId`
- `title`
- at least one source record or manual source note

Required for an official USPTO lifecycle record:

- a USPTO application number, publication number, or patent number after filing or publication
- dated source records supporting status changes

## PatentIdentifier

`PatentIdentifier` rows are the identifier crosswalk.

Fields:

- `id`: client row ID.
- `label`: user-visible label.
- `value`: identifier value.
- `authority`: one of `internal`, `uspto`, `pct`, `family-provider`, or `provider-reference`.
- `source`: source system or operator origin.
- `isOfficialLegalIdentifier`: whether the identifier is treated as an official legal lifecycle identifier.

Official legal identifiers in this prototype:

- provisional application number
- nonprovisional application number
- publication number
- patent number
- PCT number

Non-official but important linked identifiers:

- internal invention ID
- matter ID
- invention disclosure ID
- attorney docket number
- priority claims
- EPO DOCDB family ID
- INPADOC family ID
- Google Patents family or related-publication reference

## LifecycleEvent

`LifecycleEvent` models a dated event in the matter history.

Fields:

- `id`
- `type`
- `label`
- `date`
- `status`: `complete`, `pending`, or `blocked`
- `sourceRecordIds`
- optional `notes`

The app starts with twelve lifecycle events in `makeInitialMatter()`. The first event, `provisional_cover_sheet_parsed`, is completed when a PDF is parsed.

## Inventor

`Inventor` stores normalized inventor fields:

- `id`
- `givenName`
- `familyName`
- `residence`

The parser builds inventors from up to five visible SB/16 inventor rows and drops rows where all inventor fields are blank.

## Assignee

`Assignee` stores ownership-facing information:

- `id`
- `name`
- optional `country`

The current UI exposes assignee name. Future assignment enrichment should attach assignment source records rather than silently overwriting the assignee.

## SourceRecord

`SourceRecord` preserves evidence for data changes.

Fields:

- `id`
- `label`
- `sourceType`: `pdf`, `manual`, `stub`, or `external`
- `capturedAt`
- optional `url`
- optional `rawFieldNames`

For uploaded PDFs, the app records the filename, capture time, source type, and raw field names extracted from the form.

## Deadline

`Deadline` is a watch or docketing item.

Fields:

- `id`
- `label`
- `dueDate`
- `status`: `open`, `satisfied`, `missed`, or `watch`
- `basis`

The first version includes a provisional conversion watch and a maintenance-fee-window watch. Dates are stubs until official filing or grant dates are entered or enriched.

## NormalizedSb16

`NormalizedSb16` is the clean output of the SB/16 parser.

Fields include:

- `inventionTitle`
- `inventors`
- `correspondenceAddress`
- `entityStatus`
- `applicationParts`
- `governmentInterest`
- `signerName`
- `signatureDate`
- `docketNumber`
- `feePaymentMethod`

This object is not the complete patent matter. It is the parsed intake artifact used to seed a `PatentMatter`.

## PdfExtractionResult

`PdfExtractionResult` stores the parser result.

Fields:

- `fileName`
- `hasAcroFormFields`
- `rawFields`
- `normalized`
- `fallbackNeeded`
- `warnings`

`rawFields` preserves original PDF field names. `normalized` gives the client a stable schema. Both are exported so downstream review can compare raw extraction against normalized mapping.

## Source-Of-Truth Rules

- Internal portfolio tracking uses `inventionId` / `matterId` as the master key.
- USPTO records are authoritative for U.S. application status, publications, grants, file history, and maintenance status.
- PCT records are authoritative for PCT identifiers and international phase events.
- Provider family IDs are useful grouping constructs, not legal master keys.
- Manual fields are operator-entered until supported by a `SourceRecord`.
