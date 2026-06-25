import React, { useState } from 'react';
import {
  FileText, Search, Eye, CheckCircle, XCircle, Clock,
  Edit2, Save, X, Download, Filter, StickyNote, Lock,
  AlertTriangle, ChevronDown, Printer
} from 'lucide-react';
import InvoicePDF from './InvoicePDF';

function InvoiceManager({ invoices, saveInvoices, yarnRates }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPDF, setShowPDF] = useState(false);
  const [pdfInvoice, setPdfInvoice] = useState(null);

  // Edit fields for draft invoices
  const [editingId, setEditingId] = useState(null);
  const [editRate, setEditRate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editTotalAmount, setEditTotalAmount] = useState('');

  const getStatusClass = (status) => {
    switch (status) {
      case 'Draft': return 'invoice-status-draft';
      case 'Approved': return 'invoice-status-approved';
      case 'Rejected': return 'invoice-status-rejected';
      case 'Final': return 'invoice-status-final';
      default: return 'invoice-status-draft';
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (inv) => {
    if (window.confirm(`Approve Invoice ${inv.id}? This will lock the invoice.`)) {
      const updated = invoices.map(i =>
        i.id === inv.id ? { ...i, status: 'Approved' } : i
      );
      saveInvoices(updated);
      setSelectedInvoice(prev => prev && prev.id === inv.id ? { ...prev, status: 'Approved' } : prev);
    }
  };

  const handleReject = (inv) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return; // cancelled
    const updated = invoices.map(i =>
      i.id === inv.id ? { ...i, status: 'Rejected', notes: reason || i.notes } : i
    );
    saveInvoices(updated);
    setSelectedInvoice(prev => prev && prev.id === inv.id ? { ...prev, status: 'Rejected' } : prev);
  };

  const startEditing = (inv) => {
    setEditingId(inv.id);
    setEditRate(inv.ratePerThousand.toString());
    setEditNotes(inv.notes || '');
    setEditTotalAmount(inv.totalAmount.toString());
  };

  const saveEdits = (inv) => {
    const newRate = parseFloat(editRate);
    const newTotal = parseFloat(editTotalAmount);
    if (isNaN(newRate) || newRate <= 0) {
      alert('Rate must be a positive number.');
      return;
    }
    if (isNaN(newTotal) || newTotal <= 0) {
      alert('Total Amount must be a positive number.');
      return;
    }
    const newAmtPerBell = newTotal / inv.bellCount;
    const updated = invoices.map(i =>
      i.id === inv.id
        ? { ...i, ratePerThousand: newRate, totalAmount: newTotal, amountPerBell: newAmtPerBell, notes: editNotes }
        : i
    );
    saveInvoices(updated);
    setSelectedInvoice(prev =>
      prev && prev.id === inv.id
        ? { ...prev, ratePerThousand: newRate, totalAmount: newTotal, amountPerBell: newAmtPerBell, notes: editNotes }
        : prev
    );
    setEditingId(null);
  };

  const handleGeneratePDF = (inv) => {
    setPdfInvoice(inv);
    setShowPDF(true);
  };

  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'Draft').length,
    approved: invoices.filter(i => i.status === 'Approved').length,
    rejected: invoices.filter(i => i.status === 'Rejected').length,
    totalRevenue: invoices
      .filter(i => i.status === 'Approved')
      .reduce((sum, i) => sum + Number(i.totalAmount), 0),
  };

  return (
    <div>
      {showPDF && pdfInvoice && (
        <InvoicePDF invoice={pdfInvoice} onClose={() => setShowPDF(false)} />
      )}

      {/* Page Header */}
      <div className="section-header">
        <div className="header-title">
          <h1 style={{ fontFamily: 'var(--font-heading)' }}>Invoice Management</h1>
          <p>Review, approve, and generate invoices linked to warping orders.</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid" style={{ marginBottom: '28px' }}>
        <div className="kpi-card indigo">
          <div className="kpi-icon-wrapper"><FileText size={20} /></div>
          <span className="kpi-title">Total Invoices</span>
          <span className="kpi-value">{stats.total}</span>
          <span className="kpi-desc">All time</span>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-icon-wrapper"><Clock size={20} /></div>
          <span className="kpi-title">Pending (Draft)</span>
          <span className="kpi-value">{stats.draft}</span>
          <span className="kpi-desc">Awaiting review</span>
        </div>
        <div className="kpi-card emerald">
          <div className="kpi-icon-wrapper"><CheckCircle size={20} /></div>
          <span className="kpi-title">Approved</span>
          <span className="kpi-value">{stats.approved}</span>
          <span className="kpi-desc">Locked &amp; final</span>
        </div>
        <div className="kpi-card rose">
          <div className="kpi-icon-wrapper"><XCircle size={20} /></div>
          <span className="kpi-title">Rejected</span>
          <span className="kpi-value">{stats.rejected}</span>
          <span className="kpi-desc">Needs revision</span>
        </div>
      </div>

      {/* Revenue Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 28px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ color: '#6ee7b7', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Approved Revenue
          </div>
          <div style={{ color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 800 }}>
            ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ color: '#a7f3d0', fontSize: '0.85rem' }}>
          From {stats.approved} approved invoice{stats.approved !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="search-bar-container" style={{ marginBottom: '20px' }}>
        <div className="search-input-wrapper">
          <Search />
          <input
            type="text"
            placeholder="Search by customer, invoice ID, order ID..."
            className="form-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="form-input"
          style={{ maxWidth: '200px' }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Main Layout: Table + Side Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedInvoice ? '1.3fr 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>

        {/* Invoice Table */}
        <div>
          {filteredInvoices.length > 0 ? (
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Yarn Type</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map(inv => (
                      <tr
                        key={inv.id}
                        style={{
                          cursor: 'pointer',
                          background: selectedInvoice && selectedInvoice.id === inv.id ? '#f0f4ff' : undefined
                        }}
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{inv.id}</td>
                        <td style={{ fontWeight: 500 }}>{inv.orderId}</td>
                        <td style={{ fontWeight: 600 }}>{inv.customerName}</td>
                        <td>
                          <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
                            {inv.yarnType}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                          ₹{Number(inv.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <span className={`badge ${getStatusClass(inv.status)}`}>
                            {inv.status === 'Draft' && <Clock size={11} />}
                            {inv.status === 'Approved' && <CheckCircle size={11} />}
                            {inv.status === 'Rejected' && <XCircle size={11} />}
                            {inv.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                            <button
                              className="btn btn-secondary btn-sm btn-icon"
                              title="View Invoice"
                              onClick={() => setSelectedInvoice(inv)}
                            >
                              <Eye size={14} />
                            </button>
                            {(inv.status === 'Approved') && (
                              <button
                                className="btn btn-secondary btn-sm btn-icon"
                                title="Generate PDF"
                                style={{ color: 'var(--primary)', borderColor: 'rgba(79,70,229,0.2)' }}
                                onClick={() => handleGeneratePDF(inv)}
                              >
                                <Printer size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <FileText />
              <h3>No Invoices Found</h3>
              <p>Create orders to automatically generate draft invoices. Use the filter to adjust your search.</p>
            </div>
          )}
        </div>

        {/* Side Panel: Invoice Detail */}
        {selectedInvoice && (
          <div className="card" style={{ position: 'sticky', top: '20px' }}>
            <div className="card-header" style={{ background: '#f8fafc' }}>
              <div className="card-title">
                <h3 style={{ fontSize: '1rem' }}>
                  {selectedInvoice.id}
                  {selectedInvoice.status === 'Approved' && (
                    <Lock size={14} style={{ color: 'var(--success)', marginLeft: '6px' }} />
                  )}
                </h3>
              </div>
              <button className="modal-close" onClick={() => { setSelectedInvoice(null); setEditingId(null); }}>
                <X size={16} />
              </button>
            </div>

            <div className="card-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Status Badge */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span className={`badge ${getStatusClass(selectedInvoice.status)}`} style={{ fontSize: '0.85rem', padding: '6px 18px' }}>
                  {selectedInvoice.status === 'Approved' && <Lock size={12} />}
                  {selectedInvoice.status === 'Draft' && <Clock size={12} />}
                  {selectedInvoice.status === 'Rejected' && <XCircle size={12} />}
                  {selectedInvoice.status}
                </span>
              </div>

              {/* Basic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Customer', value: selectedInvoice.customerName },
                  { label: 'Order ID', value: selectedInvoice.orderId },
                  { label: 'Yarn Type', value: selectedInvoice.yarnType },
                  { label: 'Yarn Count', value: selectedInvoice.yarnCount },
                  { label: 'Bell Count', value: selectedInvoice.bellCount },
                  { label: 'Invoice Date', value: selectedInvoice.invoiceDate || selectedInvoice.orderDate },
                  { label: 'Order Date', value: selectedInvoice.orderDate },
                  { label: 'Delivery Date', value: selectedInvoice.deliveryDate },
                ].map(item => (
                  <div key={item.label} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Billing Breakdown */}
              {editingId === selectedInvoice.id ? (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Edit2 size={13} /> Editing Billing Details
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Rate Per 1000 Yarns (₹)</label>
                    <input type="number" className="form-input" value={editRate} onChange={e => setEditRate(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Total Amount Override (₹)</label>
                    <input type="number" className="form-input" value={editTotalAmount} onChange={e => setEditTotalAmount(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Admin Notes</label>
                    <textarea
                      className="form-input"
                      style={{ minHeight: '70px', resize: 'vertical' }}
                      value={editNotes}
                      onChange={e => setEditNotes(e.target.value)}
                      placeholder="Add any notes for this invoice..."
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => saveEdits(selectedInvoice)}>
                      <Save size={13} /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="billing-calc-box">
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    💰 Billing Breakdown
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { label: 'Rate Per 1000 Yarns', value: `₹${Number(selectedInvoice.ratePerThousand).toFixed(2)}`, highlight: false },
                      { label: 'Amount Per Bell', value: `₹${Number(selectedInvoice.amountPerBell).toFixed(4)}`, highlight: false },
                      { label: 'Total Amount', value: `₹${Number(selectedInvoice.totalAmount).toFixed(2)}`, highlight: true },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', padding: row.highlight ? '8px 0 0' : '0' , borderTop: row.highlight ? '1px solid #d2daf3' : 'none', marginTop: row.highlight ? '4px' : '0' }}>
                        <span style={{ color: '#475569' }}>{row.label}</span>
                        <strong style={{ color: row.highlight ? '#4f46e5' : '#0f172a', fontSize: row.highlight ? '1rem' : '0.84rem' }}>
                          {row.value}
                        </strong>
                      </div>
                    ))}
                  </div>
                  {selectedInvoice.notes && (
                    <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: '6px', border: '1px dashed #d2daf3', fontSize: '0.78rem', color: '#64748b' }}>
                      <StickyNote size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      {selectedInvoice.notes}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {selectedInvoice.status === 'Draft' && editingId !== selectedInvoice.id && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onClick={() => startEditing(selectedInvoice)}
                    >
                      <Edit2 size={13} /> Edit Rate / Amount
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-sm"
                      style={{ flex: 1, background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600 }}
                      onClick={() => handleApprove(selectedInvoice)}
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onClick={() => handleReject(selectedInvoice)}
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>
              )}

              {selectedInvoice.status === 'Approved' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'var(--success-light)', padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0',
                    fontSize: '0.8rem', color: '#065f46'
                  }}>
                    <Lock size={14} style={{ color: 'var(--success)' }} />
                    Invoice is locked and approved. No further edits allowed.
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => handleGeneratePDF(selectedInvoice)}
                  >
                    <Printer size={14} /> Generate / Print PDF
                  </button>
                </div>
              )}

              {selectedInvoice.status === 'Rejected' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'var(--danger-light)', padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca',
                  fontSize: '0.8rem', color: '#991b1b'
                }}>
                  <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />
                  This invoice was rejected. Create a new order to generate a fresh invoice.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceManager;
