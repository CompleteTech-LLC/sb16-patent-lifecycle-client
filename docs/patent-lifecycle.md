# Patent Lifecycle Model

The prototype models patent tracking as a dated sequence of lifecycle events attached to an internal master matter record. The SB/16 parse is the first event; it is not the whole lifecycle.

## Lifecycle Events In The App

The initial lifecycle contains twelve event rows:

1. Provisional cover sheet parsed
2. Provisional filed
3. Nonprovisional or PCT filed
4. Application published
5. Office action received
6. Response filed
7. Notice of allowance
8. Issue fee paid
9. Patent granted
10. Maintenance fee window opened
11. Maintenance fee paid or missed
12. Patent expired, abandoned, or terminally disclaimed

Each event has:

- a stable event type
- a user-visible label
- an editable date
- status of `complete`, `pending`, or `blocked`
- links to supporting `SourceRecord` IDs

## Provisional Intake

The provisional intake begins when a PTO/SB/16 PDF is parsed. The app records the upload as a source record and marks `provisional_cover_sheet_parsed` complete.

At this stage, the matter may have no official USPTO application number yet. The internal `invention_id` / `matter_id` remains the portfolio key.

## Provisional Filing

After actual filing, the operator should add:

- provisional application number
- filing date
- confirmation number if later modeled
- customer number if later modeled
- filing receipt source record

The provisional filing date is needed for conversion-watch logic.

## Nonprovisional Or PCT Filing

A later nonprovisional or PCT application may claim benefit of the provisional. The application number or PCT number should be added as a linked identifier under the same internal matter or invention family, depending on portfolio policy.

The event should be supported by a filing receipt, Patent Center record, WIPO record, or counsel docket source.

## Publication

When the application publishes, the publication number becomes an official linked identifier. Publication data may also introduce:

- publication date
- published title
- assignee name
- inventors
- classifications
- citations
- family relationships

Publication data should not automatically overwrite internally reviewed values without source and review handling.

## Prosecution

Prosecution events include Office actions, responses, information disclosure statements, interviews, continuations, restrictions, notices, and other file-history events.

The current prototype has one Office action event and one response event. Future versions should support repeated events because prosecution often includes multiple Office actions and responses.

## Allowance And Issue

After allowance, the app tracks:

- notice of allowance
- issue fee payment
- patent grant

Once the patent grants, the patent number becomes an official linked identifier and maintenance-fee tracking may begin for utility patents that require maintenance fees.

## Post-Grant And Maintenance

Post-grant tracking should include:

- maintenance-fee windows
- maintenance-fee payments
- maintenance-fee missed status
- patent term adjustment
- terminal disclaimers
- certificates of correction
- reissue
- reexamination
- PTAB proceedings
- litigation flags
- assignments

The first version includes maintenance fee status as an editable field and a deadline watch stub.

## Expiration, Abandonment, And Terminal Disclaimer

The final lifecycle row covers expiration, abandonment, or terminal disclaimer because these can terminate or limit the practical life of a patent matter.

Expiration should be computed only from authoritative dates and constraints, including filing chain, patent term, maintenance status, patent term adjustment, terminal disclaimer, and any relevant legal events.

## Portfolio Use

Large portfolios should not rely on one event date or one public identifier. They should maintain:

- internal master ID
- linked official identifiers
- source records
- dated lifecycle events
- deadline records
- current status
- audit notes

This enables many applications, continuations, publications, grants, and family references to remain connected without treating any one external identifier as the only record.
