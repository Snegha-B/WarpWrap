import React from 'react';
import { Play, Check, ChevronRight, AlertTriangle, HelpCircle, Truck, Clipboard } from 'lucide-react';
import { calculateCompletionDays, calculateDelayRisk } from './OrderManager';

const STATUS_STEPS = ['Received', 'Started', 'In Progress', 'Completed', 'Delivered'];

function ProductionTracker({ orders, saveOrders }) {
  
  // Set progress based on status
  const getProgressPercentage = (status) => {
    switch (status) {
      case 'Received': return 10;
      case 'Started': return 30;
      case 'In Progress': return 60;
      case 'Completed': return 90;
      case 'Delivered': return 100;
      default: return 10;
    }
  };

  // Get status color coding
  const getStatusColorClass = (statusStr) => {
    switch (statusStr) {
      case 'Received': return 'status-received';
      case 'Started': return 'status-started';
      case 'In Progress': return 'status-inprogress';
      case 'Completed': return 'status-completed';
      case 'Delivered': return 'status-delivered';
      default: return 'status-received';
    }
  };

  // Handle status update
  const handleStatusUpdate = (orderId, newStatus) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          progress: getProgressPercentage(newStatus)
        };
      }
      return o;
    });
    saveOrders(updated);
  };

  // Move to next step helper
  const handleNextStep = (order) => {
    const currentIndex = STATUS_STEPS.indexOf(order.status);
    if (currentIndex < STATUS_STEPS.length - 1) {
      const nextStatus = STATUS_STEPS[currentIndex + 1];
      handleStatusUpdate(order.id, nextStatus);
    }
  };

  // Filter orders to active ones (show Completed & Delivered too but focus on running)
  const activeOrders = orders.filter(o => o.status !== 'Delivered');
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');

  return (
    <div>
      {/* Page Header */}
      <div className="section-header">
        <div className="header-title">
          <h1>Production Tracking</h1>
          <p>Monitor real-time machine run times, warp yarn progress, and update stages.</p>
        </div>
      </div>

      {/* Production Dashboard Grid */}
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>
        Active Production Runs ({activeOrders.length})
      </h2>

      {activeOrders.length > 0 ? (
        <div className="production-tracker-grid">
          {activeOrders.map(order => {
            const progress = getProgressPercentage(order.status);
            const complDays = calculateCompletionDays(order.bobbinCount, order.bellCount, order.sections);
            const delayRisk = calculateDelayRisk(order.deliveryDate, progress, order.status);
            const statusIndex = STATUS_STEPS.indexOf(order.status);

            return (
              <div key={order.id} className="production-card">
                
                <div className="production-card-header">
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)' }}>
                      {order.id}
                    </span>
                    <h3 style={{ marginTop: '2px' }}>{order.customerName}</h3>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span className={`badge badge-${order.status.toLowerCase().replace(' ', '')}`}>
                      {order.status}
                    </span>
                    <span className={`risk-indicator ${delayRisk.color}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                      {delayRisk.label}
                    </span>
                  </div>
                </div>

                {/* Specs parameters panel */}
                <div className="production-parameters">
                  <div className="param-item">
                    <span className="param-val">{order.threadType}</span>
                    <span className="param-lbl">Yarn Type</span>
                  </div>
                  <div className="param-item">
                    <span className="param-val">{order.bobbinCount}</span>
                    <span className="param-lbl">Bobbins</span>
                  </div>
                  <div className="param-item">
                    <span className="param-val">{order.sections}</span>
                    <span className="param-lbl">Sections</span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="progress-details">
                    <span>Overall Warping Progress</span>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{progress}%</span>
                  </div>
                  <div className="progress-container">
                    <div 
                      className={`progress-fill ${getStatusColorClass(order.status)}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Custom Interactive Step Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)' }}>Status Timeline</span>
                  <div className="status-step-container">
                    <div className="status-step-line" />
                    {STATUS_STEPS.map((step, idx) => {
                      let stepClass = '';
                      if (idx === statusIndex) stepClass = 'active';
                      else if (idx < statusIndex) stepClass = 'completed';

                      return (
                        <div 
                          key={step} 
                          className={`status-step-dot ${stepClass}`} 
                          title={`Move status to: ${step}`}
                          onClick={() => handleStatusUpdate(order.id, step)}
                          style={{ transition: 'all 0.2s' }}
                        >
                          {/* Floating label on hover or if active */}
                          <span style={{
                            position: 'absolute',
                            bottom: '18px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '0.625rem',
                            whiteSpace: 'nowrap',
                            fontWeight: '600',
                            color: idx === statusIndex ? 'var(--primary)' : 'var(--text-muted)',
                            opacity: idx === statusIndex ? 1 : 0.4,
                            pointerEvents: 'none'
                          }}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Logistics & Predictions info */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '4px',
                  backgroundColor: '#f8fafc', 
                  padding: '10px 14px', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)',
                  fontSize: '0.75rem' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Target Delivery:</span>
                    <strong style={{ color: '#0f172a' }}>{order.deliveryDate}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Est. Job Duration:</span>
                    <strong>{complDays}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="text-muted">Transport Logistics:</span>
                    <span>{order.transportRequired ? '🚚 Required' : 'Self Pickup'}</span>
                  </div>
                </div>

                {/* Operator Actions */}
                <div className="production-actions">
                  {statusIndex < STATUS_STEPS.length - 1 ? (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleNextStep(order)}
                      style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '6px' }}
                    >
                      <ChevronRight size={14} />
                      Promote to: {STATUS_STEPS[statusIndex + 1]}
                    </button>
                  ) : (
                    <div style={{ width: '100%', display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', padding: '6px', fontWeight: '600', fontSize: '0.8rem' }}>
                      <Check size={16} /> Completed Specifications!
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state" style={{ marginBottom: '32px' }}>
          <Clipboard />
          <h3>No Active Orders</h3>
          <p>There are no active orders currently running on the machines. Add a new order to start production.</p>
        </div>
      )}

      {/* Completed/Delivered Archives section */}
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px', color: '#0f172a', marginTop: '40px' }}>
        Archived / Completed Runs ({deliveredOrders.length})
      </h2>

      {deliveredOrders.length > 0 ? (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Yarn Specs</th>
                  <th>Delivery Date</th>
                  <th>Price Value</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Re-open Run</th>
                </tr>
              </thead>
              <tbody>
                {deliveredOrders.map(order => (
                  <tr key={order.id} style={{ opacity: 0.8 }}>
                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{order.id}</td>
                    <td style={{ fontWeight: '500' }}>{order.customerName}</td>
                    <td>{order.threadType} ({order.bobbinCount} Bobbins, {order.sections} Sec)</td>
                    <td>{order.deliveryDate}</td>
                    <td style={{ fontWeight: '600' }}>₹{order.price.toLocaleString()}</td>
                    <td>
                      <span className="badge badge-delivered">
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleStatusUpdate(order.id, 'Completed')}
                        >
                          Rollback to Completed
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
          <Clipboard />
          <h3>No Archived Runs</h3>
          <p>Once orders are marked as "Delivered", they will be archived here for historical logs.</p>
        </div>
      )}
    </div>
  );
}

export default ProductionTracker;
