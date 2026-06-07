# UI Guide

The application is a working portfolio intake surface. It is not a landing page. The first screen is the operator workspace.

## UI Surface Map

![UI surface map](./ui_surface_map.png)

## Left Rail

The left rail contains the intake controls and parser state.

### PDF Upload

The upload panel accepts a PDF file. When a user selects a PTO/SB/16 PDF, the app parses it in the browser. AcroForm fields are preferred. If no form fields are found, the parser returns a fallback-needed state.

### Export JSON

The export button downloads the current state as JSON. The payload includes both:

- `matter`
- `extraction`

This preserves the normalized patent matter and the raw parser result.

### Parser State

The parser state card shows:

- filename
- whether AcroForm fields were detected
- raw field count
- warning count
- warning details

Warnings are intake-quality signals. They do not prevent export.

## Header

The header shows the internal master record and high-level metrics.

Editable title:

- seeded from the parsed invention title when present
- defaults to `Untitled provisional intake`

Metrics:

- lifecycle completed count out of twelve
- number of populated official identifiers
- source-record count

## Matter Record Panel

The Matter Record panel exposes editable core record fields:

- internal invention ID
- matter ID
- invention disclosure ID
- attorney docket number
- assignee
- expected expiration date
- maintenance fee status
- current lifecycle status

Edits to internal invention ID, matter ID, invention disclosure ID, and attorney docket number are synchronized into the identifier crosswalk.

## Identifier Crosswalk Panel

The Identifier Crosswalk panel lists every linked identifier as a row with:

- label
- editable value
- authority badge

Official legal identifiers are visually distinguished from internal and provider identifiers.

The panel includes the core rule: USPTO application, publication, and patent numbers are official lifecycle identifiers; provider family IDs are grouping signals, not legal source-of-truth keys.

## Lifecycle Timeline Panel

The lifecycle timeline contains twelve rows. Each row has:

- sequence number
- event label
- editable date
- status selector

Statuses:

- `complete`
- `pending`
- `blocked`

The first event is completed when a PDF is parsed.

## Extracted Fields Panel

The Extracted Fields panel displays raw PDF field names and values from `PdfExtractionResult.rawFields`.

Purpose:

- audit exact PDF field names
- compare raw extraction against normalized mapping
- identify blank fields
- detect form version changes

## Normalized JSON Panel

The Normalized JSON panel displays `PdfExtractionResult.normalized`.

Purpose:

- inspect stable client fields
- verify the mapping from ugly PDF field names
- support future API, storage, or test fixture work

## Deadlines And Enrichment Stubs Panel

The deadlines section currently includes:

- 12-month provisional conversion watch
- maintenance fee windows watch

The enrichment stub chips identify future integration areas:

- USPTO Patent Center / Open Data
- Google Patents
- EPO family data
- PatentsView
- maintenance fee status
- assignment data

## Notes And Source Links Panel

This panel stores operator notes, source links, review comments, and assumptions. It also lists source records such as uploaded PDFs and sample records.

Future implementations should treat notes as audit context, not as a substitute for authoritative source records.
