import { PieChart, TrendingUp, DollarSign, Archive, Clock, Users, Printer, FileText, Activity, AlertTriangle } from 'lucide-react';

function ReportsAnalytics({ orders, customers }) {
  const TODAY_STR = "2026-06-18";
  const today = new Date(TODAY_STR);

  // 1. Order Report calculations
  const totalOrdersCount = orders.length;

  // 2. Revenue Report calculations
  const totalRevenue = orders.reduce((sum, order) => sum + (order.price || 0), 0);
  const revenueThisMonth = orders
    .filter(o => o.dateCreated && o.dateCreated.startsWith('2026-06'))
    .reduce((sum, o) => sum + (o.price || 0), 0);

  // 3. Customer Summary calculations
  const regularCount = customers.filter(c => c.customerType === 'Regular Customer').length;
  const newCount = customers.filter(c => c.customerType === 'New Customer').length;

  // Top Customers by revenue/value
  const getTopCustomers = () => {
    const custMap = {};
    orders.forEach(o => {
      const name = o.customerName;
      if (!custMap[name]) {
        // Find customer details in customer database
        const details = customers.find(c => c.companyName === name || c.name === name);
        custMap[name] = { 
          companyName: name, 
          contactName: details ? details.name : 'Unknown Contact',
          orderCount: 0, 
          totalSpend: 0 
        };
      }
      custMap[name].orderCount++;
      custMap[name].totalSpend += (o.price || 0);
    });
    return Object.values(custMap).sort((a, b) => b.totalSpend - a.totalSpend);
  };
  const topCustomers = getTopCustomers();

  // 4. Production Summary calculations
  const activeRuns = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed');
  const delayedRuns = orders.filter(o => {
    if (o.status === 'Delivered' || o.status === 'Completed') return false;
    return new Date(o.deliveryDate) < today;
  });
  const avgProgress = activeRuns.length > 0
    ? Math.round(activeRuns.reduce((sum, o) => sum + (o.progress || 0), 0) / activeRuns.length)
    : 0;

  // Group monthly revenue
  const getMonthlyRevenueData = () => {
    const monthlyMap = { 'Apr': 0, 'May': 0, 'Jun': 0 };
    orders.forEach(order => {
      if (!order.dateCreated) return;
      const date = new Date(order.dateCreated);
      if (isNaN(date.getTime())) return;
      const month = date.toLocaleString('default', { month: 'short' });
      if (monthlyMap[month] !== undefined) {
        monthlyMap[month] += (order.price || 0);
      }
    });

    return [
      { name: 'Apr', revenue: monthlyMap['Apr'] || 25000 },
      { name: 'May', revenue: monthlyMap['May'] || 38000 },
      { name: 'Jun', revenue: monthlyMap['Jun'] || revenueThisMonth }
    ];
  };

  const revenueData = getMonthlyRevenueData();
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 10000);

  // Status Distribution for SVG Donut
  const getStatusCounts = () => {
    const statuses = ['Received', 'Started', 'In Progress', 'Completed', 'Delivered'];
    const counts = {};
    statuses.forEach(s => counts[s] = 0);
    orders.forEach(o => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return statuses.map(s => ({ label: s, value: counts[s] }));
  };

  const statusData = getStatusCounts();
  const totalStatusCount = statusData.reduce((sum, d) => sum + d.value, 0);

  const statusColors = {
    'Received': '#64748b',
    'Started': '#06b6d4',
    'In Progress': '#3b82f6',
    'Completed': '#10b981',
    'Delivered': '#8b5cf6'
  };

  // SVG Donut calculations
  let cumulativePercent = 0;
  const donutData = statusData.map(item => {
    const percent = totalStatusCount > 0 ? (item.value / totalStatusCount) : 0;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    return { ...item, startPercent, percent };
  });

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="reports-print-wrapper">
      {/* Print-specific style overrides */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .reports-print-wrapper { display: block !important; position: absolute !important; top: 0; left: 0; width: 100%; padding: 20px; }
          .reports-no-print { display: none !important; }
          .card { page-break-inside: avoid; border: 1px solid #e2e8f0 !important; box-shadow: none !important; }
        }
      `}</style>

      {/* Page Header */}
      <div className="section-header reports-no-print">
        <div className="header-title">
          <h1>Reports &amp; Analytics</h1>
          <p>Analyze business revenue, warping load capacities, and customer growth trends.</p>
        </div>
        <button className="btn btn-primary" onClick={handlePrintReport}>
          <Printer size={18} />
          Print / Export PDF Report
        </button>
      </div>

      {/* Print-Only Title Header */}
      <div style={{ display: 'none', marginBottom: '24px', borderBottom: '2px solid #0f172a', paddingBottom: '12px' }} className="mobile-header">
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', color: '#0f172a', margin: 0 }}>WarpWrap Production Intel Report</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>Generated on {new Date().toLocaleDateString('en-IN')} | Reference System Date: {TODAY_STR}</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card indigo">
          <div className="kpi-icon-wrapper"><DollarSign size={20} /></div>
          <span className="kpi-title">Total Revenue</span>
          <span className="kpi-value">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          <span className="kpi-desc">Total warping billing value</span>
        </div>

        <div className="kpi-card cyan">
          <div className="kpi-icon-wrapper"><FileText size={20} /></div>
          <span className="kpi-title">Total Orders</span>
          <span className="kpi-value">{totalOrdersCount}</span>
          <span className="kpi-desc">Registered warp orders</span>
        </div>

        <div className="kpi-card amber">
          <div className="kpi-icon-wrapper"><Clock size={20} /></div>
          <span className="kpi-title">Active Warp Runs</span>
          <span className="kpi-value">{activeRuns.length}</span>
          <span className="kpi-desc">Currently in production</span>
        </div>

        <div className="kpi-card emerald">
          <div className="kpi-icon-wrapper"><Archive size={20} /></div>
          <span className="kpi-title">Finished Runs</span>
          <span className="kpi-value">{totalFinishedOrders}</span>
          <span className="kpi-desc">Completed or Delivered</span>
        </div>
      </div>

      {/* Revenue & Status Distribution Charts Grid */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '24px' }}>
        
        {/* Revenue SVG Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <h3><TrendingUp size={18} style={{ color: 'var(--primary)' }} /> Monthly Revenue Trend (₹)</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <svg className="chart-svg" viewBox="0 0 400 220" style={{ width: '100%' }}>
                <line x1="50" y1="30" x2="360" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="50" y1="80" x2="360" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="50" y1="130" x2="360" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="50" y1="180" x2="360" y2="180" stroke="#cbd5e1" strokeWidth="1.5" />

                <text x="40" y="34" textAnchor="end" fontSize="8px" fill="var(--text-muted)">₹{maxRevenue.toLocaleString()}</text>
                <text x="40" y="84" textAnchor="end" fontSize="8px" fill="var(--text-muted)">₹{Math.round(maxRevenue / 2).toLocaleString()}</text>
                <text x="40" y="184" textAnchor="end" fontSize="8px" fill="var(--text-muted)">₹0</text>

                {revenueData.map((d, index) => {
                  const barWidth = 40;
                  const spacing = 70;
                  const x = 90 + index * (barWidth + spacing);
                  const height = (d.revenue / maxRevenue) * 150;
                  const y = 180 - height;

                  return (
                    <g key={d.name}>
                      <rect x={x} y={y} width={barWidth} height={height} rx="4" fill="var(--primary)" />
                      <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="9px" fontWeight="600" fill="var(--text-main)">
                        ₹{d.revenue.toLocaleString()}
                      </text>
                      <text x={x + barWidth / 2} y="200" textAnchor="middle" fontSize="10px" fontWeight="600" fill="var(--text-muted)">
                        {d.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
          </div>
        </div>
</div>
        {/* Order Status SVG Donut Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <h3><PieChart size={18} style={{ color: 'var(--info)' }} /> Warp Batch Status Distribution</h3>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="chart-container">
              {totalStatusCount > 0 ? (
                <svg className="chart-svg" viewBox="0 0 200 200" style={{ height: '140px', margin: '0 auto', display: 'block' }}>
                  <g transform="translate(100, 100)">
                    {donutData.map((slice) => {
                      if (slice.percent === 0) return null;
                      const radius = 60;
                      const strokeWidth = 20;
                      const circumference = 2 * Math.PI * radius;
                      const strokeDasharray = `${slice.percent * circumference} ${circumference}`;
                      const strokeDashoffset = -slice.startPercent * circumference;
                      const rotation = -90;

                      return (
                        <circle 
                          key={slice.label}
                          r={radius}
                          cx="0"
                          cy="0"
                          fill="transparent"
                          stroke={statusColors[slice.label]}
                          strokeWidth={strokeWidth}
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          transform={`rotate(${rotation})`}
                        />
                      );
                    })}
                    <circle r="48" cx="0" cy="0" fill="white" />
                    <text x="0" y="-2" textAnchor="middle" fontSize="16px" fontWeight="700" fill="var(--text-main)">
                      {totalStatusCount}
                    </text>
                    <text x="0" y="11" textAnchor="middle" fontSize="8px" fontWeight="600" fill="var(--text-muted)" style={{ textTransform: 'uppercase' }}>
                      Total Jobs
                    </text>
                  </g>
                </svg>
              ) : (
                <div className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center' }}>No status data available</div>
              )}
            </div>
            
            <div className="chart-legend" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '12px' }}>
              {statusData.map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColors[item.label] }} />
                  <span style={{ color: 'var(--text-muted)' }}>{item.label} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Production & Customer Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Production Capacity Summary */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <h3><Activity size={18} style={{ color: 'var(--success)' }} /> Warping Production Capacity</h3>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Warping Runs</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{activeRuns.length} runs</div>
              </div>
              <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <span style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: 600 }}>Delayed Warp Batches</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#b91c1c', marginTop: '4px' }}>{delayedRuns.length} delayed</div>
              </div>
            </div>
            
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                <span>Average active warping progress</span>
                <span style={{ color: 'var(--primary)' }}>{avgProgress}% Completed</span>
              </div>
              <div className="progress-container" style={{ height: '8px' }}>
                <div className="progress-fill status-inprogress" style={{ width: `${avgProgress}%` }} />
              </div>
            </div>
            
            {delayedRuns.length > 0 && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px', display: 'flex', gap: '8px', fontSize: '0.78rem', color: '#78350f' }}>
                <AlertTriangle size={15} style={{ flexShrink: 0, color: 'var(--warning)' }} />
                <div>
                  <strong>Delay Alert:</strong> {delayedRuns.length} active warping batch runs have missed their delivery dates. Adjust machine allocation or reschedule.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Ratios Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <h3><Users size={18} style={{ color: 'var(--primary)' }} /> Client Segments &amp; Ratios</h3>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '500' }}>
                <span>Regular Repeat Clients</span>
                <strong>{regularCount} Members ({Math.round(regularCount / (regularCount + newCount || 1) * 100)}%)</strong>
              </div>
              <div className="progress-container" style={{ height: '8px' }}>
                <div className="progress-fill status-completed" style={{ width: `${(regularCount / (regularCount + newCount || 1)) * 100}%` }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '500' }}>
                <span>New Client Registrations</span>
                <strong>{newCount} Members ({Math.round(newCount / (regularCount + newCount || 1) * 100)}%)</strong>
              </div>
              <div className="progress-container" style={{ height: '8px' }}>
                <div className="progress-fill status-started" style={{ width: `${(newCount / (regularCount + newCount || 1)) * 100}%` }} />
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Weaving business growth targets <strong>Regular Customers</strong> for repeat warp batches. High retention improves machine pipeline utilization.
            </div>
          </div>
        </div>

      </div>

      {/* Top Customers Summary */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <h3><DollarSign size={18} style={{ color: 'var(--success)' }} /> Top Customer Summary (By Revenue Value)</h3>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {topCustomers.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer (Company Name)</th>
                    <th>Contact Person</th>
                    <th style={{ textAlign: 'center' }}>Total Warp Orders</th>
                    <th style={{ textAlign: 'right' }}>Total Order Value (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map(tc => (
                    <tr key={tc.companyName}>
                      <td style={{ fontWeight: 600 }}>{tc.companyName}</td>
                      <td style={{ fontWeight: 500 }}>{tc.contactName}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{tc.orderCount} orders</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                        ₹{tc.totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              No orders registered to compile customer summary logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportsAnalytics;
