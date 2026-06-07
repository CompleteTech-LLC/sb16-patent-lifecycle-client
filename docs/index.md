# Documentation Index

This directory documents the client-side patent intake and lifecycle tracking prototype.

## Core Documents

- [README.md](./README.md): overview, purpose, audience, scope, and local run commands.
- [architecture.md](./architecture.md): client architecture and data flow from PDF upload through JSON export.
- [data-model.md](./data-model.md): TypeScript model definitions and source-of-truth rules.
- [sb16-form-parsing.md](./sb16-form-parsing.md): AcroForm extraction, normalization, blank-form handling, and fallbacks.
- [patent-lifecycle.md](./patent-lifecycle.md): lifecycle events from provisional intake through expiration or abandonment.
- [identifier-strategy.md](./identifier-strategy.md): internal master IDs, USPTO identifiers, family identifiers, and portfolio use.
- [ui-guide.md](./ui-guide.md): UI sections and operator workflow.
- [validation-and-quality.md](./validation-and-quality.md): validation rules, auditability, export checks, and known limits.
- [future-enrichment.md](./future-enrichment.md): future external data integrations and enrichment paths.
- [implementation-notes.md](./implementation-notes.md): source files, parser utilities, state management, build notes, and dependencies.

## Diagram Assets

- [patent_portfolio_lifecycle_identifiers.mmd](./patent_portfolio_lifecycle_identifiers.mmd): editable Mermaid diagram source.
- [patent_portfolio_lifecycle_identifiers.png](./patent_portfolio_lifecycle_identifiers.png): high-resolution rendered diagram.

## Reading Order

1. Start with [README.md](./README.md).
2. Read [identifier-strategy.md](./identifier-strategy.md) before designing portfolio storage.
3. Read [data-model.md](./data-model.md) and [architecture.md](./architecture.md) before editing code.
4. Read [sb16-form-parsing.md](./sb16-form-parsing.md) before modifying parser behavior.
5. Read [future-enrichment.md](./future-enrichment.md) before connecting external data sources.
