import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Phone, MapPin, Package, Tag, X, Calendar, History, Eye, User, FileText, IndianRupee, CreditCard } from 'lucide-react';

function CustomerManager({ customers, saveCustomers, orders }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [createdDate, setCreatedDate] = useState('');
  const [materialSource, setMaterialSource] = useState('Market Supply');
  const [customerType, setCustomerType] = useState('New Customer');
  const [paymentPreference, setPaymentPreference] = useState('UPI');
  const [formError, setFormError] = useState('');

  const TODAY_STR = "2026-06-18";

  // Handle opening modal for Add
  const handleAddClick = () => {
    setEditingCustomer(null);
    setName('');
    setCompanyName('');
    setPhone('');
    setAddress('');
    setCreatedDate(TODAY_STR);
    setMaterialSource('Market Supply');
    setCustomerType('New Customer');
    setPaymentPreference('UPI');
    setFormError('');
    setShowModal(true);
  };

  // Handle opening modal for Edit
  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setCompanyName(customer.companyName || '');
    setPhone(customer.phone);
    setAddress(customer.address);
    setCreatedDate(customer.createdDate || TODAY_STR);
    setMaterialSource(customer.materialSource || 'Market Supply');
    setCustomerType(customer.customerType || 'New Customer');
    setPaymentPreference(customer.paymentPreference || 'UPI');
    setFormError('');
    setShowModal(true);
  };

  // Handle delete
  const handleDeleteClick = (id, name, company) => {
    const linkedOrders = orders.filter(o =>
      o.customerName.toLowerCase() === name.toLowerCase() ||
      o.customerName.toLowerCase() === (company || '').toLowerCase()
    );

    let confirmMsg = `Are you sure you want to delete ${name} (${company})?`;
    if (linkedOrders.length > 0) {
      confirmMsg = `WARNING: ${name} (${company}) has ${linkedOrders.length} active order(s) associated with them. Deleting this customer will keep their orders but they will refer to a deleted customer. Are you sure you want to proceed?`;
    }

    if (window.confirm(confirmMsg)) {
      const updated = customers.filter(c => c.id !== id);
      saveCustomers(updated);
    }
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Customer contact name is required');
      return;
    }
    if (!companyName.trim()) {
      setFormError('Company name is required');
      return;
    }
    if (!phone.trim()) {
      setFormError('Mobile number is required');
      return;
    }
    if (!address.trim()) {
      setFormError('Address is required');
      return;
    }
    if (!createdDate) {
      setFormError('Created Date is required');
      return;
    }

    if (editingCustomer) {
      // Edit
      const updated = customers.map(c => {
        if (c.id === editingCustomer.id) {
          return {
            ...c,
            name: name.trim(),
            companyName: companyName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            createdDate,
            materialSource,
            customerType,
            paymentPreference
          };
        }
        return c;
      });
      saveCustomers(updated);
    } else {
      // Add
      const newCust = {
        id: `CUST-${Date.now().toString().slice(-3)}`,
        name: name.trim(),
        companyName: companyName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        createdDate,
        materialSource,
        customerType,
        paymentPreference
      };
      saveCustomers([...customers, newCust]);
    }
    setShowModal(false);
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div>
      {/* Page Header */}
      <div className="section-header">
        <div className="header-title">
          <h1>Customer Management</h1>
          <p>Register, update, and manage details of textile warping clients.</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddClick}>
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search />
          <input
            type="text"
            placeholder="Search customers by name, company, mobile or address..."
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customer Table/Cards */}
      {filteredCustomers.length > 0 ? (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Customer &amp; Company</th>
                  <th>Contact Details</th>
                  <th>Material Source</th>
                  <th>Customer Type</th>
                  <th>Payment Pref</th>
                  <th>Created Date</th>
                  <th>Orders Count</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => {
                  const custOrdersCount = orders.filter(o =>
                    o.customerName.toLowerCase() === customer.name.toLowerCase() ||
                    o.customerName.toLowerCase() === (customer.companyName || '').toLowerCase()
                  ).length;

                  return (
                    <tr key={customer.id}>
                      <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                        {customer.id}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong
                            style={{
                              color: "var(--text-main)"
                            }}
                          >
                            {customer.name}
                          </strong>
                          <div
                            style={{
                              color: "var(--text-main)"
                            }}
                          >
                            {customer.company}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                            <Phone size={13} className="text-muted" style={{ color: 'var(--text-muted)' }} />
                            {customer.phone}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                            <MapPin size={13} />
                            {customer.address}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          <Package size={14} style={{ color: 'var(--primary)' }} />
                          {customer.materialSource}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${customer.customerType === 'Regular Customer' ? 'badge-completed' : 'badge-started'}`}>
                          {customer.customerType}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          color: customer.paymentPreference === 'Cash' ? 'var(--warning)' : customer.paymentPreference === 'Defer' ? 'var(--info)' : 'var(--primary)'
                        }}>
                          <CreditCard size={14} />
                          {customer.paymentPreference || 'UPI'}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                          <Calendar size={13} className="text-muted" />
                          {customer.createdDate || '—'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600', paddingLeft: '24px' }}>
                        {custOrdersCount}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm btn-icon"
                            title="Customer History"
                            style={{ color: 'var(--primary)', borderColor: 'rgba(79, 70, 229, 0.2)' }}
                            onClick={() => setSelectedHistoryCustomer(customer)}
                          >
                            <History size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm btn-icon"
                            title="Edit Client"
                            onClick={() => handleEditClick(customer)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm btn-icon"
                            title="Delete Client"
                            style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                            onClick={() => handleDeleteClick(customer.id, customer.name, customer.companyName)}
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
          <Users />
          <h3>No Customers Found</h3>
          <p>No customer matches your search criteria. Try modifying your filters or register a new customer.</p>
          <button className="btn btn-primary" onClick={handleAddClick}>
            <Plus size={16} /> Add First Customer
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCustomer ? 'Edit Customer Details' : 'Register New Customer'}</h3>
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

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Senthil Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Lakshmi Sarees"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Created Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={createdDate}
                      onChange={(e) => setCreatedDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Business Address</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    placeholder="e.g. 12, Weaver Street, Salem, TN"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Material Source</label>
                    <select
                      className="form-input"
                      value={materialSource}
                      onChange={(e) => setMaterialSource(e.target.value)}
                    >
                      <option value="Market Supply">Market Supply</option>
                      <option value="Company Supplied">Company Supplied</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Customer Type</label>
                    <select
                      className="form-input"
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value)}
                    >
                      <option value="Regular Customer">Regular Customer</option>
                      <option value="New Customer">New Customer</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Preference</label>
                    <select
                      className="form-input"
                      value={paymentPreference}
                      onChange={(e) => setPaymentPreference(e.target.value)}
                    >
                      <option value="UPI">Online UPI</option>
                      <option value="Cash">Cash on Collection</option>
                      <option value="Defer">Need More Time (Defer)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCustomer ? 'Save Changes' : 'Register Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer History Modal */}
      {selectedHistoryCustomer && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} style={{ color: 'var(--primary)' }} />
                Customer History: {selectedHistoryCustomer.companyName}
              </h3>
              <button className="modal-close" onClick={() => setSelectedHistoryCustomer(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {/* Customer Profile Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Contact Person</span>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem', marginTop: '3px' }}>{selectedHistoryCustomer.name}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Mobile Number</span>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={13} className="text-muted" />
                    {selectedHistoryCustomer.phone}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Registered Date</span>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} className="text-muted" />
                    {selectedHistoryCustomer.createdDate || '—'}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', gridColumn: 'span 3' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Business Address</span>
                  <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.85rem', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} className="text-muted" />
                    {selectedHistoryCustomer.address}
                  </div>
                </div>
              </div>

              {/* Customer Ledger Summary Card Block */}
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>Ledger Account Summary</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '10px',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Opening Bal</span>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '4px' }}>
                    ₹{Number(selectedHistoryCustomer.openingBalance || 0).toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Invoice Amt (+)</span>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '4px' }}>
                    ₹{Number(selectedHistoryCustomer.invoiceAmount || 0).toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Advances (-)</span>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '4px' }}>
                    ₹{Number(selectedHistoryCustomer.advanceAmount || 0).toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Payments (-)</span>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '4px' }}>
                    ₹{Number(selectedHistoryCustomer.payments || 0).toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Net Outstanding</span>
                  <strong style={{ 
                    display: 'block', 
                    fontSize: '0.95rem', 
                    color: Number(selectedHistoryCustomer.outstandingBalance || 0) > 0 ? 'var(--danger)' : 'var(--success)', 
                    fontWeight: 800,
                    marginTop: '4px' 
                  }}>
                    ₹{Number(selectedHistoryCustomer.outstandingBalance || 0).toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Linked Orders History */}
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>Previous &amp; Current Orders</h4>
              {(() => {
                const linkedOrders = orders.filter(o =>
                  o.customerName.toLowerCase() === selectedHistoryCustomer.name.toLowerCase() ||
                  o.customerName.toLowerCase() === (selectedHistoryCustomer.companyName || '').toLowerCase()
                );

                if (linkedOrders.length > 0) {
                  return (
                    <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Order Date</th>
                            <th>Yarn Details</th>
                            <th>Bell Count</th>
                            <th>Value</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {linkedOrders.map(order => (
                            <tr key={order.id}>
                              <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{order.id}</td>
                              <td>{order.dateCreated || '—'}</td>
                              <td>{order.threadType} thread ({(order.totalYarns || order.bobbinCount || 0).toLocaleString()} Yarns)</td>
                              <td>{order.bellCount} bells</td>
                              <td style={{ fontWeight: 600 }}>₹{(order.price || 0).toLocaleString()}</td>
                              <td>
                                <span className={`badge ${order.status === 'Received' ? 'badge-received' :
                                    order.status === 'Started' ? 'badge-started' :
                                      order.status === 'In Progress' ? 'badge-inprogress' :
                                        order.status === 'Completed' ? 'badge-completed' :
                                          'badge-delivered'
                                  }`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                } else {
                  return (
                    <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
                      <FileText size={24} style={{ marginBottom: '8px' }} />
                      <p style={{ fontSize: '0.85rem' }}>No orders have been registered for this customer yet.</p>
                    </div>
                  );
                }
              })()}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedHistoryCustomer(null)}>
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerManager;
