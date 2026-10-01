# sb16-patent-lifecycle-client

Browser-only prototype (React, TypeScript, Vite) for patent matter intake. It reads a USPTO PTO/SB/16 provisional application cover sheet PDF in the browser with `pdf-lib`, extracts the AcroForm fields, normalizes them to JSON, and records the parse as the first event in a patent matter lifecycle. The PDF is not sent to a server.

It is a prototype, not a filing system, docketing system, USPTO integration, or legal advice.

## Run

```bash
npm install
npm run dev      # serves on 127.0.0.1
npm run build    # tsc then vite build
```

## Layout

- `src/` - app code (`main.tsx`, `parser.ts`, `types.ts`, `sampleData.ts`).
- `docs/` - architecture, data model, lifecycle, identifier strategy, SB16 parsing, UI guide, and validation notes; start at `docs/README.md`.
- `pdf/` - a sample SB/16 PDF (`sb0016_2.pdf`).
