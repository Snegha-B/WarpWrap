import React from 'react';
import { 
  Clock, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Plus, 
  Activity, 
  Users, 
  ArrowRight,
  Calendar
} from 'lucide-react';

function Dashboard({ orders, customers, setActiveTab }) {
  const TODAY_STR = "2026-06-18";
  const today = new Date(TODAY_STR);

  // Helper: Calculate days remaining until delivery
  const getDaysRemaining = (deliveryDateStr) => {
    const deliveryDate = new Date(deliveryDateStr);
    if (isNaN(deliveryDate.getTime())) return 0;
    const diffTime = deliveryDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 1. Nearest Deadline
  const getNearestDeadlineOrder = () => {
    const incomplete = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed');
    if (incomplete.length === 0) return null;
    
    // Sort by delivery date ascending
    const sorted = [...incomplete].sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
    return sorted[0];
  };

  const nearestOrder = getNearestDeadlineOrder();
  const nearestDaysRemaining = nearestOrder ? getDaysRemaining(nearestOrder.deliveryDate) : null;

  // 2. New Orders Today
  const newOrdersToday = orders.filter(o => o.dateCreated === TODAY_STR).length;

  // 3. Revenue Summary (Sum of all orders prices)
  const totalRevenue = orders.reduce((sum, o) => sum + (o.price || 0), 0);

  // 4. Current Running Order (Started or In Progress with nearest deadline)
  const getCurrentRunningOrder = () => {
    const running = orders.filter(o => o.status === 'In Progress' || o.status === 'Started');
    if (running.length === 0) return null;
    const sorted = [...running].sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
    return sorted[0];
  };

  const currentRunning = getCurrentRunningOrder();

  // 5. Orders Requiring Attention (Due Today, Due Tomorrow, Delayed)
  const getDueToday = () => {
    return orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed' && o.deliveryDate === TODAY_STR);
  };

  const getDueTomorrow = () => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed' && o.deliveryDate === tomorrowStr);
  };

  const getDelayedOrders = () => {
    return orders.filter(o => {
      if (o.status === 'Delivered' || o.status === 'Completed') return false;
      const delivDate = new Date(o.deliveryDate);
      return delivDate < today;
    });
  };

  const dueToday = getDueToday();
  const dueTomorrow = getDueTomorrow();
  const delayedOrders = getDelayedOrders();
  const totalAttentionCount = dueToday.length + dueTomorrow.length + delayedOrders.length;

  // Recent 4 orders
  const recentOrders = [...orders]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 4);

  return (
    <div>
      {/* Welcome Banner */}
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div className="header-title">
          <h1 style={{ fontFamily: 'var(--font-heading)' }}>👋 Welcome Back, Operations Manager</h1>
          <p>Textile warping production lines are active. Reference Date: {TODAY_STR}</p>
        </div>
      </div>

      {/* Production Summary Mini-Banner */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '32px',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>🚨 {dueToday.length} Due Today</span>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>⚠️ {dueTomorrow.length} Due Tomorrow</span>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>🔥 {delayedOrders.length} Delayed</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)' }}>
          <span>Active: <strong>{orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed').length}</strong></span>
          <span>Completed Run logs: <strong>{orders.filter(o => o.status === 'Completed' || o.status === 'Delivered').length}</strong></span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Nearest Deadline Card */}
        <div className="kpi-card rose">
          <div className="kpi-icon-wrapper">
            <Clock size={20} />
          </div>
          <span className="kpi-title">Nearest Deadline</span>
          {nearestOrder ? (
            <>
              <span className="kpi-value" style={{ fontSize: '1.4rem', margin: '4px 0' }}>
                {nearestDaysRemaining === 0 ? 'Due Today' : nearestDaysRemaining === 1 ? 'Due Tomorrow' : `${nearestDaysRemaining} Days Left`}
              </span>
              <span className="kpi-desc" style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                {nearestOrder.customerName}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Target: {nearestOrder.deliveryDate}
              </span>
            </>
          ) : (
            <span className="kpi-value" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>No Active Jobs</span>
          )}
        </div>

        {/* New Orders Today Card */}
        <div className="kpi-card indigo">
          <div className="kpi-icon-wrapper">
            <ShoppingBag size={20} />
          </div>
          <span className="kpi-title">New Orders Today</span>
          <span className="kpi-value">{newOrdersToday}</span>
          <span className="kpi-desc">
            <span className="kpi-badge success">+{newOrdersToday} new</span>
            registered in past 24h
          </span>
        </div>

        {/* Revenue Summary Card */}
        <div className="kpi-card emerald">
          <div className="kpi-icon-wrapper">
            <DollarSign size={20} />
          </div>
          <span className="kpi-title">Total billing Revenue</span>
          <span className="kpi-value">₹{totalRevenue.toLocaleString()}</span>
          <span className="kpi-desc">
            <span className="kpi-badge success">Active</span>
            orders monetary index
          </span>
        </div>

        {/* Current Running Order Card */}
        <div className="kpi-card cyan">
          <div className="kpi-icon-wrapper">
            <TrendingUp size={20} />
          </div>
          <span className="kpi-title">Running Machine Run</span>
          {currentRunning ? (
            <>
              <span className="kpi-value" style={{ fontSize: '1.3rem', margin: '4px 0' }}>
                {currentRunning.progress}% done
              </span>
              <span className="kpi-desc" style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                {currentRunning.customerName}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Yarn: {currentRunning.threadType} | Sec: {currentRunning.sections}
              </span>
            </>
          ) : (
            <span className="kpi-value" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>None Running</span>
          )}
        </div>
      </div>

      {/* Main Grid: Attention Panel & Quick Actions / Recent Orders */}
      <div className="dashboard-grid">
        
        {/* Left Column: Attention Panel */}
        <div className="card">
          <div className="card-header" style={{ borderLeft: '4px solid var(--danger)' }}>
            <div className="card-title">
              <h3>
                <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
                Orders Requiring Attention ({totalAttentionCount})
              </h3>
            </div>
            <span className="badge badge-received" style={{ fontSize: '0.7rem' }}>Log Checklist</span>
          </div>
          <div className="card-body" style={{ maxHeight: '380px', overflowY: 'auto' }}>
            <div className="attention-list">
              
              {/* Delayed Items */}
              {delayedOrders.map(order => (
                <div key={order.id} className="attention-item" style={{ borderLeft: '3px solid var(--danger)' }}>
                  <div className="attention-meta">
                    <h4>{order.customerName} - {order.id}</h4>
                    <p style={{ color: 'var(--danger)', fontWeight: '600' }}>
                      Delayed by {Math.abs(getDaysRemaining(order.deliveryDate))} days (Due: {order.deliveryDate})
                    </p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Yarn Specs: {order.threadType} thread | {order.sections} sections | Current: {order.progress}%
                    </span>
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveTab('production')}
                  >
                    Resolve
                  </button>
                </div>
              ))}

              {/* Due Today */}
              {dueToday.map(order => (
                <div key={order.id} className="attention-item" style={{ borderLeft: '3px solid var(--danger)' }}>
                  <div className="attention-meta">
                    <h4>{order.customerName} - {order.id}</h4>
                    <p style={{ color: 'var(--danger)', fontWeight: '600' }}>Due Today!</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Yarn Specs: {order.threadType} thread | {order.sections} sections | Current: {order.progress}%
                    </span>
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveTab('production')}
                  >
                    Resolve
                  </button>
                </div>
              ))}

              {/* Due Tomorrow */}
              {dueTomorrow.map(order => (
                <div key={order.id} className="attention-item" style={{ borderLeft: '3px solid var(--warning)' }}>
                  <div className="attention-meta">
                    <h4>{order.customerName} - {order.id}</h4>
                    <p style={{ color: 'var(--warning)', fontWeight: '600' }}>Due Tomorrow</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Yarn Specs: {order.threadType} thread | {order.sections} sections | Current: {order.progress}%
                    </span>
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveTab('production')}
                  >
                    Track Run
                  </button>
                </div>
              ))}

              {totalAttentionCount === 0 && (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={32} style={{ color: 'var(--success)', marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem' }}>All warp jobs are on schedule. No critical bottlenecks detected!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <h3>Quick Controls</h3>
              </div>
            </div>
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              
              <button 
                className="btn btn-secondary"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '18px',
                  borderRadius: 'var(--radius-lg)' 
                }}
                onClick={() => setActiveTab('orders')}
              >
                <Plus size={20} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>New Order Spec</span>
              </button>

              <button 
                className="btn btn-secondary"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '18px',
                  borderRadius: 'var(--radius-lg)' 
                }}
                onClick={() => setActiveTab('production')}
              >
                <Activity size={20} style={{ color: 'var(--info)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Track Machine Runs</span>
              </button>

              <button 
                className="btn btn-secondary"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '18px',
                  borderRadius: 'var(--radius-lg)' 
                }}
                onClick={() => setActiveTab('customers')}
              >
                <Users size={20} style={{ color: 'var(--success)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Client Records</span>
              </button>

              <button 
                className="btn btn-secondary"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '18px',
                  borderRadius: 'var(--radius-lg)' 
                }}
                onClick={() => setActiveTab('reports')}
              >
                <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Review Analytics</span>
              </button>

            </div>
          </div>

        </div>

      </div>

      {/* Recent Orders Log View */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <h3>Recent Orders Placed</h3>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('orders')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            Manage All Orders
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Order Date</th>
                  <th>Delivery Date</th>
                  <th>Thread Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{order.id}</td>
                    <td style={{ fontWeight: '600' }}>{order.customerName}</td>
                    <td>{order.dateCreated}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} className="text-muted" />
                        {order.deliveryDate}
                      </span>
                    </td>
                    <td>{order.threadType} thread</td>
                    <td>
                      <span className={`badge ${
                        order.status === 'Received' ? 'badge-received' :
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
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
