import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import logo from "../assets/Logo.png";

// ── Portal root: created ONCE at module level, never duplicated or orphaned ──
let _portalEl = document.getElementById('ww-invoice-portal');
if (!_portalEl) {
  _portalEl = document.createElement('div');
  _portalEl.id = 'ww-invoice-portal';
  document.body.appendChild(_portalEl);
}
const portalEl = _portalEl;

function InvoicePDF({ invoice, onClose }) {
  if (!invoice) return null;
  return <InvoiceModal invoice={invoice} onClose={onClose} />;
}

// Separated into its own component so hooks are called unconditionally
function InvoiceModal({ invoice, onClose }) {
  const wrapperRef = useRef(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Scroll wrapper to top whenever a new invoice is opened
  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTop = 0;
    }
  }, [invoice]);

  const handlePrint = () => {
    // Scroll the overlay to the top so print starts from the header
    if (wrapperRef.current) wrapperRef.current.scrollTop = 0;
    // Small delay to let the scroll settle, then print
    requestAnimationFrame(() => {
      window.print();
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const statusColor = {
    Draft: '#f59e0b',
    Approved: '#10b981',
    Rejected: '#ef4444',
  }[invoice.status] || '#64748b';

  const totalYarns = invoice.totalYarns || invoice.yarnCount || 0;
  const deliveryDate = invoice.deliveryDate || '—';

  // ── PRINT STYLES ────────────────────────────────────────────────────────
  // Target #ww-invoice-portal specifically so body > * {display:none} hides
  // everything EXCEPT our portal element which we explicitly show back.
  const printStyles = `
    @media print {

      /* ─── Page setup ─────────────────────────────────────────────── */
      @page { size: A4 portrait; margin: 10mm 12mm; }

      /* ─── Hide everything except our portal ──────────────────────── */
      body > *:not(#ww-invoice-portal) { display: none !important; }

      #ww-invoice-portal {
        display: block !important;
        position: static !important;
        width: 100% !important;
        height: auto !important;
      }

      /* ─── Flatten overlay, center-wrapper & hide buttons ─────────── */
      .ww-invoice-overlay {
        position: static !important;
        overflow: visible !important;
        background: transparent !important;
        padding: 0 !important;
        height: auto !important;
        display: block !important;
      }
      .ww-invoice-center {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .ww-invoice-actions { display: none !important; }

      /* ─── Invoice document container ────────────────────────────── */
      .ww-invoice-doc {
        box-shadow: none !important;
        border-radius: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
        overflow: visible !important;
        border: 1px solid #e2e8f0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* ─── HEADER: replace dark gradient with clean white ────────── */
      .ww-hdr {
        background: #ffffff !important;
        border-bottom: 1px solid #cbd5e1 !important;
        padding: 15px 16px !important;
      }
      /* Logo: smaller for print */
      .ww-hdr img {
        width: 90px !important;
        margin-bottom: 6px !important;
      }
      /* Company address */
      .ww-hdr-addr { color: #475569 !important; }
      /* "Tax Invoice" super-label */
      .ww-hdr-label { color: #1e293b !important; }
      /* Invoice number */
      .ww-hdr-id { color: #111827 !important; font-size: 1.25rem !important; }
      /* Status badge — keep its color, just ensure bg is not too dark */
      .ww-hdr-badge {
        border: 1px solid #cbd5e1 !important;
        background: transparent !important;
        padding: 2px 8px !important;
        font-size: 0.7rem !important;
      }

      /* ─── META ROW: replace dark slate bg ───────────────────────── */
      .ww-meta {
        background: #ffffff !important;
        border-bottom: 1px solid #cbd5e1 !important;
        border-top: none !important;
        padding: 10px 16px !important;
      }
      .ww-meta-label { color: #64748b !important; }
      .ww-meta-val   { color: #111827 !important; }

      /* ─── Bill To & body sections: already white, adjust padding ─── */
      .ww-bill-to    { padding: 12px 16px 8px !important; }
      .ww-table-wrap { padding: 0 16px 15px !important; }

      /* ─── Table: keep navy header (prints professionally) ───────── */
      .ww-invoice-doc table {
        font-size: 0.78rem !important;
        width: 100% !important;
      }
      .ww-thead-row {
        background: #f1f5f9 !important;
      }
      .ww-invoice-doc th {
        color: #334155 !important;
        padding: 8px 8px !important;
        border-bottom: 1px solid #cbd5e1 !important;
      }
      .ww-invoice-doc td {
        padding: 8px 8px !important;
        border-bottom: 1px solid #e2e8f0 !important;
      }
      .ww-tbody-row {
        background: #ffffff !important;
      }
      
      /* Column widths in print */
      .ww-table-wrap th:nth-child(1), .ww-table-wrap td:nth-child(1) { width: 5% !important; }
      .ww-table-wrap th:nth-child(2), .ww-table-wrap td:nth-child(2) { width: 35% !important; }
      .ww-table-wrap th:nth-child(3), .ww-table-wrap td:nth-child(3) { width: 10% !important; }
      .ww-table-wrap th:nth-child(4), .ww-table-wrap td:nth-child(4) { width: 12% !important; }
      .ww-table-wrap th:nth-child(5), .ww-table-wrap td:nth-child(5) { width: 9% !important; }
      .ww-table-wrap th:nth-child(6), .ww-table-wrap td:nth-child(6) { width: 10% !important; }
      .ww-table-wrap th:nth-child(7), .ww-table-wrap td:nth-child(7) { width: 9% !important; }
      .ww-table-wrap th:nth-child(8), .ww-table-wrap td:nth-child(8) { width: 10% !important; }

      /* Prevent wrapping on numeric columns */
      .ww-table-wrap td:nth-child(4),
      .ww-table-wrap td:nth-child(5),
      .ww-table-wrap td:nth-child(6),
      .ww-table-wrap td:nth-child(7),
      .ww-table-wrap td:nth-child(8) {
        white-space: nowrap !important;
      }

      /* ─── Grand Total box: replace dark navy with light blue-gray ── */
      .ww-totals-box {
        width: 260px !important;
        border-top: 1px solid #e2e8f0 !important;
        margin-top: 10px !important;
      }
      .ww-subtotal-row {
        padding: 6px 8px !important;
        border-bottom: 1px solid #f1f5f9 !important;
      }
      .ww-grand-total {
        background: #ffffff !important;
        border-top: 1px solid #cbd5e1 !important;
        border-bottom: 2px double #cbd5e1 !important;
        border-radius: 0 !important;
        padding: 8px 8px !important;
        margin-top: 2px !important;
      }
      .ww-grand-total span:first-child {
        color: #111827 !important;
        font-weight: 700 !important;
      }
      .ww-grand-total span:last-child {
        color: #111827 !important;
        font-weight: 800 !important;
      }

      /* ─── Notes section: keep amber tones (readable on white) ────── */

      /* ─── Footer strip ───────────────────────────────────────────── */
      .ww-footer {
        background: #ffffff !important;
        border-top: 1px solid #cbd5e1 !important;
        padding: 12px 16px !important;
      }
      .ww-footer * { color: #374151 !important; }
      .ww-footer-sig-line { border-bottom-color: #374151 !important; }

      /* ─── Generated-by bar: remove purple, use subtle gray ───────── */
      .ww-gen-bar {
        background: #ffffff !important;
        border-top: 1px solid #cbd5e1 !important;
        padding: 6px !important;
      }
      .ww-gen-bar span { color: #94a3b8 !important; font-size: 0.65rem !important; }

      /* ─── Watermark: keep very faint so it does not bleed ────────── */
      .ww-watermark { opacity: 0.025 !important; }
    }
  `;

  // ── MODAL CONTENT ────────────────────────────────────────────────────────
  const content = (
    <>
      <style>{printStyles}</style>

      {/*
        OVERLAY — position:fixed, overflow-y:auto (plain block, NOT flex)
        This lets the overlay itself scroll vertically.
      */}
      <div
        className="ww-invoice-overlay"
        ref={wrapperRef}
        onClick={handleBackdropClick}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(8, 14, 30, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 99999,
          overflowY: 'auto',
          overflowX: 'hidden',
          // No flex — plain block so content stacks top-to-bottom and scrolls
        }}
      >
        {/*
          CENTER WRAPPER — centers the invoice card horizontally.
          margin: 0 auto + explicit vertical padding gives breathing room.
        */}
        <div
          className="ww-invoice-center"
          style={{
            width: '100%',
            maxWidth: '210mm',
            margin: '0 auto',
            padding: '24px 0 56px',
          }}
        >
          {/* ── ACTION BAR ──────────────────────────────────────────────── */}
          <div
            className="ww-invoice-actions"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginBottom: '16px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={onClose}
              style={{
                background: '#334155',
                color: '#ffffff',
                border: '1px solid #475569',
                borderRadius: '8px',
                padding: '8px 16px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 500,
              }}
            >
              ✕ Close
            </button>

            <button
              onClick={handlePrint}
              style={{
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
              }}
            >
              📄 Generate PDF
            </button>

            <button
              onClick={handlePrint}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
              }}
            >
              🖨️ Print Invoice
            </button>
          </div>

          {/* ── INVOICE DOCUMENT ─────────────────────────────────────────── */}
          <div
            className="ww-invoice-doc"
            style={{
              background: '#ffffff',
              width: '100%',
              borderRadius: '12px',
              boxShadow: '0 24px 72px rgba(0,0,0,0.55)',
              overflow: 'hidden',
              fontFamily: "'Inter', 'Georgia', serif",
              position: 'relative',
            }}
          >

            {/* WATERMARK */}
            {invoice.status === 'Approved' && (
              <div className="ww-watermark" style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%) rotate(-35deg)',
                fontSize: '7rem', fontWeight: 900, color: '#10b981',
                opacity: 0.06, pointerEvents: 'none', letterSpacing: '0.05em',
                whiteSpace: 'nowrap', zIndex: 0, fontFamily: 'Outfit, sans-serif'
              }}>APPROVED</div>
            )}
            {invoice.status === 'Rejected' && (
              <div className="ww-watermark" style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%) rotate(-35deg)',
                fontSize: '7rem', fontWeight: 900, color: '#ef4444',
                opacity: 0.06, pointerEvents: 'none', letterSpacing: '0.05em',
                whiteSpace: 'nowrap', zIndex: 0, fontFamily: 'Outfit, sans-serif'
              }}>REJECTED</div>
            )}

            {/* ── HEADER BAND ─────────────────────────────────────── */}
            <div
              className="ww-hdr"
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
                padding: '36px 44px', position: 'relative', zIndex: 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <img src={logo} alt="WarpWrap Logo" style={{ width: '150px', height: 'auto', objectFit: 'contain', display: 'block', marginBottom: '10px' }} />
                  <div className="ww-hdr-addr" style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.8 }}>
                    <div>Babu Textile, Bangalore, Karnataka</div>
                    <div>Phone: +91 7019655290</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="ww-hdr-label" style={{ color: '#818cf8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Tax Invoice</div>
                  <div className="ww-hdr-id" style={{ color: '#ffffff', fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>{invoice.id}</div>
                  <div
                    className="ww-hdr-badge"
                    style={{
                      display: 'inline-block', marginTop: '10px', padding: '4px 14px',
                      borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                      background: invoice.status === 'Approved' ? 'rgba(16,185,129,0.2)' :
                        invoice.status === 'Rejected' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                      color: statusColor, border: `1px solid ${statusColor}40`, letterSpacing: '0.05em',
                    }}
                  >
                    ● {invoice.status === 'Approved' ? 'APPROVED & FINAL' : invoice.status.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* ── META ROW ────────────────────────────────────────── */}
            <div
              className="ww-meta"
              style={{
                background: '#1e293b', borderBottom: '1px solid #334155',
                padding: '18px 44px', display: 'flex', gap: '40px',
                flexWrap: 'wrap', position: 'relative', zIndex: 1,
              }}
            >
              {[
                { label: 'Invoice Date', value: invoice.invoiceDate || invoice.orderDate },
                { label: 'Order Date', value: invoice.orderDate },
                { label: 'Delivery Date', value: deliveryDate },
                { label: 'Order Reference ID', value: invoice.orderId },
              ].map(item => (
                <div key={item.label}>
                  <div className="ww-meta-label" style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{item.label}</div>
                  <div className="ww-meta-val" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* ── BILL TO ─────────────────────────────────────────── */}
            <div className="ww-bill-to" style={{ background: '#ffffff', padding: '28px 44px 24px', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' }}>Bill To</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111827', marginBottom: '4px' }}>{invoice.customerName}</div>
              <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.7 }}>
                <div>Company: <strong>{invoice.companyName || '—'}</strong></div>
              </div>
            </div>

            {/* ── LINE ITEMS TABLE ─────────────────────────────────── */}
            <div className="ww-table-wrap" style={{ padding: '0 44px 28px', position: 'relative', zIndex: 1, background: '#ffffff' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: '0.82rem' }}>
                <thead>
                  <tr className="ww-thead-row" style={{ background: '#0f172a' }}>
                    {[
                      { name: '#', width: '6%' },
                      { name: 'Description', width: '24%' },
                      { name: 'Yarn Type', width: '12%' },
                      { name: 'Total Yarns', width: '14%' },
                      { name: 'Bell Count', width: '10%' },
                      { name: 'Rate / 1000', width: '12%' },
                      { name: 'Amt / Bell', width: '12%' },
                      { name: 'Total Amount', width: '10%' },
                    ].map(col => (
                      <th key={col.name} style={{
                        width: col.width, padding: '12px 10px',
                        textAlign: ['Rate / 1000', 'Amt / Bell', 'Total Amount'].includes(col.name) ? 'right' : 'left',
                        color: '#e2e8f0', fontSize: '0.72rem', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>{col.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td style={{ padding: '14px 10px', color: '#64748b', fontWeight: 600 }}>01</td>
                    <td style={{ padding: '14px 10px' }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>Yarn Warping Service</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Order: {invoice.orderId}</div>
                    </td>
                    <td style={{ padding: '14px 10px' }}>
                      <span style={{ background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {invoice.yarnType}
                      </span>
                    </td>
                    <td style={{ padding: '14px 10px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{totalYarns.toLocaleString()}</td>
                    <td style={{ padding: '14px 10px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{invoice.bellCount}</td>
                    <td style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>₹{Number(invoice.ratePerThousand).toFixed(2)}</td>
                    <td style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>₹{Number(invoice.amountPerBell).toFixed(2)}</td>
                    <td style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 700, color: '#059669', fontSize: '1rem', whiteSpace: 'nowrap' }}>₹{Number(invoice.totalAmount).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Totals */}
              <div className="ww-totals-container" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <div className="ww-totals-box" style={{ width: '300px', borderTop: '2px solid #e2e8f0' }}>
                  <div className="ww-subtotal-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#64748b' }}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 600, color: '#111827' }}>₹{Number(invoice.totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="ww-grand-total" style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: '#0f172a', borderRadius: '0 0 8px 8px' }}>
                    <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>Grand Total</span>
                    <span style={{ fontWeight: 800, color: '#a5b4fc', fontSize: '1.1rem' }}>₹{Number(invoice.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── NOTES ───────────────────────────────────────────── */}
            {invoice.notes && (
              <div style={{ padding: '0 44px 24px', position: 'relative', zIndex: 1, background: '#ffffff' }}>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Admin Notes</div>
                  <p style={{ fontSize: '0.85rem', color: '#78350f', lineHeight: 1.6, margin: 0 }}>{invoice.notes}</p>
                </div>
              </div>
            )}

            {/* ── FOOTER ──────────────────────────────────────────── */}
            <div className="ww-footer" style={{ borderTop: '2px solid #e2e8f0', padding: '20px 44px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#374151', lineHeight: 1.8 }}>
                <div style={{ fontWeight: 700, color: '#111827', marginBottom: '2px' }}>Terms & Conditions</div>
                <div>Payment due within 30 days of invoice date.</div>
                <div>Cheques payable to Babu Textile Production.</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="ww-footer-sig-line" style={{ height: '40px', borderBottom: '2px solid #475569', marginBottom: '6px', width: '190px' }}></div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Authorised Signatory</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111827', marginTop: '2px' }}>Babu Textile</div>
              </div>
            </div>

            {/* ── GENERATED BY STRIP ──────────────────────────────── */}
            <div className="ww-gen-bar" style={{ textAlign: 'center', padding: '10px', background: '#4f46e5', position: 'relative', zIndex: 1 }}>
              <span style={{ color: '#e0e7ff', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                Generated by WarpWrap — {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, portalEl);
}

export default InvoicePDF;
