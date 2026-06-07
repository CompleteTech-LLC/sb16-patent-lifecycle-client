# Patent Matter Intake Documentation

This prototype is a client-side patent intake and lifecycle tracking tool. It starts with a USPTO PTO/SB/16 provisional application cover sheet PDF, extracts fillable AcroForm fields in the browser, normalizes the extracted values into JSON, and records that parse as the first event in a patent matter lifecycle.

The app is designed for patent operations users, IP counsel, portfolio managers, and implementation agents who need a repeatable intake model for many patent matters. It is not a filing system, legal docketing system, USPTO data integration, annuity payment service, or source of legal advice.

## Visual Overview

![Patent portfolio lifecycle identifier strategy](./patent_portfolio_lifecycle_identifiers.png)

![Client-side architecture data flow](./architecture_data_flow.png)

## What The Prototype Does

- Accepts a PDF upload from the browser.
- Uses `pdf-lib` to read AcroForm fields without sending the file to a server.
- Preserves raw PDF field names and values.
- Maps recognized PTO/SB/16 fields into a normalized `NormalizedSb16` object.
- Creates a `PatentMatter` record with an internal invention ID and matter ID.
- Tracks identifiers in a crosswalk rather than replacing internal IDs with external IDs.
- Models twelve lifecycle events from provisional cover sheet parsing through expiration, abandonment, or terminal disclaimer.
- Shows parser state, warnings, extracted fields, normalized JSON, lifecycle timeline, identifier crosswalk, deadlines, source records, notes, and enrichment stubs.
- Exports the current client-side state as JSON.

## What It Does Not Do

- It does not call USPTO, Google, EPO, PatentsView, assignment, maintenance-fee, or annuity APIs.
- It does not calculate patent term, patent term adjustment, terminal disclaimer effects, or expiration with legal certainty.
- It does not OCR scanned or flattened PDFs in the first version.
- It does not submit filings to the USPTO.
- It does not replace a docketing system.
- It does not determine inventorship, ownership, validity, infringement, or enforceability.

## Identifier Principle

The internal `invention_id` / `matter_id` is the master portfolio key. USPTO application numbers, publication numbers, patent numbers, PCT numbers, and provider family IDs are linked identifiers attached to that master record.

USPTO identifiers are authoritative for U.S. application status, file history, publications, grants, and maintenance status. Provider family IDs from Google Patents, EPO DOCDB, INPADOC, or similar systems are useful grouping constructs, but they are not legal master keys.

## Run Locally

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Build the production bundle:

```powershell
npm run build
```

The app was built as a Vite, React, and TypeScript client project.

## Documentation Index

See [index.md](./index.md) for the full documentation set.
