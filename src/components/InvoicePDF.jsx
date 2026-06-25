import React from 'react';

function InvoicePDF({ invoice, onClose }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const statusColor = {
    Draft: '#f59e0b',
    Approved: '#10b981',
    Rejected: '#ef4444',
    Final: '#4f46e5',
  }[invoice.status] || '#64748b';

  return (
    <>
      {/* Print stylesheet injected inline */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .invoice-print-wrapper { display: block !important; position: fixed !important; top: 0; left: 0; width: 100%; z-index: 9999; }
          .invoice-print-actions { display: none !important; }
          .invoice-watermark { opacity: 0.08 !important; }
        }
        @media screen {
          .invoice-print-wrapper {
            position: fixed;
            inset: 0;
            background: rgba(15,23,42,0.7);
            backdrop-filter: blur(6px);
            z-index: 200;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            overflow-y: auto;
            padding: 32px 16px;
          }
        }
      `}</style>

      <div className="invoice-print-wrapper">
        {/* Action Bar (screen only) */}
        <div className="invoice-print-actions" style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          display: 'flex',
          gap: '10px',
          zIndex: 201
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 16px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500
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
              boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
            }}
          >
            🖨️ Print / Download PDF
          </button>
        </div>

        {/* Invoice Document */}
        <div style={{
          background: 'white',
          width: '100%',
          maxWidth: '800px',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          fontFamily: 'Inter, Georgia, serif',
          position: 'relative'
        }}>

          {/* Watermark for Approved/Final */}
          {(invoice.status === 'Approved' || invoice.status === 'Final') && (
            <div className="invoice-watermark" style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-35deg)',
              fontSize: '7rem',
              fontWeight: 900,
              color: '#10b981',
              opacity: 0.06,
              pointerEvents: 'none',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
              zIndex: 0,
              fontFamily: 'Outfit, sans-serif'
            }}>
              APPROVED
            </div>
          )}
          {invoice.status === 'Rejected' && (
            <div className="invoice-watermark" style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-35deg)',
              fontSize: '7rem',
              fontWeight: 900,
              color: '#ef4444',
              opacity: 0.06,
              pointerEvents: 'none',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
              zIndex: 0,
              fontFamily: 'Outfit, sans-serif'
            }}>
              REJECTED
            </div>
          )}

          {/* Header Band */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
            padding: '36px 44px',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {/* Company Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #818cf8, #4f46e5)',
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: 'white',
                    fontFamily: 'Outfit, sans-serif',
                    boxShadow: '0 0 12px rgba(99,102,241,0.5)'
                  }}>W</div>
                  <div>
                    <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>WarpWrap</h1>
                    <p style={{ color: '#818cf8', fontSize: '0.7rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Textile Production House</p>
                  </div>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.8, marginTop: '10px' }}>
                  <div>Weaver's Industrial Complex, Erode, Tamil Nadu</div>
                  <div>GSTIN: 33AABCW1234F1Z5 | Phone: +91 98765 43210</div>
                </div>
              </div>

              {/* Invoice Title */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#818cf8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Tax Invoice</div>
                <div style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
                  {invoice.id}
                </div>
                <div style={{
                  display: 'inline-block',
                  marginTop: '10px',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: invoice.status === 'Approved' ? 'rgba(16,185,129,0.2)' :
                              invoice.status === 'Rejected' ? 'rgba(239,68,68,0.2)' :
                              'rgba(245,158,11,0.2)',
                  color: statusColor,
                  border: `1px solid ${statusColor}40`,
                  letterSpacing: '0.05em'
                }}>
                  ● {invoice.status.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Meta Row */}
          <div style={{
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '18px 44px',
            display: 'flex',
            gap: '40px',
            position: 'relative',
            zIndex: 1
          }}>
            {[
              { label: 'Invoice Date', value: invoice.invoiceDate || invoice.orderDate },
              { label: 'Order Date', value: invoice.orderDate },
              { label: 'Delivery Date', value: invoice.deliveryDate },
              { label: 'Order Reference', value: invoice.orderId },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{item.label}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Bill To / Bill From */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '28px 44px 24px', gap: '32px', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' }}>
                Bill To
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', marginBottom: '4px' }}>{invoice.customerName}</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.7 }}>
                <div>Textile Client</div>
                <div>WarpWrap Production System</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' }}>
                Payment Details
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.8 }}>
                <div><span style={{ color: '#94a3b8' }}>Bank:</span> <strong style={{ color: '#0f172a' }}>Indian Overseas Bank</strong></div>
                <div><span style={{ color: '#94a3b8' }}>A/C No:</span> <strong style={{ color: '#0f172a' }}>1234 5678 9012</strong></div>
                <div><span style={{ color: '#94a3b8' }}>IFSC:</span> <strong style={{ color: '#0f172a' }}>IOBA0001234</strong></div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ padding: '0 44px 28px', position: 'relative', zIndex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#0f172a' }}>
                  {['#', 'Description', 'Yarn Type', 'Yarn Count', 'Bell Count', 'Rate / 1000', 'Amt / Bell', 'Total Amount'].map(h => (
                    <th key={h} style={{
                      padding: '12px 14px',
                      textAlign: h === 'Total Amount' || h === 'Amt / Bell' || h === 'Rate / 1000' ? 'right' : 'left',
                      color: '#e2e8f0',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px 14px', color: '#64748b', fontWeight: 600 }}>01</td>
                  <td style={{ padding: '16px 14px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>Yarn Warping Service</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Order: {invoice.orderId}</div>
                  </td>
                  <td style={{ padding: '16px 14px' }}>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {invoice.yarnType}
                    </span>
                  </td>
                  <td style={{ padding: '16px 14px', fontWeight: 600 }}>{invoice.yarnCount}</td>
                  <td style={{ padding: '16px 14px', fontWeight: 600 }}>{invoice.bellCount}</td>
                  <td style={{ padding: '16px 14px', textAlign: 'right', fontWeight: 600 }}>₹{Number(invoice.ratePerThousand).toFixed(2)}</td>
                  <td style={{ padding: '16px 14px', textAlign: 'right', fontWeight: 600 }}>₹{Number(invoice.amountPerBell).toFixed(2)}</td>
                  <td style={{ padding: '16px 14px', textAlign: 'right', fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                    ₹{Number(invoice.totalAmount).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Totals Section */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0' }}>
              <div style={{ width: '300px', borderTop: '2px solid #e2e8f0' }}>
                {[
                  { label: 'Subtotal', value: `₹${Number(invoice.totalAmount).toFixed(2)}` },
                  { label: 'GST (5%)', value: `₹${(Number(invoice.totalAmount) * 0.05).toFixed(2)}` },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '0.875rem',
                    color: '#64748b'
                  }}>
                    <span>{row.label}</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.value}</span>
                  </div>
                ))}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: '#0f172a',
                  borderRadius: '0 0 8px 8px'
                }}>
                  <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>Grand Total</span>
                  <span style={{ fontWeight: 800, color: '#a5b4fc', fontSize: '1.1rem' }}>
                    ₹{(Number(invoice.totalAmount) * 1.05).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div style={{ padding: '0 44px 24px', position: 'relative', zIndex: 1 }}>
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '14px 18px'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Admin Notes
                </div>
                <p style={{ fontSize: '0.85rem', color: '#78350f', lineHeight: 1.6, margin: 0 }}>{invoice.notes}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            borderTop: '2px solid #e2e8f0',
            padding: '20px 44px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.8 }}>
              <div style={{ fontWeight: 600, color: '#64748b', marginBottom: '2px' }}>Terms & Conditions</div>
              <div>Payment due within 30 days of invoice date.</div>
              <div>Cheques payable to WarpWrap Textile Production.</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ height: '40px', borderBottom: '1px solid #64748b', marginBottom: '6px', width: '160px' }}></div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Authorised Signatory</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>WarpWrap Admin</div>
            </div>
          </div>

          {/* Invoice Generated Footer */}
          <div style={{
            textAlign: 'center',
            padding: '10px',
            background: '#4f46e5',
            position: 'relative',
            zIndex: 1
          }}>
            <span style={{ color: '#c7d2fe', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Generated by WarpWrap Production Intel — {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default InvoicePDF;
