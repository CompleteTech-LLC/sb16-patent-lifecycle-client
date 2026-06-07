# Future Enrichment

The first version is deliberately local and API-free. Future work should enrich the matter record by adding external source records and linked identifiers without replacing the internal master key.

## Enrichment Roadmap

![Future enrichment roadmap](./future_enrichment_roadmap.png)

## USPTO Patent Center / Open Data

Future USPTO enrichment should add:

- application number lookup
- filing date
- application status
- transaction history
- file history documents
- publication number
- patent number
- correspondence and customer number context if appropriate
- patent term adjustment data if available

USPTO records are authoritative for U.S. application status, file history, publications, grants, and maintenance status.

## Google Patents

Google Patents enrichment can support:

- patent family discovery
- related publications
- citation discovery
- classification discovery
- prior art review
- public patent document links

Google Patents should be treated as a discovery and grouping source, not as the legal source of truth for U.S. prosecution or maintenance status.

## Google Scholar

Google Scholar-style signals can help with:

- non-patent literature discovery
- scholarly citation context
- inventor and assignee research

These signals are research context, not legal status evidence.

## EPO DOCDB And INPADOC

EPO family data can support:

- simple family grouping
- extended family grouping
- foreign counterpart discovery
- priority-chain review
- publication clustering

Family identifiers should be stored as provider identifiers linked to the internal master ID. They should not become the primary portfolio key.

## PatentsView

PatentsView-style data can support:

- patent metadata
- assignee analysis
- inventor analysis
- technology classification analysis
- portfolio-level reporting

PatentsView data is useful for analytics but should be reconciled against official records for matter operations.

## Assignment Data

Assignment enrichment should add:

- recorded assignment events
- reel/frame or equivalent references if applicable
- assignor
- assignee
- execution date
- recordation date
- source link

Assignments should create source records and lifecycle or ownership events rather than silently overwriting current assignee values.

## Maintenance Fee Status

Maintenance enrichment should add:

- fee windows
- payment status
- surcharge periods
- expiration risk
- payment source records

Maintenance status should be tied to the patent number and grant date. It should not be inferred only from internal notes.

## Expiration Calculation

Expiration calculation should account for:

- application filing date
- priority and benefit claims
- patent type
- issue date
- patent term adjustment
- terminal disclaimer
- maintenance fee payment or nonpayment
- statutory or exceptional adjustments
- reissue or correction effects if relevant

The app should label calculated expiration as expected until verified against authoritative source records.

## OCR And Coordinate Extraction

For flattened or scanned PDFs, future fallback paths should include:

- PDF page rendering
- OCR text extraction
- coordinate-based region extraction for known form layouts
- confidence scores
- operator review before accepting normalized values

Fallback extraction should still preserve raw evidence and produce the same `PdfExtractionResult` shape.

## Persistence And Collaboration

Future persistence should add:

- saved matters
- user identity
- file storage
- immutable file hashes
- review status
- change history
- role-based access
- portfolio filters
- import/export jobs

Every enrichment source should create or update `SourceRecord` entries so the app can explain where values came from.
