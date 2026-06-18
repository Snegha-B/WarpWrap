import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Phone, MapPin, Package, Tag, X } from 'lucide-react';

function CustomerManager({ customers, saveCustomers, orders }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [materialSource, setMaterialSource] = useState('Market Supply');
  const [customerType, setCustomerType] = useState('New Customer');
  const [formError, setFormError] = useState('');

  // Handle opening modal for Add
  const handleAddClick = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setAddress('');
    setMaterialSource('Market Supply');
    setCustomerType('New Customer');
    setFormError('');
    setShowModal(true);
  };

  // Handle opening modal for Edit
  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setPhone(customer.phone);
    setAddress(customer.address);
    setMaterialSource(customer.materialSource);
    setCustomerType(customer.customerType);
    setFormError('');
    setShowModal(true);
  };

  // Handle delete
  const handleDeleteClick = (id, name) => {
    const linkedOrders = orders.filter(o => o.customerName.toLowerCase() === name.toLowerCase());
    
    let confirmMsg = `Are you sure you want to delete ${name}?`;
    if (linkedOrders.length > 0) {
      confirmMsg = `WARNING: ${name} has ${linkedOrders.length} active order(s) associated with them. Deleting this customer will keep their orders but they will refer to a deleted customer. Are you sure you want to proceed?`;
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
      setFormError('Customer name is required');
      return;
    }
    if (!phone.trim()) {
      setFormError('Phone number is required');
      return;
    }
    if (!address.trim()) {
      setFormError('Address is required');
      return;
    }

    if (editingCustomer) {
      // Edit
      const updated = customers.map(c => {
        if (c.id === editingCustomer.id) {
          return {
            ...c,
            name: name.trim(),
            phone: phone.trim(),
            address: address.trim(),
            materialSource,
            customerType
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
        phone: phone.trim(),
        address: address.trim(),
        materialSource,
        customerType
      };
      saveCustomers([...customers, newCust]);
    }
    setShowModal(false);
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            placeholder="Search customers by name, phone or address..." 
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
                  <th>Customer Name</th>
                  <th>Contact Details</th>
                  <th>Material Source</th>
                  <th>Customer Type</th>
                  <th>Orders Count</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => {
                  const custOrdersCount = orders.filter(o => 
                    o.customerName.toLowerCase() === customer.name.toLowerCase()
                  ).length;

                  return (
                    <tr key={customer.id}>
                      <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                        {customer.id}
                      </td>
                      <td style={{ fontWeight: '500' }}>
                        {customer.name}
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
                      <td style={{ fontWeight: '600', paddingLeft: '24px' }}>
                        {custOrdersCount}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
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
                            onClick={() => handleDeleteClick(customer.id, customer.name)}
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
              <h3>{editingCustomer ? 'Edit Customer details' : 'Register New Customer'}</h3>
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
                
                <div className="form-group">
                  <label className="form-label">Customer / Business Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Lakshmi Sarees"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
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
    </div>
  );
}

export default CustomerManager;
