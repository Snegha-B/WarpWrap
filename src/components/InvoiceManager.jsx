import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Eye, CheckCircle, XCircle, Clock,
  Edit2, Save, X, Download, Filter, StickyNote, Lock,
  AlertTriangle, ChevronDown, Printer, QrCode, CreditCard, Calendar, User, Wallet
} from 'lucide-react';
import InvoicePDF from './InvoicePDF';

function InvoiceManager({ invoices, saveInvoices, yarnRates, customers = [], payments = [], savePayments, triggerNotification }) {
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

  // Cash marking form state
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [cashDate, setCashDate] = useState('2026-06-18');
  const [cashRemarks, setCashRemarks] = useState('');

  // Customer portal simulator state
  const [showCustomerPortal, setShowCustomerPortal] = useState(false);
  const [portalActiveTab, setPortalActiveTab] = useState('upi'); // 'upi' | 'cash' | 'defer'
  const [upiStatus, setUpiStatus] = useState('Pending'); // 'Pending' | 'Processing' | 'Successful' | 'Failed'
  const [deferOption, setDeferOption] = useState('Tomorrow'); // 'Tomorrow' | '3 Days' | '1 Week' | 'Custom'
  const [deferDate, setDeferDate] = useState('2026-06-19');
  const [deferRemarks, setDeferRemarks] = useState('');


  const getStatusClass = (status) => {
    switch (status) {
      case 'Draft': return 'invoice-status-draft';
      case 'Approved': return 'invoice-status-approved';
      case 'Rejected': return 'invoice-status-rejected';
      default: return 'invoice-status-draft';
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const cust = inv.customerName || '';
    const comp = inv.companyName || '';
    const invId = inv.id || '';
    const ordId = inv.orderId || '';
    const matchesSearch =
      cust.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (inv) => {
    if (window.confirm(`Approve Invoice ${inv.id}? This will lock the invoice as FINAL.`)) {
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
    setSelectedInvoice(prev => prev && prev.id === inv.id ? { ...prev, status: 'Rejected', notes: reason || i.notes } : prev);
  };

  const startEditing = (inv) => {
    setEditingId(inv.id);
    setEditRate(inv.ratePerThousand.toString());
    setEditNotes(inv.notes || '');
    setEditTotalAmount(inv.totalAmount.toString());
  };

  // Handle rate input change (recalculates total amount)
  const handleRateChange = (val, inv) => {
    setEditRate(val);
    const rate = parseFloat(val);
    const yarns = inv.totalYarns || inv.yarnCount || 0;
    const bells = inv.bellCount || 0;
    if (!isNaN(rate) && rate > 0 && yarns > 0 && bells > 0) {
      const amtPerBell = (yarns * rate) / 1000;
      setEditTotalAmount((amtPerBell * bells).toFixed(2));
    }
  };

  // Handle total amount override (back-calculates rate)
  const handleAmountChange = (val, inv) => {
    setEditTotalAmount(val);
    const total = parseFloat(val);
    const yarns = inv.totalYarns || inv.yarnCount || 0;
    const bells = inv.bellCount || 0;
    if (!isNaN(total) && total > 0 && yarns > 0 && bells > 0) {
      const rate = (total * 1000) / (yarns * bells);
      setEditRate(rate.toFixed(2));
    }
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
        ? { 
            ...i, 
            ratePerThousand: newRate, 
            totalAmount: newTotal, 
            amountPerBell: newAmtPerBell, 
            notes: editNotes 
          }
        : i
    );
    saveInvoices(updated);
    setSelectedInvoice(prev =>
      prev && prev.id === inv.id
        ? { 
            ...prev, 
            ratePerThousand: newRate, 
            totalAmount: newTotal, 
            amountPerBell: newAmtPerBell, 
            notes: editNotes 
          }
        : prev
    );
    setEditingId(null);
  };

  const handleGeneratePDF = (inv) => {
    setPdfInvoice(inv);
    setShowPDF(true);
  };

  // Open customer portal simulation and record view details (Instruction 2)
  const openCustomerPortal = (inv) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = "2026-06-18"; // Today reference

    const updated = invoices.map(i => {
      if (i.id === inv.id) {
        return {
          ...i,
          viewed: 'Yes',
          viewedDate: dateStr,
          viewedTime: timeStr
        };
      }
      return i;
    });

    saveInvoices(updated);
    
    // Sync current selected state
    const currentUpdated = updated.find(i => i.id === inv.id);
    setSelectedInvoice(currentUpdated);

    // Initial portal setup
    setUpiStatus('Pending');
    setDeferRemarks('');
    setDeferOption('Tomorrow');
    setDeferDate('2026-06-19');
    
    // Default the active tab selection based on the invoice's saved paymentPreference
    const prefTab = inv.paymentPreference === 'Cash' ? 'cash' : (inv.paymentPreference === 'Defer' ? 'defer' : 'upi');
    setPortalActiveTab(prefTab);
    
    setShowCustomerPortal(true);
  };

  // UPI payment processing mock simulation (Instruction 6)
  const handleUpiPay = (inv) => {
    setUpiStatus('Processing');
    setTimeout(() => {
      setUpiStatus('Successful');
      
      const updated = invoices.map(i => {
        if (i.id === inv.id) {
          return {
            ...i,
            paymentStatus: 'Paid',
            paymentPreference: 'UPI'
          };
        }
        return i;
      });
      saveInvoices(updated);
      setSelectedInvoice(updated.find(i => i.id === inv.id));

      const matchedCust = customers.find(c => c.companyName === inv.companyName || c.name === inv.customerName);
      const custId = matchedCust ? matchedCust.id : `CUST-${Date.now().toString().slice(-3)}`;

      const newPayment = {
        id: `PAY-${Date.now().toString().slice(-4)}`,
        invoiceId: inv.id,
        customerId: custId,
        customerName: inv.companyName || inv.customerName,
        amount: Number(inv.totalAmount),
        date: "2026-06-18",
        method: "UPI",
        remarks: "UPI Online Payment"
      };
      savePayments([...payments, newPayment]);

      triggerNotification(
        `Payment Successfully Received: Invoice ${inv.id} of ₹${Number(inv.totalAmount).toLocaleString()} paid via UPI.`,
        'success',
        'payment',
        inv.id
      );
    }, 2000);
  };

  // Need More Time deferment (Instruction 6)
  const handleDeferSave = (inv) => {
    let calcDate = "2026-06-19";
    if (deferOption === 'Tomorrow') {
      calcDate = "2026-06-19";
    } else if (deferOption === '3 Days') {
      calcDate = "2026-06-21";
    } else if (deferOption === '1 Week') {
      calcDate = "2026-06-25";
    } else {
      calcDate = deferDate;
    }

    const updated = invoices.map(i => {
      if (i.id === inv.id) {
        return {
          ...i,
          paymentStatus: 'Payment Deferred',
          deferredRemarks: deferRemarks.trim(),
          deferredUntil: calcDate,
          paymentPreference: 'Defer'
        };
      }
      return i;
    });
    saveInvoices(updated);
    setSelectedInvoice(updated.find(i => i.id === inv.id));

    setShowCustomerPortal(false);
  };

  // Cash collection selection (Instruction 6)
  const handleCollectionSelect = (inv) => {
    const updated = invoices.map(i => {
      if (i.id === inv.id) {
        return {
          ...i,
          paymentStatus: 'Awaiting Cash Payment',
          paymentPreference: 'Cash'
        };
      }
      return i;
    });
    saveInvoices(updated);
    setSelectedInvoice(updated.find(i => i.id === inv.id));

    setShowCustomerPortal(false);
  };

  // Admin Mark cash payment received (Instruction 6)
  const handleMarkPaid = (inv) => {
    const amt = parseFloat(cashAmount) || Number(inv.totalAmount);
    
    const updated = invoices.map(i => {
      if (i.id === inv.id) {
        return {
          ...i,
          paymentStatus: 'Paid'
        };
      }
      return i;
    });
    saveInvoices(updated);
    setSelectedInvoice(updated.find(i => i.id === inv.id));

    const matchedCust = customers.find(c => c.companyName === inv.companyName || c.name === inv.customerName);
    const custId = matchedCust ? matchedCust.id : `CUST-${Date.now().toString().slice(-3)}`;

    const newPayment = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      invoiceId: inv.id,
      customerId: custId,
      customerName: inv.companyName || inv.customerName,
      amount: amt,
      date: cashDate,
      method: "Cash",
      remarks: cashRemarks.trim()
    };
    savePayments([...payments, newPayment]);

    triggerNotification(
      `Payment Successfully Received: Cash payment of ₹${amt.toLocaleString()} received for Invoice ${inv.id}.`,
      'success',
      'payment',
      inv.id
    );

    setShowCashModal(false);
  };

  // Manual Collection Status update
  const handleCollectionStatusChange = (inv, newStatus) => {
    const updated = invoices.map(i => {
      if (i.id === inv.id) {
        return {
          ...i,
          collectionStatus: newStatus
        };
      }
      return i;
    });
    saveInvoices(updated);
    setSelectedInvoice(updated.find(i => i.id === inv.id));
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

  // ESC key to close invoice detail modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showCustomerPortal) { setShowCustomerPortal(false); return; }
        if (showCashModal) { setShowCashModal(false); return; }
        if (showPDF) { setShowPDF(false); return; }
        if (selectedInvoice) { setSelectedInvoice(null); setEditingId(null); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedInvoice, showCashModal, showCustomerPortal, showPDF]);

  return (
    <div>
      {showPDF && pdfInvoice && (
        <InvoicePDF invoice={pdfInvoice} onClose={() => setShowPDF(false)} />
      )}

      {/* Page Header */}
      <div className="section-header">
        <div className="header-title">
          <h1 style={{ fontFamily: 'var(--font-heading)' }}>Invoice Management</h1>
          <p>Review, approve, and print PDF invoices linked to warping orders.</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid" style={{ marginBottom: '28px' }}>
        <div className="kpi-card indigo">
          <div className="kpi-icon-wrapper"><FileText size={20} /></div>
          <span className="kpi-title">Total Invoices</span>
          <span className="kpi-value">{stats.total}</span>
          <span className="kpi-desc">All time generated</span>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-icon-wrapper"><Clock size={20} /></div>
          <span className="kpi-title">Pending (Draft)</span>
          <span className="kpi-value">{stats.draft}</span>
          <span className="kpi-desc">Awaiting approval</span>
        </div>
        <div className="kpi-card emerald">
          <div className="kpi-icon-wrapper"><CheckCircle size={20} /></div>
          <span className="kpi-title">Approved (Locked)</span>
          <span className="kpi-value">{stats.approved}</span>
          <span className="kpi-desc">Locked as Final</span>
        </div>
        <div className="kpi-card rose">
          <div className="kpi-icon-wrapper"><XCircle size={20} /></div>
          <span className="kpi-title">Rejected Invoices</span>
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
            Approved Final Revenue
          </div>
          <div style={{ color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 800 }}>
            ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ color: '#a7f3d0', fontSize: '0.85rem' }}>
          From {stats.approved} approved locked invoice{stats.approved !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="search-bar-container" style={{ marginBottom: '20px' }}>
        <div className="search-input-wrapper">
          <Search />
          <input
            type="text"
            placeholder="Search by customer, company, invoice #, order ID..."
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

      {/* Main Layout: Full-width Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', alignItems: 'start' }}>

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
                      <th>Customer &amp; Company</th>
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
                          background: selectedInvoice && selectedInvoice.id === inv.id
  ? 'rgba(99,102,241,.12)'
  : 'transparent'
                        }}
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{inv.id}</td>
                        <td style={{ fontWeight: 500 }}>{inv.orderId}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                           <span
  style={{
    fontWeight: 600,
    color: 'var(--text-main)'
  }}
>
  {inv.customerName}
</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{inv.companyName || '—'}</span>
                          </div>
                        </td>
                        <td>
                          <span
  style={{
    background: 'rgba(99,102,241,.15)',
    color: 'var(--primary)',
    border: '1px solid rgba(99,102,241,.35)',
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '0.78rem',
    fontWeight: 600
  }}
>
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
                                        <td style={{ textAlign: 'right' }}>
                             <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                            <button
                              className="btn btn-secondary btn-sm btn-icon"
                              title="View Invoice"
                              onClick={() => setSelectedInvoice(inv)}
                            >
                              <Eye size={14} />
                            </button>
                            {inv.status === 'Approved' && (
                              <button
                                className="btn btn-secondary btn-sm btn-icon"
                                title="View as Customer"
                                style={{ color: 'var(--info)', borderColor: 'rgba(6,182,212,0.2)' }}
                                onClick={() => openCustomerPortal(inv)}
                              >
                                <User size={14} />
                              </button>
                            )}
                            <button
                              className="btn btn-secondary btn-sm btn-icon"
                              title="Generate PDF"
                              style={{ color: 'var(--primary)', borderColor: 'rgba(79,70,229,0.2)' }}
                              onClick={() => handleGeneratePDF(inv)}
                            >
                              <Printer size={14} />
                            </button>
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
              <p>Create orders to automatically generate draft invoices. Use the search to adjust filters.</p>
            </div>
          )}
        </div>

      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) { setSelectedInvoice(null); setEditingId(null); } }}
        >
          <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh' }}>
            <div
              className="modal-header"
              style={{
                background: "var(--bg-card)",
                borderBottom: "1px solid var(--border-color)"
              }}
            >
              <div className="card-title">
                <h3 style={{ fontSize: '1rem' }}>
                  Invoice Details — {selectedInvoice.id}
                  {selectedInvoice.status === 'Approved' && (
                    <Lock size={14} style={{ color: 'var(--success)', marginLeft: '6px' }} />
                  )}
                </h3>
              </div>
              <button className="modal-close" onClick={() => { setSelectedInvoice(null); setEditingId(null); }}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Status Badge */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span className={`badge ${getStatusClass(selectedInvoice.status)}`} style={{ fontSize: '0.85rem', padding: '6px 18px' }}>
                  {selectedInvoice.status === 'Approved' && <Lock size={12} />}
                  {selectedInvoice.status === 'Draft' && <Clock size={12} />}
                  {selectedInvoice.status === 'Rejected' && <XCircle size={12} />}
                  {selectedInvoice.status === 'Approved' ? 'Approved & Locked' : selectedInvoice.status}
                </span>
              </div>

              {/* Basic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Contact Person', value: selectedInvoice.customerName },
                  { label: 'Company Name', value: selectedInvoice.companyName || '—' },
                  { label: 'Order ID', value: selectedInvoice.orderId },
                  { label: 'Yarn Type', value: selectedInvoice.yarnType },
                  { label: 'Total Yarns', value: (selectedInvoice.totalYarns || selectedInvoice.yarnCount || 0).toLocaleString() },
                  { label: 'Bell Count', value: selectedInvoice.bellCount },
                  { label: 'Invoice Date', value: selectedInvoice.invoiceDate || selectedInvoice.orderDate },
                  { label: 'Order Date', value: selectedInvoice.orderDate },
                  { label: 'Delivery Date', value: selectedInvoice.deliveryDate || '—' },
                ].map(item => (
                  <div key={item.label} style={{background: 'var(--bg-app)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '3px'
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: 'var(--text-main)'
                      }}
                    >{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Billing Breakdown */}
              {editingId === selectedInvoice.id ? (
                <div style={{ background: 'var(--bg-card)', border:  '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Edit2 size={13} /> Reviewing Invoice Draft
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label
                      className="form-label"
                      style={{
                        color:  "var(--text-main)",
                        fontWeight: 600
                      }}
                    >Rate Per 1000 Yarns (₹)</label>
                   <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      style={{
                        background: "var(--bg-app)",
                        color: "var(--text-main)",
                        border: "1px solid var(--border-color)",
                      }}
                      value={editRate}
                      onChange={e => handleRateChange(e.target.value, selectedInvoice)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label
                      className="form-label"
                      style={{
                        color:  "var(--text-main)",
                        fontWeight: 600
                      }}
                    >Total Amount Override (₹)</label>
                   <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      style={{
                      background: "var(--bg-app)",
                      color: "var(--text-main)",
                      border: "1px solid var(--border-color)"
                      }}
                      value={editTotalAmount}
                      onChange={e => handleAmountChange(e.target.value, selectedInvoice)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label
                      className="form-label"
                      style={{
                        color:  "var(--text-main)",
                        fontWeight: 600
                      }}
                    >Invoice Notes</label>
                    <textarea
                      className="form-input"
                     style={{color: "var(--text-main)",background: "var(--bg-app)",border: "1px solid var(--border-color)",minHeight: '70px', resize: 'vertical' }}
                      value={editNotes}
                      onChange={e => setEditNotes(e.target.value)}
                      placeholder="Add specific notes, payment instructions, etc."
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => saveEdits(selectedInvoice)}>
                      <Save size={13} /> Save Calculations
                    </button>
                  </div>
                </div>
              ) : (
                <div className="billing-calc-box">
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    💰 Billing Summary Breakdown
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { label: 'Rate Per 1000 Yarns', value: `₹${Number(selectedInvoice.ratePerThousand).toFixed(2)}`, highlight: false },
                      { label: 'Total Yarns', value: (selectedInvoice.totalYarns || selectedInvoice.yarnCount || 0).toLocaleString(), highlight: false },
                      { label: 'Amount Per Bell', value: `₹${Number(selectedInvoice.amountPerBell).toFixed(2)}`, highlight: false },
                      { label: 'Bell Count', value: selectedInvoice.bellCount, highlight: false },
                      { label: 'Total Amount', value: `₹${Number(selectedInvoice.totalAmount).toFixed(2)}`, highlight: true },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', padding: row.highlight ? '8px 0 0' : '0' , borderTop: row.highlight ? '1px solid var(--border-color)' : 'none', marginTop: row.highlight ? '4px' : '0' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                        <strong style={{
                          color: row.highlight ? 'var(--primary)' : 'var(--text-main)',  fontSize: row.highlight ? '1rem' : '0.84rem' }}>
                          {row.value}
                        </strong>
                      </div>
                    ))}
                  </div>
                  {selectedInvoice.notes && (
                    <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fffbeb', borderRadius: '6px', border: '1px dashed #fde68a', fontSize: '0.78rem', color: '#78350f' }}>
                      <StickyNote size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      <strong>Notes:</strong> {selectedInvoice.notes}
                    </div>
                  )}
                </div>
              )}

              {/* Payment & Collection Status Tracking (Approved Invoices Only) */}
              {selectedInvoice.status === 'Approved' && (
                <div style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📊 Payment &amp; Collection Tracker
                  </div>

                  {/* Payment Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>
                    <span className={`badge ${
                      selectedInvoice.paymentStatus === 'Paid' ? 'invoice-status-approved' :
                      selectedInvoice.paymentStatus === 'Awaiting Cash Payment' ? 'invoice-status-draft' :
                      selectedInvoice.paymentStatus === 'Payment Deferred' ? 'invoice-status-final' : 'invoice-status-rejected'
                    }`} style={{ fontSize: '0.725rem', padding: '4px 10px' }}>
                      {selectedInvoice.paymentStatus || 'Pending'}
                    </span>
                  </div>

                  {/* Payment Preference display */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Payment Preference:</span>
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>
                      {selectedInvoice.paymentPreference || 'UPI'}
                    </strong>
                  </div>

                  {/* Deferment specific metadata */}
                  {selectedInvoice.paymentStatus === 'Payment Deferred' && (
                    <div style={{
                      backgroundColor: 'rgba(99,102,241,0.06)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      borderLeft: '3px solid var(--primary)',
                      fontSize: '0.75rem',
                      color: 'var(--text-main)'
                    }}>
                      <div>Deferred Until: <strong>{selectedInvoice.deferredUntil}</strong></div>
                      {selectedInvoice.deferredRemarks && <div style={{ fontStyle: 'italic', marginTop: '2px' }}>"{selectedInvoice.deferredRemarks}"</div>}
                    </div>
                  )}

                  {/* Collection Status Selector (Admin Controlled) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Collection:</span>
                    <select
                      className="form-input"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', maxWidth: '160px', marginBottom: 0 }}
                      value={selectedInvoice.collectionStatus || 'Pending Collection'}
                      onChange={e => handleCollectionStatusChange(selectedInvoice, e.target.value)}
                    >
                      <option value="Pending Collection">Pending Collection</option>
                      <option value="Ready for Collection">Ready for Collection</option>
                      <option value="Collected">Collected</option>
                    </select>
                  </div>

                  {/* Customer View Tracking Statistics (Instruction 2) */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <div>
                      Invoice Viewed: <strong>{selectedInvoice.viewed === 'Yes' ? 'Yes ✅' : 'No ❌'}</strong>
                    </div>
                    {selectedInvoice.viewed === 'Yes' && (
                      <div style={{ fontSize: '0.7rem', marginTop: '2px', color: 'var(--success)' }}>
                        Date: {selectedInvoice.viewedDate} at {selectedInvoice.viewedTime}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedInvoice.status === 'Draft' && editingId !== selectedInvoice.id && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => startEditing(selectedInvoice)}
                  >
                    <Edit2 size={13} /> Edit Rates / Overrides
                  </button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-sm"
                      style={{ flex: 1, background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600 }}
                      onClick={() => handleApprove(selectedInvoice)}
                    >
                      <CheckCircle size={13} /> Approve (Lock)
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
                  {selectedInvoice.paymentStatus !== 'Paid' && (
                    <button
                      className="btn btn-sm"
                      style={{
                        background: 'var(--success)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontWeight: 600
                      }}
                      onClick={() => {
                        setCashAmount(selectedInvoice.totalAmount.toString());
                        setCashDate('2026-06-18');
                        setCashRemarks('');
                        setShowCashModal(true);
                      }}
                    >
                      Mark Payment Received
                    </button>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onClick={() => openCustomerPortal(selectedInvoice)}
                    >
                      View as Customer
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onClick={() => handleGeneratePDF(selectedInvoice)}
                    >
                      <Printer size={14} /> PDF / Print
                    </button>
                  </div>
                </div>
              )}

              {selectedInvoice.status === 'Rejected' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'var(--danger-light)', padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca',
                    fontSize: '0.8rem', color: '#fa1212'
                  }}>
                    <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />
                    This invoice was rejected. You can edit rates and re-approve.
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => startEditing(selectedInvoice)}
                  >
                    <Edit2 size={13} /> Re-edit Draft Specs
                  </button>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedInvoice(null); setEditingId(null); }}>
                <X size={14} /> Close
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleGeneratePDF(selectedInvoice)}
                >
                  <Printer size={14} /> Print Receipt
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => alert('Download Invoice feature — coming soon!')}
                >
                  <Download size={14} /> Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin: Mark Cash Payment Received Modal Popup (Instruction 6) */}
      {showCashModal && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Mark Cash Payment Received</h3>
              <button className="modal-close" onClick={() => setShowCashModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Payment Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={cashAmount}
                  onChange={e => setCashAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={cashDate}
                  onChange={e => setCashDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '60px', resize: 'vertical' }}
                  value={cashRemarks}
                  placeholder="e.g. Paid in cash at collection desk"
                  onChange={e => setCashRemarks(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCashModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={() => handleMarkPaid(selectedInvoice)}>Save Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* Customer View: Invoice Details & Payment Preferences Portal Modal (Instructions 1, 2, 6) */}
      {showCustomerPortal && selectedInvoice && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '90%', width: '920px', height: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-inprogress" style={{ fontSize: '0.65rem', padding: '3px 8px' }}>Client View</span>
                <h3>Client Invoice &amp; Payment Portal</h3>
              </div>
              <button className="modal-close" onClick={() => setShowCustomerPortal(false)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ flex: 1, padding: 0, display: 'grid', gridTemplateColumns: '1.2fr 1fr', overflow: 'hidden' }}>
              
              {/* Left Side: Invoice Document Pre-visual */}
              <div style={{ padding: '24px', overflowY: 'auto', borderRight: '1px solid var(--border-color)', height: '100%' }}>
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '0.85rem'
                }}>
                  {/* Header info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, color: 'var(--primary)', margin: 0 }}>WarpWrap Textile</h4>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Salem &amp; Banglore Warping Units</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-main)' }}>{selectedInvoice.id}</strong>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Date: {selectedInvoice.invoiceDate}</span>
                    </div>
                  </div>

                  {/* Customer details */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Bill To:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{selectedInvoice.customerName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedInvoice.companyName}</div>
                  </div>

                  {/* Line Item specs */}
                  <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '6px', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Item Specs</span>
                      <span>Total</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)', fontSize: '0.8rem' }}>
                      <div>
                        <strong>Yarn Warping Run - {selectedInvoice.yarnType}</strong>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {selectedInvoice.totalYarns.toLocaleString()} Yarns | {selectedInvoice.bellCount} Bells @ ₹{selectedInvoice.ratePerThousand}/1K
                        </div>
                      </div>
                      <span style={{ fontWeight: 700 }}>₹{Number(selectedInvoice.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '180px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '2px solid var(--text-main)', fontWeight: 800, color: 'var(--primary)' }}>
                        <span>Grand Total:</span>
                        <span>₹{Number(selectedInvoice.totalAmount).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Payment Preferences Portal */}
              <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                
                {/* Current Status overview */}
                <div style={{
                  background: 'var(--bg-app)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Payment:</span>
                    <strong style={{ color: selectedInvoice.paymentStatus === 'Paid' ? 'var(--success)' : 'var(--danger)' }}>
                      {selectedInvoice.paymentStatus || 'Pending'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Collection Status:</span>
                    <strong style={{ color: 'var(--primary)' }}>
                      {selectedInvoice.collectionStatus || 'Pending Collection'}
                    </strong>
                  </div>
                </div>

                {selectedInvoice.paymentStatus === 'Paid' ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '32px 16px',
                    background: 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '8px',
                    color: 'var(--success)'
                  }}>
                    <CheckCircle size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
                    <h4 style={{ margin: 0, fontWeight: 700 }}>Invoice Fully Paid!</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Thank you for your business. The transaction ledger has been updated.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Select Payment Preference</h4>
                    
                    {/* Preference Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '8px' }}>
                      {[
                        { key: 'upi', label: 'Online UPI' },
                        { key: 'cash', label: 'Cash on Collection' },
                        { key: 'defer', label: 'Need More Time' }
                      ].map(tab => (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setPortalActiveTab(tab.key)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            background: 'none',
                            border: 'none',
                            borderBottom: portalActiveTab === tab.key ? '3px solid var(--primary)' : '3px solid transparent',
                            color: portalActiveTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Panels */}
                    <div style={{ flex: 1 }}>
                      {portalActiveTab === 'upi' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'flex-start' }}>
                            Scan QR Code in your mobile UPI app to settle the payment.
                          </span>

                          <div style={{ background: 'var(--bg-app)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '8px' }}>
                              Merchant: <strong>WarpWrap Textile</strong>
                            </div>

                            {/* Beautiful High-Fidelity SVG UPI QR Code representation (Instruction 6) */}
                            <svg width="140" height="140" viewBox="0 0 100 100" style={{ display: 'block', margin: '0 auto', background: 'white' }}>
                              <rect width="100" height="100" fill="white" />
                              {/* Position boxes */}
                              <rect x="5" y="5" width="25" height="25" fill="#4f46e5" />
                              <rect x="10" y="10" width="15" height="15" fill="white" />
                              <rect x="13" y="13" width="9" height="9" fill="#4f46e5" />

                              <rect x="70" y="5" width="25" height="25" fill="#4f46e5" />
                              <rect x="75" y="10" width="15" height="15" fill="white" />
                              <rect x="78" y="13" width="9" height="9" fill="#4f46e5" />

                              <rect x="5" y="70" width="25" height="25" fill="#4f46e5" />
                              <rect x="10" y="75" width="15" height="15" fill="white" />
                              <rect x="13" y="78" width="9" height="9" fill="#4f46e5" />

                              {/* QR Grid mock pixels */}
                              <rect x="35" y="5" width="5" height="5" fill="#1e293b" />
                              <rect x="45" y="5" width="10" height="5" fill="#1e293b" />
                              <rect x="60" y="5" width="5" height="5" fill="#1e293b" />
                              <rect x="35" y="15" width="15" height="5" fill="#1e293b" />
                              <rect x="55" y="15" width="10" height="5" fill="#1e293b" />
                              <rect x="40" y="25" width="5" height="10" fill="#1e293b" />
                              <rect x="50" y="25" width="15" height="5" fill="#1e293b" />
                              <rect x="5" y="35" width="5" height="15" fill="#1e293b" />
                              <rect x="15" y="40" width="10" height="5" fill="#1e293b" />
                              <rect x="30" y="35" width="15" height="5" fill="#1e293b" />
                              <rect x="50" y="35" width="5" height="15" fill="#1e293b" />
                              <rect x="60" y="40" width="15" height="5" fill="#1e293b" />
                              <rect x="80" y="35" width="15" height="5" fill="#1e293b" />
                              <rect x="5" y="55" width="10" height="5" fill="#1e293b" />
                              <rect x="20" y="55" width="5" height="10" fill="#1e293b" />
                              <rect x="35" y="50" width="10" height="5" fill="#1e293b" />
                              <rect x="50" y="55" width="20" height="5" fill="#1e293b" />
                              <rect x="75" y="50" width="5" height="15" fill="#1e293b" />
                              <rect x="85" y="55" width="10" height="5" fill="#1e293b" />
                              <rect x="35" y="65" width="5" height="15" fill="#1e293b" />
                              <rect x="45" y="70" width="15" height="5" fill="#1e293b" />
                              <rect x="65" y="65" width="5" height="15" fill="#1e293b" />
                              <rect x="75" y="70" width="10" height="5" fill="#1e293b" />
                              <rect x="35" y="85" width="15" height="5" fill="#1e293b" />
                              <rect x="55" y="80" width="5" height="15" fill="#1e293b" />
                              <rect x="65" y="85" width="15" height="5" fill="#1e293b" />
                              <rect x="85" y="80" width="5" height="15" fill="#1e293b" />

                              {/* Purple center square */}
                              <rect x="44" y="44" width="12" height="12" fill="#818cf8" rx="2" />
                              <text x="50" y="52" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle">W</text>
                            </svg>

                            <div style={{ fontSize: '0.725rem', color: 'var(--text-main)', fontWeight: 600, textAlign: 'center', marginTop: '8px' }}>
                              ₹{Number(selectedInvoice.totalAmount).toLocaleString()}
                            </div>
                          </div>

                          {upiStatus === 'Pending' && (
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ width: '100%', marginTop: '8px' }}
                              onClick={() => handleUpiPay(selectedInvoice)}
                            >
                              Pay with UPI
                            </button>
                          )}

                          {upiStatus === 'Processing' && (
                            <div style={{ textAlign: 'center', width: '100%', padding: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <div className="progress-container" style={{ height: '4px', marginBottom: '8px' }}>
                                <div className="progress-fill status-started" style={{ width: '60%' }} />
                              </div>
                              Verifying payment with bank gateway...
                            </div>
                          )}

                          {upiStatus === 'Successful' && (
                            <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              ✓ Payment Received Successfully!
                            </div>
                          )}
                        </div>
                      )}

                      {portalActiveTab === 'cash' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Choose to pay cash directly to the operator when you collect your warp beam.
                          </span>
                          
                          <div style={{
                            background: 'rgba(245,158,11,0.06)',
                            padding: '14px',
                            borderRadius: '8px',
                            border: '1px dashed rgba(245,158,11,0.4)',
                            fontSize: '0.78rem',
                            color: 'var(--text-main)',
                            lineHeight: 1.5
                          }}>
                            <strong>Awaiting Cash Payment:</strong> Selecting this will shift the invoice status to Awaiting Cash Payment. 
                            The admin will mark it as Paid once cash is received during collection.
                          </div>

                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ background: 'var(--warning)', borderColor: 'var(--warning)', color: 'white', width: '100%' }}
                            onClick={() => handleCollectionSelect(selectedInvoice)}
                          >
                            Confirm Pay on Collection
                          </button>
                        </div>
                      )}

                      {portalActiveTab === 'defer' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Defer payment to a future date. (WarpWrap credit policy rules apply).
                          </span>

                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Deferment Period</label>
                            <select
                              className="form-input"
                              style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                              value={deferOption}
                              onChange={e => setDeferOption(e.target.value)}
                            >
                              <option value="Tomorrow">Tomorrow (1 Day)</option>
                              <option value="3 Days">3 Days</option>
                              <option value="1 Week">1 Week</option>
                              <option value="Custom">Custom Date</option>
                            </select>
                          </div>

                          {deferOption === 'Custom' && (
                            <div className="form-group">
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Deferred Until</label>
                              <input
                                type="date"
                                className="form-input"
                                style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                                value={deferDate}
                                onChange={e => setDeferDate(e.target.value)}
                              />
                            </div>
                          )}

                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Remarks / Reason</label>
                            <textarea
                              className="form-input"
                              placeholder="Remarks why deferment is needed..."
                              style={{ minHeight: '50px', fontSize: '0.8rem', resize: 'vertical' }}
                              value={deferRemarks}
                              onChange={e => setDeferRemarks(e.target.value)}
                            />
                          </div>

                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={() => handleDeferSave(selectedInvoice)}
                          >
                            Save Deferment
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ flexShrink: 0 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCustomerPortal(false)}>Close Portal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoiceManager;
