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
  Calendar,
  FileText,
  Receipt,
  IndianRupee,
  ShieldCheck,
  ChevronRight,
  TrendingDown,
  Layers
} from 'lucide-react';

function Dashboard({ orders, customers, setActiveTab, invoices = [] }) {
  const TODAY_STR = "2026-06-18";
  const today = new Date(TODAY_STR);

  // Helper: Calculate days remaining until delivery
  const getDaysRemaining = (deliveryDateStr) => {
    const deliveryDate = new Date(deliveryDateStr);
    if (isNaN(deliveryDate.getTime())) return 0;
    const diffTime = deliveryDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 1. Total Orders
  const totalOrders = orders.length;

  // 2. Pending Orders (Received + Started status)
  const pendingOrders = orders.filter(o => o.status === 'Received' || o.status === 'Started').length;

  // 3. Orders In Progress (In Progress status)
  const ordersInProgress = orders.filter(o => o.status === 'In Progress').length;

  // 4. Completed Orders (Completed status)
  const completedOrders = orders.filter(o => o.status === 'Completed').length;

  // 5. Delivered Orders (Delivered status)
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  // 6. Revenue This Month (June 2026)
  const revenueThisMonth = orders
    .filter(o => o.dateCreated && o.dateCreated.startsWith('2026-06'))
    .reduce((sum, o) => sum + (o.price || 0), 0);
  // Pending Invoices
  const pendingInvoices = invoices.filter(
    invoice => invoice.status === "Draft"
  ).length;

  // 7. Orders Due Today
  const dueTodayOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed' && o.deliveryDate === TODAY_STR);
  const dueToday = dueTodayOrders.length;

  // 8. Orders Due Tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const dueTomorrowOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed' && o.deliveryDate === tomorrowStr);
  const dueTomorrow = dueTomorrowOrders.length;

  // 9. Delayed Orders (Due Date passed and not completed/delivered)
  const delayedOrdersList = orders.filter(o => {
    if (o.status === 'Delivered' || o.status === 'Completed') return false;
    const delivDate = new Date(o.deliveryDate);
    return delivDate < today;
  });
  const delayedOrders = delayedOrdersList.length;

  // Total attention required
  const totalAttentionCount = dueToday + dueTomorrow + delayedOrders;

  // Recent orders list (Customer Name, Order ID, Status, Delivery Date)
  const recentOrders = [...orders]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 5);

  const getCustomerDisplay = (orderCustName) => {
    const customer = customers.find(c => c.companyName === orderCustName || c.name === orderCustName);
    if (customer) {
      return `${customer.name} (${customer.companyName})`;
    }
    return orderCustName;
  };

  // Helper for Chart Data: Monthly Revenue
  const getRevenueChartData = () => {
    const monthlyMap = { 'Apr': 0, 'May': 0, 'Jun': 0 };
    orders.forEach(o => {
      if (!o.dateCreated) return;
      const d = new Date(o.dateCreated);
      if (isNaN(d.getTime())) return;
      const m = d.toLocaleString('default', { month: 'short' });
      if (monthlyMap[m] !== undefined) {
        monthlyMap[m] += (o.price || 0);
      }
    });
    // Ensure realistic baseline values
    return [
      { month: 'Apr', amount: monthlyMap['Apr'] || 25000 },
      { month: 'May', amount: monthlyMap['May'] || 38000 },
      { month: 'Jun', amount: monthlyMap['Jun'] || revenueThisMonth }
    ];
  };

  const revenueChartData = getRevenueChartData();
  const maxRevenue = Math.max(...revenueChartData.map(c => c.amount), 10000);

  // Helper for Chart Data: Orders status counts
  const orderStatusCounts = [
    { label: 'Received', count: orders.filter(o => o.status === 'Received').length, color: 'var(--status-received)' },
    { label: 'Started', count: orders.filter(o => o.status === 'Started').length, color: 'var(--status-started)' },
    { label: 'In Progress', count: orders.filter(o => o.status === 'In Progress').length, color: 'var(--status-inprogress)' },
    { label: 'Completed', count: orders.filter(o => o.status === 'Completed').length, color: 'var(--status-completed)' },
    { label: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length, color: 'var(--status-delivered)' }
  ];
  const maxOrderCount = Math.max(...orderStatusCounts.map(c => c.count), 1);

  // Helper for Chart Data: Production tracking progress levels of active orders
  const activeWarpRuns = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed');
const hour = new Date().getHours();

const greeting =
  hour < 12
    ? "Good Morning"
    : hour < 17
    ? "Good Afternoon"
    : "Good Evening";


  return (
    <div>
      {/* Welcome Banner */}
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div className="header-title">
 <h1
  style={{
    fontFamily: "var(--font-heading)",
    color: "var(--text-main)",
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "8px"
  }}
>
  {greeting} 
</h1>

  <p
    style={{
      fontSize: "1rem",
      color: "var(--text-muted)",
      marginTop: "8px",
      lineHeight: "1.6"
    }}
  >
    Welcome back to WarpWrap.
    Monitor production, customer orders, invoices,
    and business performance from one place.
  </p>

  <p
    style={{
      marginTop: "12px",
      fontSize: ".9rem",
      color: "var(--primary)",
      fontWeight: 600
    }}
  >
    📅 Today: {TODAY_STR}
  </p>
</div>
      </div>

      {/* Production Summary Mini-Banner */}
      <div style={{
        background: 'var(--bg-card)',
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
          <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>🚨 {dueToday} Due Today</span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>⚠️ {dueTomorrow} Due Tomorrow</span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>🔥 {delayedOrders} Delayed</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)' }}>
          <span>Active Runs: <strong>{orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed').length}</strong></span>
          <span>Archived: <strong>{orders.filter(o => o.status === 'Delivered').length}</strong></span>
        </div>
      </div>
      {/* 9 KPI Cards Grid */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* KPI 1: Total Orders */}
        <div className="kpi-card indigo">
          <div className="kpi-icon-wrapper"><ShoppingBag size={20} /></div>
          <span className="kpi-title">Total Orders</span>
          <span className="kpi-value">{totalOrders}</span>
          <span className="kpi-desc">Total customer orders received</span>
        </div>

        {/* KPI 3: Orders In Progress */}
        <div className="kpi-card cyan" style={{ borderLeft: '4px solid var(--status-inprogress)' }}>
          <div className="kpi-icon-wrapper"><Activity size={20} /></div>
          <span className="kpi-title">Orders In Progress</span>
          <span className="kpi-value">{ordersInProgress}</span>
          <span className="kpi-desc">Currently running on machine</span>
        </div>

        {/* KPI: Pending Invoices */}
        <div className="kpi-card amber" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div
            className="kpi-icon-wrapper"
            style={{ background: '#fef3c7', color: '#d97706' }}
          >
            <FileText size={20} />
          </div>

          <span className="kpi-title">Pending Invoices</span>

          <span className="kpi-value">{pendingInvoices}</span>

          <span className="kpi-desc">
            Waiting for approval
          </span>
        </div>

        {/* KPI 6: Revenue This Month */}
        <div className="kpi-card emerald">
          <div className="kpi-icon-wrapper"><DollarSign size={20} /></div>
          <span className="kpi-title">Revenue This Month</span>
          <span className="kpi-value">₹{revenueThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          <span className="kpi-desc">Current month revenue</span>
        </div>

        {/* KPI: Completed Orders */}
        <div
          className="kpi-card emerald"
          style={{ borderLeft: "4px solid var(--status-completed)" }}
        >
          <div className="kpi-icon-wrapper">
            <CheckCircle2 size={20} />
          </div>

          <span className="kpi-title">Completed Orders</span>

          <span className="kpi-value">{completedOrders}</span>

          <span className="kpi-desc">
            Successfully completed jobs
          </span>
        </div>

        {/* KPI 9: Delayed Orders */}
        <div
          className="kpi-card rose"
          style={{ borderLeft: "4px solid var(--danger)" }}
        >
          <div
            className="kpi-icon-wrapper"
            style={{
              background: "var(--danger-light)",
              color: "var(--danger)"
            }}
          >
            <AlertTriangle size={20} />
          </div>

          <span
            className="kpi-title"
            style={{
              color: "var(--text-main)",
              fontWeight: 600
            }}
          >
            Delayed Orders
          </span>

          <span
            className="kpi-value"
            style={{
              color: "var(--danger)"
            }}
          >
            {delayedOrders}
          </span>

          <span
            className="kpi-desc"
            style={{
              color: "var(--text-muted)"
            }}
          >
            Needs immediate attention
          </span>
        </div>
      </div>
      {/* Analytics Charts Row */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>
          Business Analytics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

          {/* Chart 1: Revenue Trends SVG */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <h3><TrendingUp size={18} style={{ color: 'var(--primary)' }} />Monthly Revenue(₹)</h3>
              </div>
            </div>
            <div className="card-body" style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <svg viewBox="0 0 400 200" style={{ width: '100%', height: '160px' }}>
                <line x1="50" y1="20" x2="350" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="50" y1="70" x2="350" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="50" y1="120" x2="350" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="50" y1="170" x2="350" y2="170" stroke="#cbd5e1" strokeWidth="1.5" />

                {/* Labels */}
                <text x="40" y="24" textAnchor="end" fontSize="9px" fill="var(--text-muted)">₹{maxRevenue.toLocaleString()}</text>
                <text x="40" y="74" textAnchor="end" fontSize="9px" fill="var(--text-muted)">₹{Math.round(maxRevenue / 2).toLocaleString()}</text>
                <text x="40" y="124" textAnchor="end" fontSize="9px" fill="var(--text-muted)">₹0</text>

                {/* Bars */}
                {revenueChartData.map((d, i) => {
                  const barWidth = 40;
                  const x = 80 + i * 100;
                  const height = (d.amount / maxRevenue) * 130;
                  const y = 170 - height;
                  return (
                    <g key={d.month}>
                      <rect x={x} y={y} width={barWidth} height={height} rx="4" fill="var(--primary)" opacity="0.85" />
                      <text x={x + 20} y={y - 8} textAnchor="middle" fontSize="10px" fontWeight="600" fill="var(--text-main)">₹{Math.round(d.amount).toLocaleString()}</text>
                      <text x={x + 20} y="185" textAnchor="middle" fontSize="10px" fontWeight="600" fill="var(--text-muted)">{d.month}</text>
                    </g>
                  );
                })}
              </svg>
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Operational monthly billing revenue
              </div>
            </div>
          </div>

          {/* Chart 2: Orders by Status SVG */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <h3><Layers size={18} style={{ color: 'var(--info)' }} /> Orders Status</h3>
              </div>
            </div>
            <div className="card-body" style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <svg viewBox="0 0 400 200" style={{ width: '100%', height: '160px' }}>
                <line x1="100" y1="160" x2="380" y2="160" stroke="#cbd5e1" strokeWidth="1.5" />
                {orderStatusCounts.map((s, i) => {
                  const y = 20 + i * 28;
                  const barMaxWidth = 240;
                  const barWidth = maxOrderCount > 0 ? (s.count / maxOrderCount) * barMaxWidth : 0;
                  return (
                    <g key={s.label}>
                      {/* Label */}
                      <text x="90" y={y + 11} textAnchor="end" fontSize="9px" fontWeight="600" fill="var(--text-main)">{s.label}</text>
                      {/* Background bar */}
                      <rect x="100" y={y} width={barMaxWidth} height={14} rx="3" fill="var(--border-color)" />
                      {/* Active count bar */}
                      <rect x="100" y={y} width={Math.max(barWidth, 4)} height={14} rx="3" fill={s.color} />
                      {/* Count label */}
                      <text x={100 + Math.max(barWidth, 4) + 8} y={y + 11} fontSize="10px" fontWeight="700" fill="var(--text-main)">{s.count}</text>
                    </g>
                  );
                })}
              </svg>
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Volume breakdown of yarn orders by current status
              </div>
            </div>
          </div>

          {/* Chart 3: Active Production Load SVG */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <h3><Activity size={18} style={{ color: 'var(--success)' }} /> Today's Production</h3>
              </div>
            </div>
            <div className="card-body" style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '16px 24px' }}>
              {activeWarpRuns.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeWarpRuns.slice(0, 4).map(run => (
                    <div key={run.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600 }}>
                        <span style={{ color: 'var(--primary)' }}>{run.id} - {run.customerName}</span>
                        <span style={{ color: 'var(--text-muted)' }}>Warp progress: {run.progress || 10}%</span>
                      </div>
                      <div className="progress-container" style={{ height: '6px' }}>
                        <div
                          className="progress-fill status-inprogress"
                          style={{ width: `${run.progress || 10}%`, background: 'linear-gradient(90deg, var(--primary) 0%, var(--info) 100%)' }}
                        />
                      </div>
                    </div>
                  ))}
                  {activeWarpRuns.length > 4 && (
                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px' }}>
                      + {activeWarpRuns.length - 4} more warp runs actively processing
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <ShieldCheck size={28} style={{ color: 'var(--success)', marginBottom: '6px' }} />
                  <p>All warping machine lines are clear. No runs actively processing.</p>
                </div>
              )}
            </div>
          </div>

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
            <button className="btn btn-secondary btn-sm">
  Log Checklist
</button>
          </div>
          <div className="card-body" style={{ maxHeight: '380px', overflowY: 'auto' }}>
            <div className="attention-list">

              {/* Delayed Items */}
              {delayedOrdersList.map(order => (
      <div
  className="attention-item"
  style={{
    background: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderLeft: "4px solid var(--danger)"
  }}
>
                  <div className="attention-meta">
                    <h4>{getCustomerDisplay(order.customerName)} - {order.id}</h4>
                    <p style={{ color: 'var(--danger)', fontWeight: '600' }}>
                      Delayed by {Math.abs(getDaysRemaining(order.deliveryDate))} days (Due: {order.deliveryDate})
                    </p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Yarn Specs: {order.threadType} thread | {order.totalYarns || order.bobbinCount} yarns | Current: {order.progress}%
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
              {dueTodayOrders.map(order => (
               <div
  key={order.id}
  className="attention-item"
  style={{
    background: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderLeft: "4px solid var(--danger)"
  }}
>
                  <div className="attention-meta">
                    <h4>{getCustomerDisplay(order.customerName)} - {order.id}</h4>
                    <p style={{ color: 'var(--danger)', fontWeight: '600' }}>Due Today!</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Yarn Specs: {order.threadType} thread | {order.totalYarns || order.bobbinCount} yarns | Current: {order.progress}%
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
              {dueTomorrowOrders.map(order => (
              <div
  key={order.id}
  className="attention-item"
  style={{
    background: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderLeft: "4px solid var(--warning)"
  }}
>
                  <div className="attention-meta">
                    <h4>{getCustomerDisplay(order.customerName)} - {order.id}</h4>
                    <p style={{ color: 'var(--warning)', fontWeight: '600' }}>Due Tomorrow</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Yarn Specs: {order.threadType} thread | {order.totalYarns || order.bobbinCount} yarns | Current: {order.progress}%
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

        {/* Right Column: Quick Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <h3 style={{ color: "var(--text-main)" }}>
  Quick Controls
</h3>
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
                onClick={() => setActiveTab('invoices')}
              >
                <Receipt size={20} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>View Invoices</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Orders Log View */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <h3 style={{ color: "var(--text-main)" }}>
  Recent Orders
</h3>
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
                  <th>Customer Name</th>
                  <th>Order ID</th>
                  <th>Status</th>
                  <th>Delivery Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: '600' }}>
                      {getCustomerDisplay(order.customerName)}
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{order.id}</td>
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
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} className="text-muted" />
                        {order.deliveryDate}
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
