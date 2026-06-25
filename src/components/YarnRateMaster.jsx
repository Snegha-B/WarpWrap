import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, X, IndianRupee, Info, Package } from 'lucide-react';

function YarnRateMaster({ yarnRates, saveYarnRates }) {
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [yarnType, setYarnType] = useState('');
  const [ratePerThousand, setRatePerThousand] = useState('');
  const [formError, setFormError] = useState('');

  const handleAddClick = () => {
    setEditingRate(null);
    setYarnType('');
    setRatePerThousand('');
    setFormError('');
    setShowModal(true);
  };

  const handleEditClick = (rate) => {
    setEditingRate(rate);
    setYarnType(rate.yarnType);
    setRatePerThousand(rate.ratePerThousand.toString());
    setFormError('');
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this yarn rate? Orders using this yarn type will lose automatic billing.')) {
      saveYarnRates(yarnRates.filter(r => r.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedType = yarnType.trim();
    if (!trimmedType) {
      setFormError('Yarn Type name is required.');
      return;
    }
    const rate = parseFloat(ratePerThousand);
    if (isNaN(rate) || rate <= 0) {
      setFormError('Rate Per 1000 Yarns must be a positive number.');
      return;
    }

    // Check for duplicate yarn type (excluding self when editing)
    const duplicate = yarnRates.find(r =>
      r.yarnType.toLowerCase() === trimmedType.toLowerCase() &&
      r.id !== (editingRate ? editingRate.id : null)
    );
    if (duplicate) {
      setFormError(`"${trimmedType}" already exists. Please use a unique yarn type name.`);
      return;
    }

    if (editingRate) {
      const updated = yarnRates.map(r =>
        r.id === editingRate.id
          ? { ...r, yarnType: trimmedType, ratePerThousand: rate }
          : r
      );
      saveYarnRates(updated);
    } else {
      const newRate = {
        id: `YR-${Date.now().toString().slice(-5)}`,
        yarnType: trimmedType,
        ratePerThousand: rate,
      };
      saveYarnRates([...yarnRates, newRate]);
    }
    setShowModal(false);
  };

  // Example billing preview using first order params
  const examplePreview = (rate) => {
    const yarnCount = 8350;
    const bells = 8;
    const amtPerBell = (yarnCount * rate) / 1000;
    const total = amtPerBell * bells;
    return { yarnCount, bells, amtPerBell, total };
  };

  return (
    <div>
      {/* Page Header */}
      <div className="section-header">
        <div className="header-title">
          <h1 style={{ fontFamily: 'var(--font-heading)' }}>Yarn Rate Master</h1>
          <p>Manage yarn types and their billing rates. Rates auto-apply to new orders.</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddClick}>
          <Plus size={18} />
          Add Yarn Rate
        </button>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        color: 'white'
      }}>
        <div style={{
          background: 'rgba(129,140,248,0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '10px',
          flexShrink: 0
        }}>
          <IndianRupee size={22} style={{ color: '#a5b4fc' }} />
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>
            How Yarn Rates Work
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#c7d2fe', lineHeight: 1.6 }}>
            Set a <strong style={{ color: 'white' }}>Rate Per 1000 Yarns</strong> for each yarn type.
            When a new order is created, billing is auto-calculated:
            &nbsp;<strong style={{ color: '#fcd34d' }}>Amount Per Bell = (Yarn Count × Rate) ÷ 1000</strong>
            &nbsp;and&nbsp;
            <strong style={{ color: '#fcd34d' }}>Total Amount = Amount Per Bell × Bell Count</strong>.
          </p>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="kpi-grid" style={{ marginBottom: '28px' }}>
        <div className="kpi-card indigo">
          <div className="kpi-icon-wrapper">
            <Package size={20} />
          </div>
          <span className="kpi-title">Total Yarn Types</span>
          <span className="kpi-value">{yarnRates.length}</span>
          <span className="kpi-desc">Active in rate master</span>
        </div>
        <div className="kpi-card emerald">
          <div className="kpi-icon-wrapper">
            <IndianRupee size={20} />
          </div>
          <span className="kpi-title">Lowest Rate</span>
          <span className="kpi-value">
            {yarnRates.length > 0
              ? `₹${Math.min(...yarnRates.map(r => r.ratePerThousand))}`
              : '—'}
          </span>
          <span className="kpi-desc">Per 1000 yarns</span>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-icon-wrapper">
            <IndianRupee size={20} />
          </div>
          <span className="kpi-title">Highest Rate</span>
          <span className="kpi-value">
            {yarnRates.length > 0
              ? `₹${Math.max(...yarnRates.map(r => r.ratePerThousand))}`
              : '—'}
          </span>
          <span className="kpi-desc">Per 1000 yarns</span>
        </div>
      </div>

      {/* Yarn Rates Table */}
      {yarnRates.length > 0 ? (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <h3>
                <Tag size={18} style={{ color: 'var(--primary)' }} />
                Yarn Rate Schedule
              </h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {yarnRates.length} yarn type{yarnRates.length !== 1 ? 's' : ''} configured
            </span>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Yarn Type</th>
                  <th>Rate Per 1000 Yarns</th>
                  <th>Example: 100 Yarns × 8 Bells</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {yarnRates.map(rate => {
                  const preview = examplePreview(rate.ratePerThousand);
                  return (
                    <tr key={rate.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--primary-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Tag size={15} style={{ color: 'var(--primary)' }} />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{rate.yarnType}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          background: 'var(--success-light)',
                          color: 'var(--success)',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          border: '1px solid #a7f3d0'
                        }}>
                          ₹{rate.ratePerThousand.toLocaleString()} / 1000
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                            Per Bell: <strong style={{ color: 'var(--text-main)' }}>₹{preview.amtPerBell.toFixed(2)}</strong>
                          </span>
                          <span style={{ background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px' }}>
                            8,350 Yarns × 8 Bells: <strong style={{ color: 'var(--success)' }}>₹{preview.total.toFixed(2)}</strong>
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm btn-icon"
                            title="Edit Rate"
                            onClick={() => handleEditClick(rate)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm btn-icon"
                            title="Delete Yarn Type"
                            style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.15)' }}
                            onClick={() => handleDeleteClick(rate.id)}
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
          <Tag />
          <h3>No Yarn Rates Configured</h3>
          <p>Add yarn types and their rates to enable automatic billing calculation for orders.</p>
          <button className="btn btn-primary" onClick={handleAddClick}>
            <Plus size={16} /> Add First Yarn Rate
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3>{editingRate ? `Edit: ${editingRate.yarnType}` : 'Add Yarn Rate'}</h3>
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
                  <label className="form-label">Yarn Type Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Cotton, Silk, Polyester..."
                    value={yarnType}
                    onChange={(e) => setYarnType(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rate Per 1000 Yarns (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)', fontWeight: 600
                    }}>₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="form-input"
                      style={{ paddingLeft: '28px' }}
                      placeholder="e.g. 66"
                      value={ratePerThousand}
                      onChange={(e) => setRatePerThousand(e.target.value)}
                    />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Example: Cotton = ₹66, Silk = ₹75, Polyester = ₹55
                  </span>
                </div>

                {/* Live Preview */}
                {yarnType.trim() && parseFloat(ratePerThousand) > 0 && (
                  <div style={{
                    background: 'linear-gradient(135deg, #ecf0f9, #e8f5ff)',
                    border: '1px solid #d2daf3',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px'
                  }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#312e81', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Info size={13} /> Live Billing Preview
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                      {[
                        { label: '8,350 Yarns × 8 Bells', yarns: 8350, bells: 8 },
                        { label: '10,200 Yarns × 12 Bells', yarns: 10200, bells: 12 },
                      ].map(ex => {
                        const apb = (ex.yarns * parseFloat(ratePerThousand)) / 1000;
                        const tot = apb * ex.bells;
                        return (
                          <div key={ex.label} style={{ background: 'white', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e0e7ff' }}>
                            <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{ex.label}</div>
                            <div style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{tot.toFixed(2)} total</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRate ? 'Save Changes' : 'Add Yarn Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default YarnRateMaster;
