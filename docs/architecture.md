# Architecture

The prototype is a local browser application built with Vite, React, TypeScript, `pdf-lib`, and `lucide-react`. It has no server component and no external API calls in the first version.

## Runtime Shape

The application entrypoint is `src/main.tsx`. It renders one React app into `#root`, stores all user-visible state in React state, and passes parser output directly into the matter record.

## Architecture Diagram

![Client-side architecture data flow](./architecture_data_flow.png)

Primary runtime state:

- `matter`: a `PatentMatter` object created by `makeInitialMatter()`.
- `extraction`: a `PdfExtractionResult` object initially populated from `blankSb16Sample`.
- `isParsing`: a UI flag used while an uploaded PDF is being parsed.

## Data Flow

1. The user selects a PDF through the upload control.
2. `handlePdf()` receives the `File` object.
3. `extractSb16FromPdf(file)` reads the file as an `ArrayBuffer`.
4. `PDFDocument.load()` loads the document in the browser.
5. `doc.getForm().getFields()` enumerates AcroForm fields.
6. Each field is read into `rawFields` by `readFieldValue()`.
7. `normalizeSb16Fields(rawFields)` maps known PTO/SB/16 field names into `NormalizedSb16`.
8. `validateNormalizedSb16()` creates warnings for missing important intake values.
9. The React state is updated with:
   - the new extraction result,
   - matter title from the invention title when present,
   - attorney docket number when present,
   - inventor list,
   - updated identifier crosswalk values,
   - a completed `provisional_cover_sheet_parsed` lifecycle event,
   - a new `SourceRecord` for the uploaded PDF.
10. The UI panels render from the updated state.
11. `exportJson()` serializes `{ matter, extraction }` to a downloadable JSON file.

## Source File Responsibilities

- `src/types.ts`: shared TypeScript data model.
- `src/parser.ts`: PDF field extraction, SB/16 normalization, and validation.
- `src/sampleData.ts`: blank SB/16 sample data and initial matter factory.
- `src/main.tsx`: React state, upload handling, JSON export, and UI composition.
- `src/styles.css`: layout, panel styling, responsive behavior, and visual system.

## Local-Only Boundary

The first version intentionally keeps the file and extracted data in browser memory. There is no persistence layer, no network upload, and no background sync. This is suitable for prototyping the intake workflow and data model before introducing storage, authentication, or official data integrations.

## State Synchronization

The matter record and identifier crosswalk share values for internal invention ID, matter ID, invention disclosure ID, and attorney docket number. `updateMatterAndIdentifier()` keeps those specific fields synchronized when edited from the Matter Record panel.

The remaining identifiers are edited directly in the Identifier Crosswalk panel. They are stored as `PatentIdentifier` rows so official USPTO identifiers and provider grouping identifiers stay distinct.
