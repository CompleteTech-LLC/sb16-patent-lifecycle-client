import React from "react";
import { createRoot } from "react-dom/client";
import { AlertTriangle, CheckCircle2, Database, Download, FileJson, FileText, Landmark, Link2, Upload, Workflow } from "lucide-react";
import { extractSb16FromPdf } from "./parser";
import { blankSb16Sample, makeInitialMatter } from "./sampleData";
import type { LifecycleEvent, PatentIdentifier, PatentMatter, PdfExtractionResult } from "./types";
import "./styles.css";

const today = new Date().toISOString().slice(0, 10);

function App() {
  const [matter, setMatter] = React.useState<PatentMatter>(() => makeInitialMatter());
  const [extraction, setExtraction] = React.useState<PdfExtractionResult>(blankSb16Sample);
  const [isParsing, setIsParsing] = React.useState(false);

  const updateMatter = <K extends keyof PatentMatter>(key: K, value: PatentMatter[K]) => {
    setMatter((current) => ({ ...current, [key]: value }));
  };

  const updateMatterAndIdentifier = <K extends keyof PatentMatter>(key: K, value: PatentMatter[K], identifierId: string) => {
    setMatter((current) => ({
      ...current,
      [key]: value,
      identifiers: current.identifiers.map((identifier) => (identifier.id === identifierId ? { ...identifier, value: String(value) } : identifier)),
    }));
  };

  const updateIdentifier = (id: string, value: string) => {
    setMatter((current) => ({
      ...current,
      identifiers: current.identifiers.map((identifier) => (identifier.id === id ? { ...identifier, value } : identifier)),
    }));
  };

  const updateEvent = (id: string, patch: Partial<LifecycleEvent>) => {
    setMatter((current) => ({
      ...current,
      lifecycleEvents: current.lifecycleEvents.map((event) => (event.id === id ? { ...event, ...patch } : event)),
    }));
  };

  const handlePdf = async (file?: File) => {
    if (!file) return;
    setIsParsing(true);
    try {
      const result = await extractSb16FromPdf(file);
      setExtraction(result);
      setMatter((current) => {
        const sourceId = `source-${Date.now()}`;
        const docket = result.normalized.docketNumber;
        return {
          ...current,
          title: result.normalized.inventionTitle || current.title,
          attorneyDocketNumber: docket || current.attorneyDocketNumber,
          inventors: result.normalized.inventors,
          identifiers: current.identifiers.map((identifier) => {
            if (identifier.id === "attorney-docket") return { ...identifier, value: docket };
            if (identifier.id === "internal-invention") return { ...identifier, value: current.inventionId };
            if (identifier.id === "matter") return { ...identifier, value: current.matterId };
            return identifier;
          }),
          lifecycleEvents: current.lifecycleEvents.map((event) =>
            event.type === "provisional_cover_sheet_parsed"
              ? { ...event, date: today, status: "complete", sourceRecordIds: [sourceId], notes: `${file.name} parsed in browser.` }
              : event,
          ),
          sourceRecords: [
            {
              id: sourceId,
              label: file.name,
              sourceType: "pdf",
              capturedAt: new Date().toISOString(),
              rawFieldNames: Object.keys(result.rawFields),
            },
            ...current.sourceRecords,
          ],
        };
      });
    } finally {
      setIsParsing(false);
    }
  };

  const exportJson = () => {
    const payload = JSON.stringify({ matter, extraction }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${matter.inventionId || "patent-matter"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const completed = matter.lifecycleEvents.filter((event) => event.status === "complete").length;
  const officialIdentifiers = matter.identifiers.filter((identifier) => identifier.isOfficialLegalIdentifier);
  const providerIdentifiers = matter.identifiers.filter((identifier) => !identifier.isOfficialLegalIdentifier);

  return (
    <main className="app-shell">
      <section className="workspace">
        <aside className="left-rail">
          <div className="brand-lockup">
            <Landmark aria-hidden />
            <div>
              <p>Patent Matter Intake</p>
              <span>SB/16 to lifecycle record</span>
            </div>
          </div>

          <label className="upload-panel">
            <Upload aria-hidden />
            <strong>{isParsing ? "Parsing PDF..." : "Upload PTO/SB/16 PDF"}</strong>
            <span>AcroForm fields are extracted in-browser. Flattened files trigger the fallback state.</span>
            <input type="file" accept="application/pdf" onChange={(event) => void handlePdf(event.target.files?.[0])} />
          </label>

          <button className="export-button" type="button" onClick={exportJson}>
            <Download aria-hidden />
            Export JSON
          </button>

          <div className="source-card">
            <p className="eyebrow">Parser State</p>
            <div className="source-state">
              {extraction.hasAcroFormFields ? <CheckCircle2 aria-hidden /> : <AlertTriangle aria-hidden />}
              <span>{extraction.hasAcroFormFields ? "AcroForm fields detected" : "Fallback needed"}</span>
            </div>
            <dl>
              <div><dt>File</dt><dd>{extraction.fileName}</dd></div>
              <div><dt>Raw fields</dt><dd>{Object.keys(extraction.rawFields).length}</dd></div>
              <div><dt>Warnings</dt><dd>{extraction.warnings.length}</dd></div>
            </dl>
            {extraction.warnings.length > 0 && (
              <ul className="warning-list">
                {extraction.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <section className="main-board">
          <header className="matter-header">
            <div>
              <p className="eyebrow">Internal master record</p>
              <input className="title-input" value={matter.title} onChange={(event) => updateMatter("title", event.target.value)} />
            </div>
            <div className="metric-strip">
              <Metric label="Lifecycle" value={`${completed}/12`} />
              <Metric label="Official IDs" value={String(officialIdentifiers.filter((id) => id.value).length)} />
              <Metric label="Sources" value={String(matter.sourceRecords.length)} />
            </div>
          </header>

          <section className="control-grid">
            <Panel icon={<Database aria-hidden />} title="Matter Record">
              <div className="field-grid">
                <TextField label="Internal invention ID" value={matter.inventionId} onChange={(value) => updateMatterAndIdentifier("inventionId", value, "internal-invention")} />
                <TextField label="Matter ID" value={matter.matterId} onChange={(value) => updateMatterAndIdentifier("matterId", value, "matter")} />
                <TextField label="Invention disclosure ID" value={matter.inventionDisclosureId} onChange={(value) => updateMatterAndIdentifier("inventionDisclosureId", value, "disclosure")} />
                <TextField label="Attorney docket number" value={matter.attorneyDocketNumber} onChange={(value) => updateMatterAndIdentifier("attorneyDocketNumber", value, "attorney-docket")} />
                <TextField label="Assignee" value={matter.assignee.name} onChange={(value) => updateMatter("assignee", { ...matter.assignee, name: value })} />
                <TextField label="Expected expiration date" type="date" value={matter.expectedExpirationDate} onChange={(value) => updateMatter("expectedExpirationDate", value)} />
                <TextField label="Maintenance fee status" value={matter.maintenanceFeeStatus} onChange={(value) => updateMatter("maintenanceFeeStatus", value)} />
                <label className="select-field">
                  <span>Current lifecycle status</span>
                  <select value={matter.currentLifecycleStatus} onChange={(event) => updateMatter("currentLifecycleStatus", event.target.value as PatentMatter["currentLifecycleStatus"])}>
                    {["intake", "provisional-filed", "nonprovisional-filed", "published", "in-prosecution", "allowed", "granted", "maintenance", "expired", "abandoned"].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>
            </Panel>

            <Panel icon={<Link2 aria-hidden />} title="Identifier Crosswalk">
              <IdentifierTable identifiers={matter.identifiers} onChange={updateIdentifier} />
              <div className="identifier-note">
                USPTO application, publication, and patent numbers are official lifecycle identifiers. Provider family IDs are grouping signals, not legal source-of-truth keys.
              </div>
            </Panel>
          </section>

          <section className="three-column">
            <Panel icon={<Workflow aria-hidden />} title="Lifecycle Timeline">
              <div className="timeline">
                {matter.lifecycleEvents.map((event, index) => (
                  <div className="timeline-row" key={event.id}>
                    <span className={`timeline-index ${event.status}`}>{index + 1}</span>
                    <div>
                      <strong>{event.label}</strong>
                      <input type="date" value={event.date} onChange={(change) => updateEvent(event.id, { date: change.target.value })} />
                    </div>
                    <select value={event.status} onChange={(change) => updateEvent(event.id, { status: change.target.value as LifecycleEvent["status"] })}>
                      <option value="complete">complete</option>
                      <option value="pending">pending</option>
                      <option value="blocked">blocked</option>
                    </select>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel icon={<FileText aria-hidden />} title="Extracted Fields">
              <div className="raw-table">
                {Object.entries(extraction.rawFields).slice(0, 58).map(([name, value]) => (
                  <div key={name}>
                    <span title={name}>{name}</span>
                    <strong>{value || "blank"}</strong>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel icon={<FileJson aria-hidden />} title="Normalized JSON">
              <pre className="json-preview">{JSON.stringify(extraction.normalized, null, 2)}</pre>
            </Panel>
          </section>

          <section className="bottom-grid">
            <Panel icon={<AlertTriangle aria-hidden />} title="Deadlines and Enrichment Stubs">
              <div className="deadline-list">
                {matter.deadlines.map((deadline) => (
                  <div key={deadline.id}>
                    <strong>{deadline.label}</strong>
                    <span>{deadline.basis}</span>
                    <em>{deadline.status}</em>
                  </div>
                ))}
              </div>
              <div className="stub-row">
                {["USPTO Patent Center / Open Data", "Google Patents", "EPO family data", "PatentsView", "Maintenance fee status", "Assignment data"].map((stub) => (
                  <span key={stub}>{stub}</span>
                ))}
              </div>
            </Panel>

            <Panel icon={<FileText aria-hidden />} title="Notes and Source Links">
              <textarea value={matter.notes} onChange={(event) => updateMatter("notes", event.target.value)} placeholder="Matter notes, source links, review comments, and docketing assumptions." />
              <div className="source-list">
                {matter.sourceRecords.map((source) => (
                  <span key={source.id}>{source.label} · {source.sourceType}</span>
                ))}
              </div>
            </Panel>
          </section>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <header>
        {icon}
        <h2>{title}</h2>
      </header>
      {children}
    </section>
  );
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="text-field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function IdentifierTable({ identifiers, onChange }: { identifiers: PatentIdentifier[]; onChange: (id: string, value: string) => void }) {
  return (
    <div className="identifier-table">
      {identifiers.map((identifier) => (
        <div key={identifier.id}>
          <span>{identifier.label}</span>
          <input value={identifier.value} onChange={(event) => onChange(identifier.id, event.target.value)} />
          <em className={identifier.isOfficialLegalIdentifier ? "official" : "provider"}>{identifier.isOfficialLegalIdentifier ? "official" : identifier.authority}</em>
        </div>
      ))}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
