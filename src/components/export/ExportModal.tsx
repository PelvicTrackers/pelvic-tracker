import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  FileCode,
  FileText,
  Check,
  Copy,
  Download,
  Calendar
} from 'lucide-react';
import { useLogStore } from '../../store/useLogStore';
import { generateMarkdownReport } from '../../utils/exporters/markdownExporter';
import { generateHtmlReport } from '../../utils/exporters/htmlExporter';
import { triggerBrowserPrint } from '../../utils/exporters/printExporter';
import {
  DATE_RANGE_PRESETS,
  filterEntriesByDateRange,
  formatDateRangeLabel
} from '../../utils/dateFilters';
import { JsonBackupPanel } from './JsonBackupPanel';

export const ExportModal: React.FC = () => {
  const showExportModal = useLogStore((s) => s.showExportModal);
  const setShowExportModal = useLogStore((s) => s.setShowExportModal);
  const patientInitials = useLogStore((s) => s.patientInitials);
  const setPatientInitials = useLogStore((s) => s.setPatientInitials);

  const sexual = useLogStore((s) => s.sexualEntries);
  const urinary = useLogStore((s) => s.urinaryEntries);
  const bowel = useLogStore((s) => s.bowelEntries);
  const notes = useLogStore((s) => s.notes);

  const exportDateRange = useLogStore((s) => s.exportDateRange);
  const customStartDate = useLogStore((s) => s.customStartDate);
  const customEndDate = useLogStore((s) => s.customEndDate);
  const includeChartsInReport = useLogStore((s) => s.includeChartsInReport);
  const setExportDateRange = useLogStore((s) => s.setExportDateRange);
  const setCustomStartDate = useLogStore((s) => s.setCustomStartDate);
  const setCustomEndDate = useLogStore((s) => s.setCustomEndDate);
  const setIncludeChartsInReport = useLogStore((s) => s.setIncludeChartsInReport);

  const [copiedMd, setCopiedMd] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Safety listener for browser print dialog dismissals
  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinting(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // During print execution, hide the modal entirely from the DOM to prevent backdrops from obscuring output
  if (!showExportModal || isPrinting) return null;

  const filteredSexual = filterEntriesByDateRange(sexual, exportDateRange, customStartDate, customEndDate);
  const filteredUrinary = filterEntriesByDateRange(urinary, exportDateRange, customStartDate, customEndDate);
  const filteredBowel = filterEntriesByDateRange(bowel, exportDateRange, customStartDate, customEndDate);
  const filteredNotes = filterEntriesByDateRange(notes, exportDateRange, customStartDate, customEndDate);

  const rawTotal = sexual.length + urinary.length + bowel.length + notes.length;
  const filteredTotal = filteredSexual.length + filteredUrinary.length + filteredBowel.length + filteredNotes.length;
  const isFiltered = exportDateRange !== 'all';
  const activeRangeLabel = formatDateRangeLabel(exportDateRange, customStartDate, customEndDate);

  const handleCopyMarkdown = async () => {
    const md = generateMarkdownReport({
      sexual: filteredSexual,
      urinary: filteredUrinary,
      bowel: filteredBowel,
      notes: filteredNotes,
      patientInitials,
      dateRangeLabel: activeRangeLabel
    });
    await navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport({
      sexual: filteredSexual,
      urinary: filteredUrinary,
      bowel: filteredBowel,
      notes: filteredNotes,
      patientInitials,
      dateRangeLabel: activeRangeLabel
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    const rangeTag = exportDateRange !== 'all' ? `_${exportDateRange}` : '';
    a.href = url;
    a.download = `pelvic_diary${rangeTag}_${dateStamp}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const html = generateHtmlReport({
      sexual: filteredSexual,
      urinary: filteredUrinary,
      bowel: filteredBowel,
      notes: filteredNotes,
      patientInitials,
      dateRangeLabel: activeRangeLabel
    });
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    const rangeTag = exportDateRange !== 'all' ? `_${exportDateRange}` : '';
    a.href = url;
    a.download = `pelvic_diary${rangeTag}_${dateStamp}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Dedicated Print Clinical Summary workflow:
   * Temporarily hides the modal from the DOM before invoking window.print(),
   * then restores the modal upon print dismissal.
   */
  const handlePrintClinicalSummary = () => {
    setIsPrinting(true);

    requestAnimationFrame(() => {
      setTimeout(() => {
        triggerBrowserPrint(patientInitials);
        setIsPrinting(false);
      }, 150);
    });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div>
            <h2 id="export-modal-title">Clinical Export & Data Sovereignty</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Export formatted reports for Physical Therapy or manage local backups
            </span>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowExportModal(false)}
            aria-label="Close export modal"
            style={{ width: '40px', height: '40px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Patient Initials field */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="patient-initials" className="form-label">
              Patient Identifier / Initials (Optional for Print/Export)
            </label>
            <input
              type="text"
              id="patient-initials"
              className="form-input"
              maxLength={15}
              placeholder="e.g. J.D. or PT-401"
              value={patientInitials}
              onChange={(e) => setPatientInitials(e.target.value)}
            />
            <div className="form-help">
              Appears on printed headers and clinical summaries. Never transmitted anywhere.
            </div>
          </div>

          {/* Date Range Selector Bar */}
          <div
            style={{
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              backgroundColor: 'var(--card-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-clinical)', fontWeight: 600, fontSize: '0.88rem' }}>
                <Calendar size={17} />
                <span>Export Date Range</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {activeRangeLabel}
              </span>
            </div>

            {/* Preset Buttons */}
            <div
              role="radiogroup"
              aria-label="Export Date Range Filter"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '6px'
              }}
            >
              {DATE_RANGE_PRESETS.map((preset) => {
                const isSelected = exportDateRange === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setExportDateRange(preset.value)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--accent-clinical)' : '1px solid var(--card-border)',
                      backgroundColor: isSelected ? 'var(--accent-light, #E3F2ED)' : 'var(--bg-secondary)',
                      color: isSelected ? 'var(--accent-clinical)' : 'var(--text-primary)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Date Inputs when 'custom' is active */}
            {exportDateRange === 'custom' && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  paddingTop: '8px',
                  borderTop: '1px dashed var(--card-border-subtle)',
                  marginTop: '4px'
                }}
              >
                <div style={{ flex: '1 1 180px' }}>
                  <label htmlFor="custom-start-date" style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="custom-start-date"
                    className="form-input"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    style={{ minHeight: '38px', fontSize: '0.85rem' }}
                  />
                </div>
                <div style={{ flex: '1 1 180px' }}>
                  <label htmlFor="custom-end-date" style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    id="custom-end-date"
                    className="form-input"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    style={{ minHeight: '38px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Records Ready Indicator */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Records Ready to Export:</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-clinical)' }}>
                {filteredTotal} records
                {isFiltered && ` (of ${rawTotal} all-time)`}
              </span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Breakdown: {filteredSexual.length} Sex & Pain, {filteredUrinary.length} Void/Leak, {filteredBowel.length} Bowel, {filteredNotes.length} Notes
            </div>
          </div>

          {/* Export Options Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {/* 1. Print / PDF */}
            <div
              style={{
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                backgroundColor: 'var(--card-surface)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-clinical)' }}>
                  <Printer size={20} />
                  <strong style={{ fontSize: '0.95rem' }}>Printable View / PDF</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Paper-optimized clinical layout formatted for medical providers and PT binder filing.
                </p>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    marginTop: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={includeChartsInReport}
                    onChange={(e) => setIncludeChartsInReport(e.target.checked)}
                    style={{ accentColor: 'var(--accent-clinical)' }}
                  />
                  <span>Include Symptomatic Trend Graphs in Clinical Report</span>
                </label>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={handlePrintClinicalSummary}
              >
                <Printer size={16} /> Print Clinical Summary
              </button>
            </div>

            {/* 2. Markdown EHR Summary */}
            <div
              style={{
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                backgroundColor: 'var(--card-surface)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)' }}>
                  <FileText size={20} />
                  <strong style={{ fontSize: '0.95rem' }}>Markdown (EHR / EMR)</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Structured tables formatted to paste directly into PT charting systems or patient portal notes.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCopyMarkdown}
                  style={{ flex: 1, padding: '8px 10px' }}
                >
                  {copiedMd ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                  <span>{copiedMd ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleDownloadMarkdown}
                  style={{ flex: 1, padding: '8px 10px' }}
                >
                  <Download size={16} />
                  <span>.MD</span>
                </button>
              </div>
            </div>

            {/* 3. Self-Contained HTML */}
            <div
              style={{
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                backgroundColor: 'var(--card-surface)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309' }}>
                  <FileCode size={20} />
                  <strong style={{ fontSize: '0.95rem' }}>Self-Contained HTML</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Single offline styled HTML file with tables that can be opened in any browser or emailed to your PT.
                </p>
              </div>
              <button type="button" className="btn-secondary" onClick={handleDownloadHtml}>
                <Download size={16} /> Download HTML Report
              </button>
            </div>

            {/* 4. JSON Database Backup & Restore with Optional Passphrase */}
            <JsonBackupPanel
              filteredData={{
                sexual: filteredSexual,
                urinary: filteredUrinary,
                bowel: filteredBowel,
                notes: filteredNotes
              }}
              dateRangeLabel={activeRangeLabel}
              isFiltered={isFiltered}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={() => setShowExportModal(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
