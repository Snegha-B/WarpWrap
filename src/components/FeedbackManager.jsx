import React, { useState } from 'react';
import { MessageSquare, Plus, ArrowUpRight, Smile, User, ThumbsUp, Calendar } from 'lucide-react';

function FeedbackManager({ feedbacks, saveFeedbacks, orders }) {
  const [showForm, setShowForm] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [deliveryExperience, setDeliveryExperience] = useState('On Time');
  const [qualityExperience, setQualityExperience] = useState('Good');
  const [futurePartnership, setFuturePartnership] = useState('Definitely');
  const [comments, setComments] = useState('');
  const [formError, setFormError] = useState('');

  // Get orders that are completed or delivered to link feedback to
  const completedOrDeliveredOrders = orders.filter(o => 
    o.status === 'Completed' || o.status === 'Delivered'
  );

  const handleOpenForm = () => {
    if (completedOrDeliveredOrders.length === 0) {
      alert("Feedback must be linked to a Completed or Delivered Order. There are currently no completed or delivered orders in the system.");
      return;
    }
    setOrderId(completedOrDeliveredOrders[0].id);
    setDeliveryExperience('On Time');
    setQualityExperience('Good');
    setFuturePartnership('Definitely');
    setComments('');
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderId) {
      setFormError("You must select a completed order.");
      return;
    }
    if (!comments.trim()) {
      setFormError("Please enter some feedback comments.");
      return;
    }

    // Find customer name linked to this order
    const linkedOrder = orders.find(o => o.id === orderId);
    const customerName = linkedOrder ? linkedOrder.customerName : "Unknown Client";

    const newFeedback = {
      id: `FB-${Date.now().toString().slice(-3)}`,
      orderId,
      customerName,
      deliveryExperience,
      qualityExperience,
      futurePartnership,
      comments: comments.trim()
    };

    saveFeedbacks([newFeedback, ...feedbacks]);
    setShowForm(false);
  };

  const getTagColor = (dimension, value) => {
    if (dimension === 'delivery') {
      switch (value) {
        case 'Before Time': return 'green';
        case 'On Time': return 'green';
        case 'Delayed': return 'red';
        default: return 'yellow';
      }
    }
    if (dimension === 'quality') {
      switch (value) {
        case 'Excellent': return 'green';
        case 'Good': return 'green';
        case 'Needs Improvement': return 'red';
        default: return 'yellow';
      }
    }
    if (dimension === 'partnership') {
      switch (value) {
        case 'Definitely': return 'green';
        case 'Maybe': return 'yellow';
        case 'Not This Time': return 'red';
        default: return 'yellow';
      }
    }
    return 'yellow';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="section-header">
        <div className="header-title">
          <h1>Feedback Management</h1>
          <p>Collect operational experiences directly linked to finished warp order batches.</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={handleOpenForm}>
            <Plus size={18} />
            Record Feedback
          </button>
        )}
      </div>

      <div className="feedback-grid">
        {/* Left Form View or Info Card */}
        {showForm ? (
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <h3>Record Client Experience</h3>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {formError && (
                  <div style={{
                    backgroundColor: 'var(--danger-light)',
                    color: 'var(--danger)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}>
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Link Completed Order</label>
                  <select 
                    className="form-input"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                  >
                    {completedOrDeliveredOrders.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.id} - {o.customerName} ({o.threadType})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Experience</label>
                  <div className="feedback-tag-group">
                    {['Before Time', 'On Time', 'Delayed'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        className={`feedback-tag-btn ${deliveryExperience === opt ? `active delivery-${opt.split(' ')[0]}` : ''}`}
                        onClick={() => setDeliveryExperience(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Warping Yarn Quality</label>
                  <div className="feedback-tag-group">
                    {['Excellent', 'Good', 'Needs Improvement'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        className={`feedback-tag-btn ${qualityExperience === opt ? `active quality-${opt.split(' ')[0]}` : ''}`}
                        onClick={() => setQualityExperience(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Future Partnership</label>
                  <div className="feedback-tag-group">
                    {['Definitely', 'Maybe', 'Not This Time'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        className={`feedback-tag-btn ${futurePartnership === opt ? `active partner-${opt.split(' ')[0]}` : ''}`}
                        onClick={() => setFuturePartnership(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Comments</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    placeholder="Describe client's response during delivery (yarn breakage, beam packing, transport experience)..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>
              </div>
              <div className="card-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #1e1b4b, #311042)', color: 'white', border: 'none' }}>
              <div className="card-body" style={{ padding: '28px' }}>
                <Smile size={32} style={{ color: '#c084fc', marginBottom: '16px' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '8px' }}>
                  No-Star Intelligence
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                  Textile warping B2B client satisfaction is better evaluated by structured operations data than abstract stars. 
                  We track precise metrics:
                </p>
                <ul style={{ fontSize: '0.825rem', color: '#cbd5e1', marginTop: '12px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><strong>Delivery Punctuality:</strong> Helps gauge logistics bottlenecks.</li>
                  <li><strong>Yarn Quality:</strong> Measures thread behavior during warping machine runs.</li>
                  <li><strong>Partnership Intention:</strong> Indicates continuous monthly billing prospects.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Right Logs View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '600', color: '#0f172a' }}>
            Historical Feedback Logs ({feedbacks.length})
          </h2>

          {feedbacks.length > 0 ? (
            <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
              {feedbacks.map(fb => (
                <div key={fb.id} className="feedback-card">
                  <div className="feedback-card-header">
                    <div className="feedback-card-meta">
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} className="text-muted" />
                        {fb.customerName}
                      </h4>
                      <span>Linked Run: {fb.orderId}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {fb.id}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic', backgroundColor: 'var(--bg-app)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #cbd5e1' }}>
                    "{fb.comments}"
                  </p>

                  <div className="feedback-card-tags">
                    <span className={`risk-indicator ${getTagColor('delivery', fb.deliveryExperience)}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                      Delivery: {fb.deliveryExperience}
                    </span>
                    <span className={`risk-indicator ${getTagColor('quality', fb.qualityExperience)}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                      Quality: {fb.qualityExperience}
                    </span>
                    <span className={`risk-indicator ${getTagColor('partnership', fb.futurePartnership)}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                      Repeat: {fb.futurePartnership}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <MessageSquare />
              <h3>No Feedback Logged</h3>
              <p>Completed warp runs can be evaluated here. Change an order status to Completed and submit customer ratings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FeedbackManager;
