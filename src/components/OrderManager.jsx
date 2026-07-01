import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Calendar, Truck, Eye, AlertTriangle, CheckCircle, X, Info, FileText, IndianRupee } from 'lucide-react';
import { calculateCompletionDays, calculateDelayRisk, calculateWorkload } from './orderUtils';

function OrderManager({ orders, saveOrders, customers, yarnRates = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [threadType, setThreadType] = useState('');
  const [totalYarns, setTotalYarns] = useState('');
  const [bellCount, setBellCount] = useState('');
  const [sections, setSections] = useState('');
  const [borderWidth, setBorderWidth] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [transportRequired, setTransportRequired] = useState(false);
  const [status, setStatus] = useState('Received');
  const [specialNotes, setSpecialNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Available yarn types — from rate master if available, else fallback
  const FALLBACK_YARNS = ['Cotton', 'Silk', 'Polyester', 'Blend', 'Wool', 'Linen'];
  const availableYarnTypes = yarnRates.length > 0
    ? yarnRates.map(r => r.yarnType)
    : FALLBACK_YARNS;

  // Auto-calculate billing whenever relevant fields change
  const getAutoCalculatedPrice = (type, yarnsInput, bellsInput) => {
    const rateObj = yarnRates.find(r => r.yarnType === type);
    if (!rateObj) return null;
    const y = parseFloat(yarnsInput) || 0;
    const b = parseFloat(bellsInput) || 0;
    if (y <= 0 || b <= 0) return null;

    // Amount Per Bell = (Total Yarns × Rate Per 1000 Yarns) ÷ 1000
    const amtPerBell = (y * rateObj.ratePerThousand) / 1000;
    const total = amtPerBell * b;
    return { amtPerBell, total, rate: rateObj.ratePerThousand };
  };

  const liveBilling = getAutoCalculatedPrice(threadType, totalYarns, bellCount);

  // Handle open modal for Add
  const handleAddClick = () => {
    if (customers.length === 0) {
      alert("Please add at least one Customer before creating an order.");
      return;
    }
    setEditingOrder(null);
    setCustomerName(customers[0].companyName || customers[0].name);
    const defaultType = availableYarnTypes[0] || 'Cotton';
    setThreadType(defaultType);
    setTotalYarns('8350');
    setBellCount('6');
    setSections('10');
    setBorderWidth('2');
    setDeliveryDate('2026-06-20');
    setTransportRequired(false);
    setStatus('Received');
    setSpecialNotes('');
    setFormError('');
    setShowModal(true);
  };

  // Handle open modal for Edit
  const handleEditClick = (order) => {
    setEditingOrder(order);
    setCustomerName(order.customerName);
    setThreadType(order.threadType);
    setTotalYarns((order.totalYarns || order.bobbinCount || 0).toString());
    setBellCount(order.bellCount.toString());
    setSections((order.sections || 10).toString());
    setBorderWidth((order.borderWidth || 2).toString());
    setDeliveryDate(order.deliveryDate);
    setTransportRequired(order.transportRequired || false);
    setStatus(order.status);
    setSpecialNotes(order.specialNotes || '');
    setFormError('');
    setShowModal(true);
  };

  // Handle deleting order
  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      const updated = orders.filter(o => o.id !== id);
      saveOrders(updated);
    }
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customerName) {
      setFormError("Please select a customer.");
      return;
    }
    if (!threadType) {
      setFormError("Please select a thread type.");
      return;
    }
    if (!totalYarns || parseFloat(totalYarns) <= 0) {
      setFormError("Total Yarns must be a valid positive number.");
      return;
    }
    if (!bellCount || parseFloat(bellCount) <= 0) {
      setFormError("Bell Count must be a valid positive number.");
      return;
    }
    if (!sections || parseFloat(sections) <= 0) {
      setFormError("Sections must be a valid positive number.");
      return;
    }
    if (!borderWidth || parseFloat(borderWidth) < 0) {
      setFormError("Border Width must be a valid non-negative number.");
      return;
    }
    if (!deliveryDate) {
      setFormError("Delivery Date is required.");
      return;
    }

    if (!liveBilling) {
      setFormError("Yarn Type rate must be set in Yarn Rate Master first.");
      return;
    }

    const calculatedPrice = liveBilling.total;

    // Auto-calculate progress based on status
    let progressVal = 10;
    if (status === 'Started') progressVal = 30;
    else if (status === 'In Progress') progressVal = 60;
    else if (status === 'Completed') progressVal = 90;
    else if (status === 'Delivered') progressVal = 100;

    if (editingOrder) {
      // Edit
      const updated = orders.map(o => {
        if (o.id === editingOrder.id) {
          return {
            ...o,
            customerName,
            threadType,
            totalYarns: parseInt(totalYarns),
            bobbinCount: parseInt(totalYarns), // fallback
            bellCount: parseInt(bellCount),
            sections: parseInt(sections),
            borderWidth: parseFloat(borderWidth),
            deliveryDate,
            transportRequired,
            status,
            price: calculatedPrice,
            progress: progressVal,
            specialNotes: specialNotes.trim()
          };
        }
        return o;
      });
      saveOrders(updated);
    } else {
      // Add
      const newOrder = {
        id: `ORD-${Date.now().toString().slice(-3)}`,
        customerName,
        threadType,
        totalYarns: parseInt(totalYarns),
        bobbinCount: parseInt(totalYarns), // fallback
        bellCount: parseInt(bellCount),
        sections: parseInt(sections),
        borderWidth: parseFloat(borderWidth),
        deliveryDate: deliveryDate,
        transportRequired,
        status,
        price: calculatedPrice,
        progress: progressVal,
        specialNotes: specialNotes.trim(),
        dateCreated: new Date("2026-06-18").toISOString().split('T')[0] // today
      };
      saveOrders([...orders, newOrder]);
    }
    setShowModal(false);
  };

  // Get status color coding
  const getStatusBadgeClass = (statusStr) => {
    switch (statusStr) {
      case 'Received': return 'badge-received';
      case 'Started': return 'badge-started';
      case 'In Progress': return 'badge-inprogress';
      case 'Completed': return 'badge-completed';
      case 'Delivered': return 'badge-delivered';
      default: return 'badge-received';
    }
  };

  // Filter & Search orders
  const filteredOrders = orders.filter(order => {
    const custName = order.customerName || '';
    const thType = order.threadType || '';
    const id = order.id || '';
    const matchesSearch = custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate live values during order creation/editing
  const liveCompletion = calculateCompletionDays(totalYarns, bellCount, sections);

  let tempProgress = 10;
  if (status === 'Started') tempProgress = 30;
  else if (status === 'In Progress') tempProgress = 60;
  else if (status === 'Completed') tempProgress = 90;
  else if (status === 'Delivered') tempProgress = 100;

  const liveDelay = calculateDelayRisk(deliveryDate, tempProgress, status);
  const globalWorkload = calculateWorkload(orders);

  return (
    <div>
      {/* Page Header */}
      <div className="section-header">
        <div className="header-title">
          <h1>Order Management</h1>
          <p>Create, track, and calculate warping specifications for client warping requests.</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddClick}>
          <Plus size={18} />
          Create Order
        </button>
      </div>

      {/* Stats Summary cards */}
      <div className="kpi-grid">
        <div className="kpi-card indigo">
          <div className="kpi-icon-wrapper">
            <FileText size={20} />
          </div>
          <span className="kpi-title">Active Orders</span>
          <span className="kpi-value">
            {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed').length}
          </span>
          <span className="kpi-desc">Currently in system</span>
        </div>

        <div
          className="kpi-card"
          style={{ borderLeft: "4px solid var(--danger)" }}
        >
          <div
            className="kpi-icon-wrapper"
            style={{
              background: "hsla(0, 91%, 48%, 0.15)",
              color: "var(--danger)"
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <span className="kpi-title">System Workload</span>
          <span className="kpi-value" style={{ fontSize: '1.45rem', textTransform: 'capitalize' }}>
            {globalWorkload.label}
          </span>
          <span className="kpi-desc">
            <span className={`kpi-badge ${globalWorkload.color === 'red' ? 'danger' : globalWorkload.color === 'yellow' ? 'warning' : 'success'}`}>
              {globalWorkload.count} Active
            </span>
            Pending queue load
          </span>
        </div>

        <div className="kpi-card emerald">
          <div className="kpi-icon-wrapper">
            <CheckCircle size={20} />
          </div>
          <span className="kpi-title">Completed / Archived</span>
          <span
            className="kpi-value"
            style={{
              color: "var(--primary)",
              fontSize: "2.4rem",
              fontWeight: "700"
            }}
          >
            {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed').length}
          </span>
          <span className="kpi-desc">Processed runs</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search />
          <input
            type="text"
            placeholder="Search orders by Client, ID, thread..."
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="form-input"
          style={{ maxWidth: '200px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Received">Received</option>
          <option value="Started">Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {/* Orders Table */}
      {filteredOrders.length > 0 ? (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Yarn Specs</th>
                  <th>Delivery Date</th>
                  <th>Prediction Module</th>
                  <th>Value (₹)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const yarns = order.totalYarns || order.bobbinCount || 0;
                  const complDays = calculateCompletionDays(yarns, order.bellCount, order.sections);
                  const delayRisk = calculateDelayRisk(order.deliveryDate, order.progress, order.status);

                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                        {order.id}
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {order.customerName}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                            {order.threadType} Thread
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {yarns.toLocaleString()} Yarns | {order.bellCount} Bells | {order.sections || 10} Sec
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                          <Calendar size={13} className="text-muted" />
                          {order.deliveryDate}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className="prediction-pill completion" style={{ fontSize: '0.7rem' }}>
                            Est. {complDays}
                          </span>
                          <span className={`risk-indicator ${delayRisk.color}`} style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
                            {delayRisk.label}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        ₹{(order.price || 0).toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm btn-icon"
                            title="Quick View Details"
                            onClick={() => setViewingOrder(order)}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm btn-icon"
                            title="Edit Specification"
                            onClick={() => handleEditClick(order)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm btn-icon"
                            title="Cancel Order"
                            style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.15)' }}
                            onClick={() => handleDeleteClick(order.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <FileText />
          <h3>No Orders Found</h3>
          <p>No orders matched your active filters. Create a new order or update search filters.</p>
          <button className="btn btn-primary" onClick={handleAddClick}>
            <Plus size={16} /> Create First Order
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingOrder ? `Edit Order specs: ${editingOrder.id}` : 'Create Warp Run Order'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{
                    backgroundColor: 'var(--danger-light)',
                    color: 'var(--danger)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    marginBottom: '16px',
                    fontWeight: '500'
                  }}>
                    {formError}
                  </div>
                )}

                {/* Live Prediction Panel */}
                <div className="prediction-box">
                  <div className="prediction-box-header">
                    <Info size={16} />
                    <span>Live Production Predictions</span>
                  </div>
                  <div className="prediction-metrics">
                    <div className="prediction-metric-row">
                      <span className="text-muted">Estimated Duration:</span>
                      <strong style={{ color: 'var(--primary)' }}>{liveCompletion}</strong>
                    </div>
                    <div className="prediction-metric-row">
                      <span className="text-muted">Delivery Delay Risk:</span>
                      <strong className={`risk-indicator ${liveDelay.color}`} style={{ padding: '2px 6px', fontSize: '0.75rem' }}>
                        {liveDelay.label}
                      </strong>
                    </div>
                    <div className="prediction-metric-row">
                      <span className="text-muted">Total Pending Load:</span>
                      <strong style={{ color: globalWorkload.color === 'red' ? 'var(--danger)' : 'var(--success)' }}>
                        {globalWorkload.label} ({globalWorkload.count} Active)
                      </strong>
                    </div>
                  </div>
                  {liveDelay.reason && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: '8px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <AlertTriangle size={12} />
                      <span>{liveDelay.reason}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <select
                    className="form-input"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.companyName || c.name}>{c.companyName || c.name} ({c.name})</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Yarn Type</label>
                    <select
                      className="form-input"
                      value={threadType}
                      onChange={(e) => setThreadType(e.target.value)}
                    >
                      {availableYarnTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Border Width (inches)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={borderWidth}
                      onChange={(e) => setBorderWidth(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Total Yarns</label>
                    <input
                      type="number"
                      className="form-input"
                      value={totalYarns}
                      onChange={(e) => setTotalYarns(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bell Count</label>
                    <input
                      type="number"
                      className="form-input"
                      value={bellCount}
                      onChange={(e) => setBellCount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Sections</label>
                    <input
                      type="number"
                      className="form-input"
                      value={sections}
                      onChange={(e) => setSections(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Order Value Price (₹)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={liveBilling ? liveBilling.total.toFixed(2) : ''}
                      readOnly={true}
                      disabled={true}
                      style={{
                        background: "var(--bg-card)",
                        borderColor: "var(--border-color)",
                        cursor: "not-allowed",
                        color: "var(--success)",
                        fontWeight: 600
                      }}
                      placeholder="Will auto-calculate..."
                    />
                    {liveBilling && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--success)', marginTop: '4px' }}>
                        🔒 Locked: ₹{liveBilling.amtPerBell.toFixed(2)}/bell × {bellCount} bells = ₹{liveBilling.total.toFixed(2)}
                      </div>
                    )}
                    {!liveBilling && yarnRates.length > 0 && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--warning)', marginTop: '4px' }}>
                        ⚠️ Select yarn type with rate configured in Yarn Rate Master
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Billing Summary */}
                {liveBilling && (
                  <div className="billing-calc-box" style={{ margin: '12px 0 16px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IndianRupee size={13} /> Auto-Calculated Billing Summary
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '8px', fontSize: '0.75rem' }}>
                      <div style={{ textAlign: 'center', background: 'white', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '3px' }}>Rate / 1000</div>
                        <strong style={{color: 'var(--text-muted)'  }}>₹{liveBilling.rate}</strong>
                      </div>
                      <div style={{ textAlign: 'center', background: 'white', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{color: 'var(--text-muted)', marginBottom: '3px' }}>Amount Per Bell</div>
                        <strong style={{ color: 'var(--primary)' }}>₹{liveBilling.amtPerBell.toFixed(2)}</strong>
                      </div>
                      <div style={{ textAlign: 'center', background: '#ecf0f9', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '3px' }}>Total Amount</div>
                        <strong style={{ color: '#312e81', fontSize: '0.85rem' }}>₹{liveBilling.total.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Special Notes</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    placeholder="Enter any special weaving requests, borders details, or packaging notes..."
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Delivery Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-input"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Received">Received</option>
                      <option value="Started">Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <input
                    type="checkbox"
                    id="transport"
                    checked={transportRequired}
                    onChange={(e) => setTransportRequired(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="transport" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                    Transport/Delivery Required
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingOrder ? 'Save Spec' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3>Order Details: {viewingOrder.id}</h3>
              <button className="modal-close" onClick={() => setViewingOrder(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <span className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer / Client</span>
                  <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 600 }}>{viewingOrder.customerName}</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Thread Type</span>
                    <p style={{ fontWeight: '600' }}>{viewingOrder.threadType}</p>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Border Width</span>
                    <p style={{ fontWeight: '600' }}>{viewingOrder.borderWidth} inches</p>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Total Yarns</span>
                    <p style={{ fontWeight: '600' }}>{(viewingOrder.totalYarns || viewingOrder.bobbinCount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Bell Count</span>
                    <p style={{ fontWeight: '600' }}>{viewingOrder.bellCount}</p>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Sections</span>
                    <p style={{ fontWeight: '600' }}>{viewingOrder.sections || 10}</p>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Value / Price</span>
                    <p style={{ fontWeight: '600', color: 'var(--success)' }}>₹{(viewingOrder.price || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Delivery Date</span>
                    <p style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} className="text-muted" />
                      {viewingOrder.deliveryDate}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Status</span>
                    <div>
                      <span className={`badge ${getStatusBadgeClass(viewingOrder.status)}`} style={{ marginTop: '2px' }}>
                        {viewingOrder.status}
                      </span>
                    </div>
                  </div>
                </div>

                {viewingOrder.specialNotes && (
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Special Notes</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: 0, whiteSpace: 'pre-wrap' }}>{viewingOrder.specialNotes}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', fontSize: '0.85rem' }}>
                  <Truck size={16} style={{ color: viewingOrder.transportRequired ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <span>Transport Logistics: {viewingOrder.transportRequired ? 'Required (Included)' : 'Self Pickup by Client'}</span>
                </div>

                {/* Billing Calculation in Details */}
                {(() => {
                  const rateObj = yarnRates.find(r => r.yarnType === viewingOrder.threadType);
                  if (rateObj) {
                    const yarns = viewingOrder.totalYarns || viewingOrder.bobbinCount || 0;
                    const amtPerBell = (yarns * rateObj.ratePerThousand) / 1000;
                    const totalAmt = amtPerBell * viewingOrder.bellCount;
                    return (
                      <div className="billing-calc-box" style={{ margin: 0 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <IndianRupee size={13} /> Billing Summary (Yarn Rate Master)
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                          {[
                            { label: 'Rate Per 1000 Yarns', val: `₹${rateObj.ratePerThousand.toFixed(2)}` },
                            { label: 'Total Yarns', val: yarns.toLocaleString() },
                            { label: 'Amount Per Bell', val: `₹${amtPerBell.toFixed(2)}` },
                            { label: 'Bell Count', val: viewingOrder.bellCount },
                          ].map(row => (
                            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#64748b' }}>{row.label}</span>
                              <strong>{row.val}</strong>
                            </div>
                          ))}
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #d2daf3', marginTop: '4px' }}>
                            <span style={{ fontWeight: 700, color: '#1e3a8a' }}>Total Amount</span>
                            <strong style={{ color: '#4f46e5', fontSize: '1rem' }}>₹{totalAmt.toFixed(2)}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="prediction-box" style={{ margin: 0 }}>
                      <div className="prediction-box-header" style={{ color: '#1e3a8a' }}>
                        <Info size={14} />
                        <span>Production Estimations</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted">Est. Production Duration:</span>
   <strong
  style={{
    background: "rgba(59,130,246,.15)",
    color: "#93c5fd",
    border: "1px solid rgba(59,130,246,.35)",
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "0.75rem",
    fontWeight: 600
  }}
>
  Est.{" "}
  {calculateCompletionDays(
    viewingOrder.totalYarns || viewingOrder.bobbinCount || 0,
    viewingOrder.bellCount,
    viewingOrder.sections
  )}
</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="text-muted">Delay Risk Warning:</span>
                          <strong className={`risk-indicator ${calculateDelayRisk(viewingOrder.deliveryDate, viewingOrder.progress, viewingOrder.status).color}`}>
                            {calculateDelayRisk(viewingOrder.deliveryDate, viewingOrder.progress, viewingOrder.status).label}
                          </strong>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--warning)', marginTop: '4px' }}>
                          ⚠️ Add this yarn type to Yarn Rate Master for detailed billing breakdown.
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setViewingOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManager;
