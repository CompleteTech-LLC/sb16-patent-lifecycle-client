# Implementation Notes

This project is a Vite, React, and TypeScript client application. It currently runs entirely in the browser.

## Key Files

- `index.html`: Vite HTML entrypoint.
- `src/main.tsx`: React app, state management, UI panels, PDF upload handler, and JSON export.
- `src/parser.ts`: browser-side PDF parsing, SB/16 normalization, and validation.
- `src/types.ts`: TypeScript interfaces and union types.
- `src/sampleData.ts`: blank SB/16 sample extraction and initial matter factory.
- `src/styles.css`: visual system, responsive layout, panels, tables, timeline, and form controls.
- `pdf/sb0016_2.pdf`: blank USPTO PTO/SB/16 PDF used as a reference sample.
- `docs/*.mmd`: editable Mermaid source diagrams.
- `docs/*.png`: high-resolution rendered diagrams embedded in the Markdown documentation.

## Dependencies

Runtime dependencies:

- `react`
- `react-dom`
- `pdf-lib`
- `lucide-react`
- `vite`
- `@vitejs/plugin-react`

Development dependencies:

- `typescript`
- React type packages

`pdf-lib` is included in the browser bundle so the app can parse AcroForm fields locally.

## Parser Utilities

`extractSb16FromPdf(file)` is the main parser entrypoint.

It returns `PdfExtractionResult`:

- uploaded filename
- AcroForm detection flag
- raw field map
- normalized SB/16 object
- fallback-needed flag
- warnings

`readFieldValue()` handles text fields, checkboxes, radio groups, and dropdowns.

`normalizeSb16Fields()` maps exact SB/16 field names into stable client fields.

`validateNormalizedSb16()` performs basic intake-quality checks.

## State Management

The app uses React `useState`.

State objects:

- `matter`: the editable patent matter lifecycle record.
- `extraction`: the current parser output.
- `isParsing`: upload parsing UI state.

There is no global store, router, backend, or persistence layer.

## Upload Handling

`handlePdf()`:

1. receives the selected file
2. calls `extractSb16FromPdf()`
3. stores the extraction result
4. updates title, docket number, inventors, and identifier crosswalk values
5. completes the provisional cover sheet parsed lifecycle event
6. adds a new source record for the uploaded PDF

## JSON Export

`exportJson()` creates a browser `Blob`, serializes `{ matter, extraction }`, and triggers a download named from `matter.inventionId`.

The export includes both raw and normalized parser data because the raw form evidence is needed for audit and remapping.

## Local-Only Behavior

The app does not call external APIs. The following are only displayed as future enrichment stubs:

- USPTO Patent Center / Open Data
- Google Patents
- EPO family data
- PatentsView
- maintenance fee status
- assignment data

## Build Commands

Development server:

```powershell
npm run dev
```

Production build:

```powershell
npm run build
```

The build script runs TypeScript compilation and Vite bundling.

## Bundle-Size Consideration

The production build may warn that the client bundle is larger than 500 kB. This is expected in the prototype because `pdf-lib` is bundled into the client.

Future optimization options:

- dynamically import the parser only when a PDF is uploaded
- split PDF parsing into a separate chunk
- use a web worker for parsing
- defer enrichment modules until needed

## Implementation Constraints

- Keep parser mapping explicit and reviewable.
- Preserve raw field names.
- Keep internal IDs separate from official and provider identifiers.
- Treat provider family identifiers as grouping signals.
- Add source records for future external enrichment.
- Do not introduce API calls without documenting source authority and update behavior.
