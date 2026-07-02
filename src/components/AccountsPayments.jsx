import React, { useState } from 'react';
import { IndianRupee, Plus, Wallet, Clock, Users, ArrowUpRight, FileText, CheckCircle, Search, Calendar, Landmark, Info, MessageSquare } from 'lucide-react';

function AccountsPayments({ customers, invoices, payments, savePayments, advances, saveAdvances, triggerNotification }) {
  const TODAY_STR = "2026-06-18";
  
  // State for active Ledger customer
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers.length > 0 ? customers[0].id : '');
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);

  // Advance Form State
  const [advanceCustomer, setAdvanceCustomer] = useState(customers.length > 0 ? customers[0].id : '');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceMethod, setAdvanceMethod] = useState('UPI');
  const [advanceDate, setAdvanceDate] = useState(TODAY_STR);
  const [advanceRemarks, setAdvanceRemarks] = useState('');
  const [formError, setFormError] = useState('');

  // ─────────────────────────────────────────────
  // Global Accounts Dashboard Stats
  // ─────────────────────────────────────────────

  const globalStats = (() => {
    let totalOutstanding = 0;
    let outstandingCustomersCount = 0;
    let totalAdvances = 0;

    customers.forEach(c => {
      if (c.outstandingBalance > 0) {
        totalOutstanding += c.outstandingBalance;
        outstandingCustomersCount++;
      }
      totalAdvances += c.advanceAmount;
    });

    // Today's Collection (payments recorded on 2026-06-18)
    const todaysPayments = payments.filter(p => p.date === TODAY_STR);
    const todaysCollection = todaysPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Weekly Collection (last 7 days, 2026-06-12 to 2026-06-18)
    const referenceDate = new Date(TODAY_STR);
    const startOfWeek = new Date(referenceDate);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const weeklyPayments = payments.filter(p => {
      const pDate = new Date(p.date);
      return pDate >= startOfWeek && pDate <= referenceDate;
    });
    const weeklyCollection = weeklyPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Pending Payments: Unpaid Approved Invoices
    const pendingInvoices = invoices.filter(inv => inv.status === 'Approved' && inv.paymentStatus !== 'Paid');
    const pendingInvoicesCount = pendingInvoices.length;
    const pendingInvoicesSum = pendingInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    return {
      totalOutstanding,
      outstandingCustomersCount,
      totalAdvances,
      todaysCollection,
      weeklyCollection,
      pendingInvoicesCount,
      pendingInvoicesSum
    };
  })();

  // ─────────────────────────────────────────────
  // Ledger Builder
  // ─────────────────────────────────────────────
  const ledgerData = (() => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return [];

    // 1. Opening Balance
    const txs = [];
    if (customer.openingBalance > 0) {
      txs.push({
        date: customer.createdDate || "2026-06-01",
        ref: "OP-BAL",
        description: "Opening Balance",
        type: "Opening Balance",
        debit: customer.openingBalance,
        credit: 0,
        rawDate: new Date(customer.createdDate || "2026-06-01")
      });
    }

    // 2. Approved Invoices
    const custInvoices = invoices.filter(
      inv => inv.status === 'Approved' && 
      (inv.companyName === customer.companyName || inv.customerName === customer.name)
    );
    custInvoices.forEach(inv => {
      txs.push({
        date: inv.invoiceDate || inv.orderDate,
        ref: inv.id,
        description: `Invoice Approved (Warping Run: ${inv.orderId})`,
        type: "Invoice",
        debit: Number(inv.totalAmount),
        credit: 0,
        rawDate: new Date(inv.invoiceDate || inv.orderDate)
      });
    });

    // 3. Payments
    const custPayments = payments.filter(p => p.customerId === customer.id);
    custPayments.forEach(p => {
      txs.push({
        date: p.date,
        ref: p.id || "PAYMENT",
        description: `Payment Received (${p.method}) ${p.remarks ? ' - ' + p.remarks : ''}`,
        type: "Payment",
        debit: 0,
        credit: Number(p.amount),
        rawDate: new Date(p.date)
      });
    });

    // 4. Advances
    const custAdvances = advances.filter(a => a.customerId === customer.id);
    custAdvances.forEach(a => {
      txs.push({
        date: a.date,
        ref: a.id || "ADVANCE",
        description: `Advance Received (${a.method}) ${a.remarks ? ' - ' + a.remarks : ''}`,
        type: "Advance",
        debit: 0,
        credit: Number(a.amount),
        rawDate: new Date(a.date)
      });
    });

    // Sort chronologically
    txs.sort((a, b) => a.rawDate - b.rawDate);

    // Calculate running balance
    let running = 0;
    const items = txs.map(tx => {
      running += (tx.debit - tx.credit);
      return {
        ...tx,
        balance: running
      };
    });

    return items;
  })();

  // Handle Advance Save
  const handleSaveAdvance = (e) => {
    e.preventDefault();
    setFormError('');

    const customer = customers.find(c => c.id === advanceCustomer);
    if (!customer) {
      setFormError('Please select a customer.');
      return;
    }
    const amt = parseFloat(advanceAmount);
    if (isNaN(amt) || amt <= 0) {
      setFormError('Please enter a valid positive advance amount.');
      return;
    }
    if (!advanceDate) {
      setFormError('Please specify a date.');
      return;
    }

    const newAdvance = {
      id: `ADV-${Date.now().toString().slice(-4)}`,
      customerId: customer.id,
      customerName: customer.companyName || customer.name,
      amount: amt,
      date: advanceDate,
      method: advanceMethod,
      remarks: advanceRemarks.trim()
    };

    saveAdvances([...advances, newAdvance]);
    
    // Note: Do NOT trigger notifications for advance payments per instruction 8.
    
    // Reset Form
    setAdvanceAmount('');
    setAdvanceRemarks('');
    setShowAdvanceModal(false);
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedCustomerStats = selectedCustomer ? {
    opening: selectedCustomer.openingBalance,
    invoiceTotal: selectedCustomer.invoiceAmount,
    paymentTotal: selectedCustomer.payments,
    advanceTotal: selectedCustomer.advanceAmount,
    outstanding: selectedCustomer.outstandingBalance
  } : null;

  return (
    <div>
      {/* Page Header */}
      <div className="section-header">
        <div className="header-title">
          <h1 style={{ fontFamily: 'var(--font-heading)' }}>Accounts &amp; Payments</h1>
          <p>Monitor collection status, manage customer ledgers, and receive advance payments.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdvanceModal(true)}>
          <Plus size={18} />
          Receive Advance
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Outstanding Amount */}
        <div className="kpi-card rose" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div className="kpi-icon-wrapper" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            <IndianRupee size={20} />
          </div>
          <span className="kpi-title">Outstanding Amount</span>
          <span className="kpi-value" style={{ color: 'var(--danger)' }}>
            ₹{globalStats.totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="kpi-desc">
            Across {globalStats.outstandingCustomersCount} customers
          </span>
        </div>

        {/* Pending Payments */}
        <div className="kpi-card amber" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="kpi-icon-wrapper" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Clock size={20} />
          </div>
          <span className="kpi-title">Pending Invoices</span>
          <span className="kpi-value">
            ₹{globalStats.pendingInvoicesSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="kpi-desc">
            {globalStats.pendingInvoicesCount} invoices unpaid
          </span>
        </div>

        {/* Today's Collection */}
        <div className="kpi-card emerald" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="kpi-icon-wrapper" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <Landmark size={20} />
          </div>
          <span className="kpi-title">Today's Collection</span>
          <span className="kpi-value" style={{ color: 'var(--success)' }}>
            ₹{globalStats.todaysCollection.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="kpi-desc">
            System Date: {TODAY_STR}
          </span>
        </div>

        {/* Weekly Collection */}
        <div className="kpi-card indigo" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="kpi-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Landmark size={20} />
          </div>
          <span className="kpi-title">Weekly Collection</span>
          <span className="kpi-value">
            ₹{globalStats.weeklyCollection.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="kpi-desc">
            Last 7 calendar days
          </span>
        </div>

        {/* Advance Balance */}
        <div className="kpi-card cyan">
          <div className="kpi-icon-wrapper" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
            <Wallet size={20} />
          </div>
          <span className="kpi-title">Total Customer Advances</span>
          <span className="kpi-value">
            ₹{globalStats.totalAdvances.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="kpi-desc">
            Deposits on account
          </span>
        </div>
      </div>

      {/* Main Split Layout: Ledger and Outstanding Customer Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start', marginTop: '32px' }} className="invoice-split-grid">
        
        {/* Customer Ledger */}
        <div className="card">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title">
              <h3>
                <FileText size={18} style={{ color: 'var(--primary)' }} />
                Customer Ledger
              </h3>
            </div>
            {/* Customer Dropdown */}
            <select
              className="form-input"
              style={{ maxWidth: '280px', marginBottom: 0 }}
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <div className="card-body">
            {selectedCustomer ? (
              <div>
                {/* Selected Customer Profile summary */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Opening Balance</span>
                    <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-main)', marginTop: '4px' }}>
                      ₹{selectedCustomerStats.opening.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Invoice Total (+)</span>
                    <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-main)', marginTop: '4px' }}>
                      ₹{selectedCustomerStats.invoiceTotal.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Payments/Advances (-)</span>
                    <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-main)', marginTop: '4px' }}>
                      ₹{(selectedCustomerStats.paymentTotal + selectedCustomerStats.advanceTotal).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Net Outstanding</span>
                    <strong style={{ 
                      display: 'block', 
                      fontSize: '1.1rem', 
                      color: selectedCustomerStats.outstanding > 0 ? 'var(--danger)' : 'var(--success)', 
                      fontWeight: 800,
                      marginTop: '4px' 
                    }}>
                      ₹{selectedCustomerStats.outstanding.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Ledger Transactions Table */}
                {ledgerData.length > 0 ? (
                  <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <table className="table">
                      <thead>
                        <tr style={{ background: 'var(--bg-app)' }}>
                          <th style={{ padding: '12px 14px' }}>Date</th>
                          <th>Reference ID</th>
                          <th>Transaction Description</th>
                          <th style={{ textAlign: 'right' }}>Debit (Dr)</th>
                          <th style={{ textAlign: 'right' }}>Credit (Cr)</th>
                          <th style={{ textAlign: 'right', paddingRight: '14px' }}>Outstanding</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledgerData.map((row, idx) => (
                          <tr key={idx}>
                            <td style={{ fontSize: '0.825rem', whiteSpace: 'nowrap', padding: '12px 14px' }}>{row.date}</td>
                            <td style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.825rem' }}>{row.ref}</td>
                            <td style={{ fontSize: '0.825rem' }}>{row.description}</td>
                            <td style={{ textAlign: 'right', color: 'var(--text-main)', fontWeight: row.debit > 0 ? 600 : 400 }}>
                              {row.debit > 0 ? `₹${row.debit.toLocaleString()}` : '—'}
                            </td>
                            <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: row.credit > 0 ? 600 : 400 }}>
                              {row.credit > 0 ? `₹${row.credit.toLocaleString()}` : '—'}
                            </td>
                            <td style={{ 
                              textAlign: 'right', 
                              fontWeight: 700, 
                              color: row.balance > 0 ? 'var(--danger)' : 'var(--success)',
                              paddingRight: '14px'
                            }}>
                              ₹{row.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    <Landmark size={30} style={{ marginBottom: '8px', color: '#cbd5e1' }} />
                    <p style={{ fontSize: '0.85rem' }}>No ledger transactions recorded for this customer.</p>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Please select or register a customer first.</p>
            )}
          </div>
        </div>

        {/* Outstanding Customers List */}
        <div className="card">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="card-title">
              <h3>
                <Users size={18} style={{ color: 'var(--danger)' }} />
                Outstanding Customers
              </h3>
            </div>
          </div>
          <div className="card-body" style={{ maxHeight: '420px', overflowY: 'auto', padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {customers
                .filter(c => c.outstandingBalance > 0)
                .sort((a, b) => b.outstandingBalance - a.outstandingBalance)
                .map(c => (
                  <div 
                    key={c.id} 
                    style={{ 
                      background: 'var(--bg-card)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: 'var(--radius-md)', 
                      padding: '12px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      backgroundColor: selectedCustomerId === c.id ? 'rgba(99,102,241,.08)' : 'transparent'
                    }}
                    onClick={() => setSelectedCustomerId(c.id)}
                    className="yarn-rate-row"
                  >
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{c.companyName}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contact: {c.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--danger)' }}>
                        ₹{c.outstandingBalance.toLocaleString()}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Outstanding Balance</span>
                    </div>
                  </div>
                ))}
              {customers.filter(c => c.outstandingBalance > 0).length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <CheckCircle size={24} style={{ color: 'var(--success)', marginBottom: '6px' }} />
                  <p>All accounts are fully paid!</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* History Log Section */}
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>
          Transaction History Schedules
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="invoice-split-grid">
          
          {/* Payment History Card */}
          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="card-title">
                <h3>Payment History</h3>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {payments.length > 0 ? (
                <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Ref Invoice</th>
                        <th>Client</th>
                        <th>Amount</th>
                        <th>Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...payments].sort((a,b)=> new Date(b.date) - new Date(a.date)).map(p => (
                        <tr key={p.id}>
                          <td>{p.date}</td>
                          <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{p.invoiceId}</td>
                          <td>{p.customerName}</td>
                          <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{Number(p.amount).toLocaleString()}</td>
                          <td>
                            <span className="badge badge-inprogress" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                              {p.method}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '0.85rem' }}>No payment receipts recorded.</p>
                </div>
              )}
            </div>
          </div>

          {/* Advance History Card */}
          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="card-title">
                <h3>Advance Credits Log</h3>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {advances.length > 0 ? (
                <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Client</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...advances].sort((a,b)=> new Date(b.date) - new Date(a.date)).map(a => (
                        <tr key={a.id}>
                          <td>{a.date}</td>
                          <td>{a.customerName}</td>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{Number(a.amount).toLocaleString()}</td>
                          <td>
                            <span className="badge badge-completed" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                              {a.method}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.remarks || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '0.85rem' }}>No advance payments recorded.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Receive Advance Modal Popup */}
      {showAdvanceModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Record Advance Payment</h3>
              <button className="modal-close" onClick={() => setShowAdvanceModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveAdvance}>
              <div className="modal-body">
                {formError && (
                  <div style={{
                    backgroundColor: 'var(--danger-light)',
                    color: 'var(--danger)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    marginBottom: '16px',
                    fontWeight: 600
                  }}>
                    {formError}
                  </div>
                )}

                {/* Customer Dropdown */}
                <div className="form-group">
                  <label className="form-label">Select Customer</label>
                  <select
                    className="form-input"
                    value={advanceCustomer}
                    onChange={e => setAdvanceCustomer(e.target.value)}
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div className="form-group">
                  <label className="form-label">Advance Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 5000"
                    className="form-input"
                    value={advanceAmount}
                    onChange={e => setAdvanceAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  {/* Payment Method */}
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select
                      className="form-input"
                      value={advanceMethod}
                      onChange={e => setAdvanceMethod(e.target.value)}
                    >
                      <option value="UPI">UPI / Online</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  {/* Date */}
                  <div className="form-group">
                    <label className="form-label">Receipt Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={advanceDate}
                      onChange={e => setAdvanceDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div className="form-group">
                  <label className="form-label">Remarks (Optional)</label>
                  <textarea
                    className="form-input"
                    placeholder="Reference details, transaction notes..."
                    style={{ minHeight: '70px', resize: 'vertical' }}
                    value={advanceRemarks}
                    onChange={e => setAdvanceRemarks(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdvanceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Advance Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountsPayments;
