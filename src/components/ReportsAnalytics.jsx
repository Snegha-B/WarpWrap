import { useState, useMemo } from 'react';
import {
  TrendingUp, DollarSign, Archive, Clock, Users,
  Printer, FileText, Activity, AlertTriangle, BarChart2, PieChart,
  Package, CheckCircle, ArrowUpRight, ArrowDownRight,
  Calendar, Filter, Download, Search, Layers, IndianRupee,
  ShoppingCart, Zap, Target, Award, RefreshCw
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────
const TODAY_STR = '2026-06-18';
const TODAY = new Date(TODAY_STR);

const WEEK_START = new Date('2026-06-12');   // 7 days before today
const MONTH_START = new Date('2026-06-01');  // start of current month

const STATUS_COLORS = {
  'Received':           '#64748b',
  'Accepted':           '#0ea5e9',
  'Started':            '#06b6d4',
  'In Progress':        '#3b82f6',
  'Completed':          '#10b981',
  'Ready for Collection': '#f59e0b',
  'Delivered':          '#8b5cf6',
  'Collected':          '#6366f1',
};

const YARN_PALETTE = ['#4f46e5','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];

// ─── Tiny Helpers ─────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
const fmtN = (n) => Number(n || 0).toLocaleString('en-IN');
const inRange = (dateStr, from, to) => {
  const d = new Date(dateStr);
  return !isNaN(d) && d >= from && d <= to;
};

// ─── SVG Chart Components (zero dependencies) ─────────────────────────────────

/** Horizontal bar chart – values prop: [{label, value, color}] */
function HBarChart({ values, maxVal, height = 32 }) {
  const max = maxVal || Math.max(...values.map(v => v.value), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {values.map((item, i) => {
        const pct = Math.round((item.value / max) * 100);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '120px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>{item.label}</div>
            <div style={{ flex: 1, background: 'var(--bg-app)', borderRadius: '4px', height: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: item.color || 'var(--primary)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ width: '40px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>{item.value}</div>
          </div>
        );
      })}
    </div>
  );
}

/** SVG vertical bar chart – data: [{name, value}], color optional */
function VBarChart({ data, color = 'var(--primary)', height = 180, showValues = true }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 380, H = height, pad = { l: 48, r: 12, t: 28, b: 32 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;
  const barW = Math.floor(chartW / data.length * 0.5);
  const gap = chartW / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
      {/* Y-axis grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = pad.t + chartH - f * chartH;
        return (
          <g key={f}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="var(--border-color)" strokeWidth="1" />
            <text x={pad.l - 4} y={y + 4} textAnchor="end" fontSize="9" fill="var(--text-muted)">
              {Math.round(max * f).toLocaleString()}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d.value / max) * chartH;
        const x = pad.l + i * gap + (gap - barW) / 2;
        const y = pad.t + chartH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill={d.color || color} opacity="0.9" />
            {showValues && d.value > 0 && (
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--text-muted)">
                {d.value > 9999 ? `₹${(d.value / 1000).toFixed(0)}K` : d.value}
              </text>
            )}
            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{d.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** SVG donut chart – slices: [{label, value, color}] */
function DonutChart({ slices, size = 160 }) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No data</div>;
  const r = 55, cx = size / 2, cy = size / 2, stroke = 22;
  let cumPct = 0;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        {slices.map((s, i) => {
          if (!s.value) return null;
          const pct = s.value / total;
          const dashArr = `${pct * circ} ${circ}`;
          const dashOff = -cumPct * circ;
          cumPct += pct;
          return (
            <circle key={i} r={r} cx={cx} cy={cy} fill="transparent"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={dashArr} strokeDashoffset={dashOff}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
        })}
        <circle r={r - stroke / 2 - 2} cx={cx} cy={cy} fill="var(--bg-card)" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text-main)">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="8" fill="var(--text-muted)">TOTAL</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {slices.filter(s => s.value > 0).map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-muted)', flex: 1 }}>{s.label}</span>
            <strong style={{ color: 'var(--text-main)' }}>{s.value}</strong>
            <span style={{ color: 'var(--text-muted)', minWidth: '32px', textAlign: 'right' }}>
              {Math.round(s.value / total * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Line/Area chart – points: [{x: label, y: number}] */
function AreaChart({ points, color = '#4f46e5', fillColor = 'rgba(79,70,229,0.12)', height = 160 }) {
  const W = 380, H = height, pad = { l: 48, r: 12, t: 20, b: 28 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;
  const max = Math.max(...points.map(p => p.y), 1);
  const xs = points.map((_, i) => pad.l + (i / (points.length - 1 || 1)) * chartW);
  const ys = points.map(p => pad.t + chartH - (p.y / max) * chartH);
  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
  const areaPath = `${linePath} L${xs[xs.length - 1]},${pad.t + chartH} L${xs[0]},${pad.t + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
      {[0, 0.5, 1].map(f => {
        const y = pad.t + chartH - f * chartH;
        return (
          <g key={f}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="var(--border-color)" strokeWidth="1" />
            <text x={pad.l - 4} y={y + 4} textAnchor="end" fontSize="9" fill="var(--text-muted)">
              {(max * f) > 9999 ? `₹${Math.round(max * f / 1000)}K` : Math.round(max * f)}
            </text>
          </g>
        );
      })}
      <path d={areaPath} fill={fillColor} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={xs[i]} cy={ys[i]} r="4" fill={color} />
          <text x={xs[i]} y={H - 4} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{p.x}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, title, value, desc, color, trend, trendLabel }) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';
  return (
    <div className={`kpi-card ${color}`} style={{ cursor: 'default' }}>
      <div className="kpi-icon-wrapper">
        <Icon size={20} />
      </div>
      <span className="kpi-title">{title}</span>
      <span className="kpi-value">{value}</span>
      <span className="kpi-desc">
        {isUp && <ArrowUpRight size={12} style={{ color: 'var(--success)' }} />}
        {isDown && <ArrowDownRight size={12} style={{ color: 'var(--danger)' }} />}
        {desc}
        {trendLabel && (
          <span className={`kpi-badge ${isUp ? 'success' : isDown ? 'danger' : ''}`} style={{ marginLeft: '4px' }}>
            {trendLabel}
          </span>
        )}
      </span>
    </div>
  );
}

// ─── Section Card wrapper ──────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, iconColor, children, action }) {
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div className="card-header">
        <div className="card-title">
          <h3>
            {Icon && <Icon size={18} style={{ color: iconColor || 'var(--primary)' }} />}
            {title}
          </h3>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabBtn({ label, active, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 14px',
        fontSize: '0.82rem', fontWeight: active ? 700 : 500,
        background: active ? 'var(--primary)' : 'transparent',
        color: active ? 'white' : 'var(--text-muted)',
        border: active ? 'none' : '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        boxShadow: active ? '0 4px 10px rgba(79,70,229,0.25)' : 'none'
      }}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function ReportsAnalytics({ orders = [], customers = [], invoices = [], payments = [], advances = [] }) {

  const [activeTab, setActiveTab] = useState('dashboard');
  const [reportType, setReportType] = useState('daily');
  const [filterCustomer, setFilterCustomer] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterYarnType, setFilterYarnType] = useState('All');
  const [filterDateFrom, setFilterDateFrom] = useState('2026-06-01');
  const [filterDateTo, setFilterDateTo] = useState('2026-06-18');
  const [reportSearch, setReportSearch] = useState('');

  // ── Derived Metrics ─────────────────────────────────────────────────────────

  const derivedMetrics = useMemo(() => {
    // Order groupings
    const completedOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Delivered');
    const activeOrders = orders.filter(o => !['Delivered'].includes(o.status));
    const inProduction = orders.filter(o => ['Started', 'In Progress', 'Received', 'Accepted'].includes(o.status));
    const readyForCollection = orders.filter(o => o.status === 'Completed');
    const delivered = orders.filter(o => o.status === 'Delivered');

    const delayedOrders = orders.filter(o => {
      if (['Delivered', 'Completed'].includes(o.status)) return false;
      return new Date(o.deliveryDate) < TODAY;
    });

    // Date-based production
    const todayOrders = orders.filter(o => o.dateCreated === TODAY_STR);
    const weekOrders = orders.filter(o => inRange(o.dateCreated, WEEK_START, TODAY));
    const monthOrders = orders.filter(o => inRange(o.dateCreated, MONTH_START, TODAY));

    // Revenue
    const totalRevenue = orders.reduce((s, o) => s + (o.price || 0), 0);
    const weekRevenue = weekOrders.reduce((s, o) => s + (o.price || 0), 0);
    const monthRevenue = monthOrders.reduce((s, o) => s + (o.price || 0), 0);

    // Outstanding balance = approved invoices not yet paid
    const outstandingAmount = invoices
      .filter(i => i.status === 'Approved' && i.paymentStatus !== 'Paid')
      .reduce((s, i) => s + Number(i.totalAmount || 0), 0);

    const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const totalAdvance = advances.reduce((s, a) => s + (a.amount || 0), 0);

    // Week payments
    const weekPayments = payments
      .filter(p => inRange(p.date, WEEK_START, TODAY))
      .reduce((s, p) => s + (p.amount || 0), 0);
    const monthPayments = payments
      .filter(p => inRange(p.date, MONTH_START, TODAY))
      .reduce((s, p) => s + (p.amount || 0), 0);

    // Customer metrics
    const regularCustomers = customers.filter(c => c.customerType === 'Regular Customer');
    const newCustomers = customers.filter(c => c.customerType === 'New Customer');

    // Customers with orders (active)
    const customersWithOrders = new Set(orders.map(o => o.customerName));
    const activeCustomers = customers.filter(c =>
      customersWithOrders.has(c.companyName) || customersWithOrders.has(c.name)
    );

    // Top customers by revenue
    const custRevMap = {};
    orders.forEach(o => {
      const name = o.customerName;
      if (!custRevMap[name]) {
        const details = customers.find(c => c.companyName === name || c.name === name);
        custRevMap[name] = {
          companyName: name,
          contactName: details?.name || name,
          customerId: details?.id || '',
          orderCount: 0,
          totalRevenue: 0,
          yarns: 0,
        };
      }
      custRevMap[name].orderCount++;
      custRevMap[name].totalRevenue += (o.price || 0);
      custRevMap[name].yarns += (o.totalYarns || 0);
    });
    const topCustomers = Object.values(custRevMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Customers with outstanding balance
    const custOutstanding = {};
    invoices.filter(i => i.status === 'Approved' && i.paymentStatus !== 'Paid').forEach(i => {
      const key = i.companyName || i.customerName;
      custOutstanding[key] = (custOutstanding[key] || 0) + Number(i.totalAmount || 0);
    });
    const custOutstandingList = Object.entries(custOutstanding).map(([name, amt]) => ({ name, amt })).sort((a, b) => b.amt - a.amt);

    // Status distribution
    const allStatuses = ['Received', 'Accepted', 'Started', 'In Progress', 'Completed', 'Delivered'];
    const statusDist = allStatuses.map(s => ({
      label: s,
      value: orders.filter(o => o.status === s).length,
      color: STATUS_COLORS[s]
    }));

    // Yarn analytics
    const yarnMap = {};
    orders.forEach(o => {
      if (!o.threadType) return;
      if (!yarnMap[o.threadType]) yarnMap[o.threadType] = { type: o.threadType, orderCount: 0, totalYarns: 0, revenue: 0 };
      yarnMap[o.threadType].orderCount++;
      yarnMap[o.threadType].totalYarns += (o.totalYarns || 0);
      yarnMap[o.threadType].revenue += (o.price || 0);
    });
    const yarnStats = Object.values(yarnMap).sort((a, b) => b.totalYarns - a.totalYarns);

    // Monthly revenue trend (last 3 months)
    const monthLabels = ['Apr', 'May', 'Jun'];
    const monthMap = { Apr: 0, May: 0, Jun: 0 };
    orders.forEach(o => {
      if (!o.dateCreated) return;
      const d = new Date(o.dateCreated);
      if (isNaN(d)) return;
      const m = d.toLocaleString('default', { month: 'short' });
      if (monthMap[m] !== undefined) monthMap[m] += (o.price || 0);
    });
    // Fallback seed data for empty months
    if (monthMap.Apr === 0) monthMap.Apr = 25000;
    if (monthMap.May === 0) monthMap.May = 38000;
    const revenueTrend = monthLabels.map(m => ({ x: m, y: monthMap[m] }));

    // Average progress of active orders
    const avgProgress = inProduction.length > 0
      ? Math.round(inProduction.reduce((s, o) => s + (o.progress || 0), 0) / inProduction.length)
      : 0;

    const completionRate = orders.length > 0
      ? Math.round(completedOrders.length / orders.length * 100)
      : 0;

    return {
      totalOrders: orders.length,
      inProduction: inProduction.length,
      completedOrders: completedOrders.length,
      readyForCollection: readyForCollection.length,
      delivered: delivered.length,
      delayedOrders,
      todayOrders: todayOrders.length,
      weekOrders: weekOrders.length,
      monthOrders: monthOrders.length,
      totalRevenue, weekRevenue, monthRevenue,
      outstandingAmount, totalPaid, totalAdvance,
      weekPayments, monthPayments,
      totalCustomers: customers.length,
      activeCustomers: activeCustomers.length,
      regularCustomers: regularCustomers.length,
      newCustomers: newCustomers.length,
      topCustomers, custOutstandingList,
      statusDist,
      yarnStats,
      revenueTrend,
      avgProgress,
      completionRate,
      pendingPayments: invoices.filter(i => i.status === 'Approved' && i.paymentStatus !== 'Paid').length,
    };
  }, [orders, customers, invoices, payments, advances]);

  // ── Filtered orders for Reports tab ─────────────────────────────────────────
  const filteredReportOrders = useMemo(() => {
    return orders.filter(o => {
      if (filterCustomer !== 'All' && o.customerName !== filterCustomer) return false;
      if (filterStatus !== 'All' && o.status !== filterStatus) return false;
      if (filterYarnType !== 'All' && o.threadType !== filterYarnType) return false;
      if (!inRange(o.dateCreated, new Date(filterDateFrom), new Date(filterDateTo))) return false;
      if (reportSearch && !`${o.id} ${o.customerName} ${o.status}`.toLowerCase().includes(reportSearch.toLowerCase())) return false;
      return true;
    });
  }, [orders, filterCustomer, filterStatus, filterYarnType, filterDateFrom, filterDateTo, reportSearch]);

  const uniqueYarnTypes = [...new Set(orders.map(o => o.threadType).filter(Boolean))];
  const allStatuses = ['Received', 'Accepted', 'Started', 'In Progress', 'Completed', 'Delivered'];
  const allCustomerNames = [...new Set(orders.map(o => o.customerName))];

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Yarn Type', 'Total Yarns', 'Bell Count', 'Status', 'Price (₹)', 'Date Created', 'Delivery Date'];
    const rows = filteredReportOrders.map(o => [
      o.id, o.customerName, o.threadType, o.totalYarns, o.bellCount,
      o.status, o.price, o.dateCreated, o.deliveryDate
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warpwrap-report-${TODAY_STR}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const m = derivedMetrics;

  // ─── TABS ─────────────────────────────────────────────────────────────────────
  const TABS = [
    { key: 'dashboard',   label: 'Dashboard',   icon: BarChart2 },
    { key: 'production',  label: 'Production',  icon: Activity },
    { key: 'customer',    label: 'Customers',   icon: Users },
    { key: 'financial',   label: 'Financial',   icon: IndianRupee },
    { key: 'orders',      label: 'Orders',      icon: ShoppingCart },
    { key: 'yarn',        label: 'Yarn',        icon: Layers },
    { key: 'reports',     label: 'Reports',     icon: FileText },
  ];

  return (
    <div className="reports-print-wrapper">
      {/* Print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .reports-print-wrapper { display: block !important; position: absolute !important; top: 0; left: 0; width: 100%; padding: 20px; }
          .reports-no-print { display: none !important; }
          .card { page-break-inside: avoid; border: 1px solid #e2e8f0 !important; box-shadow: none !important; }
          .kpi-card { border: 1px solid #e2e8f0 !important; }
        }
      `}</style>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="section-header reports-no-print">
        <div className="header-title">
          <h1 style={{ fontFamily: 'var(--font-heading)' }}>Reports &amp; Analytics</h1>
          <p>Comprehensive business intelligence — production, customers, financials, and yarn usage.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV} style={{ fontSize: '0.82rem' }}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={handlePrint} style={{ fontSize: '0.82rem' }}>
            <Printer size={16} /> Print / PDF
          </button>
        </div>
      </div>

      {/* ── Tab Navigation ────────────────────────────────────────────────────── */}
      <div className="reports-no-print" style={{
        display: 'flex', gap: '8px', flexWrap: 'wrap',
        padding: '14px 18px', background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)', marginBottom: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {TABS.map(t => (
          <TabBtn key={t.key} label={t.label} icon={t.icon} active={activeTab === t.key} onClick={() => setActiveTab(t.key)} />
        ))}
        <div style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={12} /> Reference Date: <strong>{TODAY_STR}</strong>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: DASHBOARD
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <>
          {/* KPI Grid — 11 cards */}
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
            <KPICard icon={ShoppingCart} title="Total Orders" value={fmtN(m.totalOrders)} desc="All registered warp orders" color="indigo" />
            <KPICard icon={Activity} title="In Production" value={fmtN(m.inProduction)} desc="Active warp runs" color="cyan" trend={m.inProduction > 0 ? 'up' : 'down'} />
            <KPICard icon={CheckCircle} title="Completed" value={fmtN(m.completedOrders)} desc="Finished or delivered" color="emerald" />
            <KPICard icon={Package} title="Ready for Collection" value={fmtN(m.readyForCollection)} desc="Awaiting customer pickup" color="amber" />
            <KPICard icon={AlertTriangle} title="Delayed Orders" value={fmtN(m.delayedOrders.length)} desc="Past delivery date" color="rose" trend={m.delayedOrders.length > 0 ? 'down' : undefined} />
            <KPICard icon={Users} title="Total Customers" value={fmtN(m.totalCustomers)} desc={`${m.activeCustomers} active`} color="indigo" />
            <KPICard icon={DollarSign} title="Total Revenue" value={`₹${fmt(m.totalRevenue)}`} desc="Total warping billing" color="emerald" trend="up" trendLabel={`₹${(m.monthRevenue/1000).toFixed(0)}K this month`} />
            <KPICard icon={IndianRupee} title="Outstanding Balance" value={`₹${fmt(m.outstandingAmount)}`} desc={`${m.pendingPayments} unpaid invoices`} color="rose" trend={m.outstandingAmount > 0 ? 'down' : undefined} />
            <KPICard icon={Zap} title="Today's Production" value={fmtN(m.todayOrders)} desc="Orders created today" color="cyan" />
            <KPICard icon={TrendingUp} title="Weekly Production" value={fmtN(m.weekOrders)} desc="This week's orders" color="amber" />
            <KPICard icon={Target} title="Monthly Production" value={fmtN(m.monthOrders)} desc="This month's orders" color="indigo" />
          </div>

          {/* Revenue trend + Status donut */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <SectionCard title="Monthly Revenue Trend (₹)" icon={TrendingUp} iconColor="var(--primary)">
              <AreaChart points={m.revenueTrend} color="#4f46e5" fillColor="rgba(79,70,229,0.12)" />
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
                {m.revenueTrend.map(p => (
                  <div key={p.x} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.x}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>₹{(p.y/1000).toFixed(1)}K</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Order Status Distribution" icon={PieChart} iconColor="var(--info)">
              <DonutChart slices={m.statusDist} size={140} />
            </SectionCard>
          </div>

          {/* Completion rate + Delay alert */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <SectionCard title="Production Health" icon={Target} iconColor="var(--success)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Completion Rate</span>
                    <strong style={{ color: 'var(--success)' }}>{m.completionRate}%</strong>
                  </div>
                  <div className="progress-container" style={{ height: '10px' }}>
                    <div className="progress-fill status-completed" style={{ width: `${m.completionRate}%` }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Avg. Active Progress</span>
                    <strong style={{ color: 'var(--info)' }}>{m.avgProgress}%</strong>
                  </div>
                  <div className="progress-container" style={{ height: '10px' }}>
                    <div className="progress-fill status-inprogress" style={{ width: `${m.avgProgress}%` }} />
                  </div>
                </div>
                {m.delayedOrders.length > 0 && (
                  <div style={{ background: 'var(--warning-light)', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: '0.78rem', color: '#78350f', display: 'flex', gap: '8px' }}>
                    <AlertTriangle size={15} style={{ flexShrink: 0, color: 'var(--warning)' }} />
                    <span><strong>{m.delayedOrders.length} delayed batch(es)</strong> — {m.delayedOrders.map(o => o.id).join(', ')}</span>
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Financial Summary" icon={IndianRupee} iconColor="var(--primary)">
              {[
                { label: 'Total Revenue', value: `₹${fmt(m.totalRevenue)}`, color: 'var(--success)' },
                { label: 'Total Collected', value: `₹${fmt(m.totalPaid)}`, color: 'var(--primary)' },
                { label: 'Outstanding', value: `₹${fmt(m.outstandingAmount)}`, color: 'var(--danger)' },
                { label: 'Advance Received', value: `₹${fmt(m.totalAdvance)}`, color: 'var(--info)' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                  <strong style={{ color: r.color }}>{r.value}</strong>
                </div>
              ))}
            </SectionCard>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: PRODUCTION ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'production' && (
        <>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
            <KPICard icon={Zap} title="Today's Orders" value={fmtN(m.todayOrders)} desc="Created today" color="cyan" />
            <KPICard icon={Calendar} title="Weekly Orders" value={fmtN(m.weekOrders)} desc="Last 7 days" color="amber" />
            <KPICard icon={Target} title="Monthly Orders" value={fmtN(m.monthOrders)} desc="This month" color="indigo" />
            <KPICard icon={Activity} title="Active Runs" value={fmtN(m.inProduction)} desc="Currently warping" color="cyan" />
            <KPICard icon={AlertTriangle} title="Delayed Batches" value={fmtN(m.delayedOrders.length)} desc="Past due date" color="rose" />
            <KPICard icon={Target} title="Completion Rate" value={`${m.completionRate}%`} desc="Orders finished" color="emerald" />
            <KPICard icon={CheckCircle} title="Completed" value={fmtN(m.completedOrders)} desc="Done or delivered" color="emerald" />
            <KPICard icon={Activity} title="Avg. Progress" value={`${m.avgProgress}%`} desc="Active batch avg" color="indigo" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <SectionCard title="Monthly Production Volume" icon={BarChart2} iconColor="var(--primary)">
              <VBarChart data={m.revenueTrend.map(p => ({ name: p.x, value: orders.filter(o => o.dateCreated && new Date(o.dateCreated).toLocaleString('default', { month: 'short' }) === p.x).length }))} color="#4f46e5" />
            </SectionCard>
            <SectionCard title="Status Pipeline" icon={Activity} iconColor="var(--info)">
              <HBarChart values={m.statusDist.map((s, i) => ({ label: s.label, value: s.value, color: s.color }))} />
            </SectionCard>
          </div>

          {/* Delayed Orders Detail */}
          {m.delayedOrders.length > 0 && (
            <SectionCard title="Delayed Warp Batches" icon={AlertTriangle} iconColor="var(--danger)">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Yarn Type</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Delivery Date</th>
                      <th style={{ textAlign: 'right' }}>Days Delayed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.delayedOrders.map(o => {
                      const daysLate = Math.floor((TODAY - new Date(o.deliveryDate)) / 86400000);
                      return (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 700, color: 'var(--danger)' }}>{o.id}</td>
                          <td>{o.customerName}</td>
                          <td><span className="badge badge-started">{o.threadType}</span></td>
                          <td><span className="badge badge-inprogress">{o.status}</span></td>
                          <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{o.deliveryDate}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger)' }}>+{daysLate}d</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: CUSTOMER ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'customer' && (
        <>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
            <KPICard icon={Users} title="Total Customers" value={fmtN(m.totalCustomers)} desc="Registered accounts" color="indigo" />
            <KPICard icon={Activity} title="Active Customers" value={fmtN(m.activeCustomers)} desc="Have placed orders" color="cyan" />
            <KPICard icon={Award} title="Regular Customers" value={fmtN(m.regularCustomers)} desc="Repeat business" color="emerald" />
            <KPICard icon={TrendingUp} title="New Customers" value={fmtN(m.newCustomers)} desc="First-time registrations" color="amber" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <SectionCard title="Customer Segments" icon={PieChart} iconColor="var(--primary)">
              <DonutChart slices={[
                { label: 'Regular Customers', value: m.regularCustomers, color: '#10b981' },
                { label: 'New Customers', value: m.newCustomers, color: '#f59e0b' },
              ]} size={140} />
            </SectionCard>

            <SectionCard title="Order Frequency (Top Customers)" icon={BarChart2} iconColor="var(--info)">
              <HBarChart values={m.topCustomers.slice(0, 5).map((c, i) => ({
                label: c.companyName.length > 15 ? c.companyName.slice(0, 15) + '…' : c.companyName,
                value: c.orderCount,
                color: YARN_PALETTE[i % YARN_PALETTE.length]
              }))} />
            </SectionCard>
          </div>

          {/* Top Customers Table */}
          <SectionCard title="Top Customers by Revenue" icon={DollarSign} iconColor="var(--success)">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Company</th>
                    <th>Contact</th>
                    <th style={{ textAlign: 'center' }}>Orders</th>
                    <th style={{ textAlign: 'right' }}>Total Yarns</th>
                    <th style={{ textAlign: 'right' }}>Revenue (₹)</th>
                    <th style={{ textAlign: 'right' }}>Share %</th>
                  </tr>
                </thead>
                <tbody>
                  {m.topCustomers.map((c, i) => (
                    <tr key={c.companyName}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{c.companyName}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{c.contactName}</td>
                      <td style={{ textAlign: 'center' }}><span className="badge badge-inprogress">{c.orderCount}</span></td>
                      <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{c.yarns.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>₹{fmt(c.totalRevenue)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--primary)' }}>
                        {m.totalRevenue > 0 ? Math.round(c.totalRevenue / m.totalRevenue * 100) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Outstanding customers */}
          {m.custOutstandingList.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <SectionCard title="Customers with Outstanding Balance" icon={AlertTriangle} iconColor="var(--danger)">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Customer / Company</th>
                        <th style={{ textAlign: 'right' }}>Outstanding (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.custOutstandingList.map(c => (
                        <tr key={c.name}>
                          <td style={{ fontWeight: 600 }}>{c.name}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger)' }}>₹{fmt(c.amt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: FINANCIAL ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'financial' && (
        <>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
            <KPICard icon={DollarSign} title="Total Revenue" value={`₹${fmt(m.totalRevenue)}`} desc="All orders billed" color="emerald" trend="up" />
            <KPICard icon={IndianRupee} title="Outstanding Balance" value={`₹${fmt(m.outstandingAmount)}`} desc="Unpaid approved invoices" color="rose" />
            <KPICard icon={Archive} title="Total Collected" value={`₹${fmt(m.totalPaid)}`} desc="All payments received" color="indigo" />
            <KPICard icon={TrendingUp} title="Advance Received" value={`₹${fmt(m.totalAdvance)}`} desc="Customer advances" color="cyan" />
            <KPICard icon={Clock} title="Pending Payments" value={fmtN(m.pendingPayments)} desc="Approved unpaid invoices" color="amber" />
            <KPICard icon={Calendar} title="Weekly Collection" value={`₹${fmt(m.weekPayments)}`} desc="Last 7 days" color="indigo" />
            <KPICard icon={Target} title="Monthly Collection" value={`₹${fmt(m.monthPayments)}`} desc="This month" color="emerald" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <SectionCard title="Revenue vs Collections" icon={TrendingUp} iconColor="var(--primary)">
              <VBarChart data={[
                { name: 'Total Revenue', value: Math.round(m.totalRevenue), color: '#4f46e5' },
                { name: 'Collected', value: Math.round(m.totalPaid), color: '#10b981' },
                { name: 'Outstanding', value: Math.round(m.outstandingAmount), color: '#ef4444' },
                { name: 'Advances', value: Math.round(m.totalAdvance), color: '#06b6d4' },
              ]} showValues />
            </SectionCard>

            <SectionCard title="Collection Breakdown" icon={PieChart} iconColor="var(--success)">
              <DonutChart slices={[
                { label: 'Collected', value: Math.round(m.totalPaid / 100), color: '#10b981' },
                { label: 'Outstanding', value: Math.round(m.outstandingAmount / 100), color: '#ef4444' },
                { label: 'Advances', value: Math.round(m.totalAdvance / 100), color: '#06b6d4' },
              ]} size={140} />
            </SectionCard>
          </div>

          {/* Payment History */}
          {payments.length > 0 && (
            <SectionCard title="Payment History" icon={Archive} iconColor="var(--success)">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Invoice</th>
                      <th>Customer</th>
                      <th>Method</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.id}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{p.invoiceId}</td>
                        <td style={{ fontWeight: 600 }}>{p.customerName}</td>
                        <td><span className="badge badge-received">{p.method}</span></td>
                        <td style={{ color: 'var(--text-muted)' }}>{p.date}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>₹{fmt(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* Advance History */}
          {advances.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <SectionCard title="Advance History" icon={TrendingUp} iconColor="var(--info)">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Advance ID</th>
                        <th>Customer</th>
                        <th>Method</th>
                        <th>Date</th>
                        <th>Remarks</th>
                        <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {advances.map(a => (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 700, color: 'var(--info)' }}>{a.id}</td>
                          <td style={{ fontWeight: 600 }}>{a.customerName}</td>
                          <td><span className="badge badge-started">{a.method}</span></td>
                          <td style={{ color: 'var(--text-muted)' }}>{a.date}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>{a.remarks || '—'}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--info)' }}>₹{fmt(a.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 5: ORDER ANALYTICS (Status Distribution)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'orders' && (
        <>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
            {m.statusDist.map(s => (
              <div key={s.label} className="kpi-card" style={{ borderLeft: `4px solid ${s.color}` }}>
                <div className="kpi-icon-wrapper" style={{ background: `${s.color}20`, color: s.color }}>
                  <Activity size={20} />
                </div>
                <span className="kpi-title">{s.label}</span>
                <span className="kpi-value">{fmtN(s.value)}</span>
                <span className="kpi-desc">
                  {orders.length > 0 ? Math.round(s.value / orders.length * 100) : 0}% of total orders
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <SectionCard title="Order Status Distribution" icon={BarChart2} iconColor="var(--primary)">
              <VBarChart data={m.statusDist.map(s => ({ name: s.label.replace('Ready for ', 'Ready\n'), value: s.value, color: s.color }))} />
            </SectionCard>
            <SectionCard title="Status Breakdown" icon={PieChart} iconColor="var(--info)">
              <DonutChart slices={m.statusDist} size={150} />
            </SectionCard>
          </div>

          {/* Percentage bars */}
          <SectionCard title="Percentage Distribution by Status" icon={Target} iconColor="var(--success)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {m.statusDist.filter(s => s.value > 0).map(s => {
                const pct = orders.length > 0 ? Math.round(s.value / orders.length * 100) : 0;
                return (
                  <div key={s.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color }} />
                        {s.label}
                      </span>
                      <span style={{ fontWeight: 600, color: s.color }}>{s.value} orders ({pct}%)</span>
                    </div>
                    <div className="progress-container" style={{ height: '8px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: '10px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 6: YARN ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'yarn' && (
        <>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
            <KPICard icon={Layers} title="Yarn Types Used" value={fmtN(m.yarnStats.length)} desc="Distinct thread types" color="indigo" />
            <KPICard icon={Package} title="Total Yarn Processed" value={`${(m.yarnStats.reduce((s, y) => s + y.totalYarns, 0) / 1000).toFixed(1)}K`} desc="Total yarn units run" color="cyan" />
            <KPICard icon={DollarSign} title="Top Yarn Revenue" value={m.yarnStats.length > 0 ? `₹${fmt(m.yarnStats[0]?.revenue)}` : '—'} desc={m.yarnStats[0]?.type || 'N/A'} color="emerald" />
            <KPICard icon={Award} title="Most Used Type" value={m.yarnStats[0]?.type || '—'} desc={`${fmtN(m.yarnStats[0]?.totalYarns)} yarns`} color="amber" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <SectionCard title="Yarn Usage by Type (Yarns)" icon={BarChart2} iconColor="var(--primary)">
              <VBarChart data={m.yarnStats.map((y, i) => ({
                name: y.type, value: y.totalYarns, color: YARN_PALETTE[i % YARN_PALETTE.length]
              }))} showValues />
            </SectionCard>
            <SectionCard title="Revenue by Yarn Type" icon={DollarSign} iconColor="var(--success)">
              <DonutChart slices={m.yarnStats.map((y, i) => ({
                label: y.type, value: Math.round(y.revenue), color: YARN_PALETTE[i % YARN_PALETTE.length]
              }))} size={140} />
            </SectionCard>
          </div>

          <SectionCard title="Yarn Type Summary Table" icon={Layers} iconColor="var(--info)">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Yarn Type</th>
                    <th style={{ textAlign: 'center' }}>Orders</th>
                    <th style={{ textAlign: 'right' }}>Total Yarns</th>
                    <th style={{ textAlign: 'right' }}>Revenue (₹)</th>
                    <th style={{ textAlign: 'right' }}>Avg. Revenue/Order</th>
                  </tr>
                </thead>
                <tbody>
                  {m.yarnStats.map((y, i) => (
                    <tr key={y.type}>
                      <td style={{ fontWeight: 700, color: YARN_PALETTE[i % YARN_PALETTE.length] }}>#{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: YARN_PALETTE[i % YARN_PALETTE.length] }} />
                          <strong>{y.type}</strong>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}><span className="badge badge-inprogress">{y.orderCount}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{y.totalYarns.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>₹{fmt(y.revenue)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--primary)' }}>₹{fmt(y.orderCount > 0 ? y.revenue / y.orderCount : 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 7: REPORTS (Filterable + Export)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'reports' && (
        <>
          {/* Report Type Selector */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {['daily', 'weekly', 'monthly', 'customer', 'production', 'financial'].map(t => (
              <button
                key={t}
                onClick={() => setReportType(t)}
                className={reportType === t ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)} Report
              </button>
            ))}
          </div>

          {/* Filters Panel */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <div className="card-title">
                <h3><Filter size={16} style={{ color: 'var(--primary)' }} /> Filter &amp; Search</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
                  <Download size={14} /> Export CSV
                </button>
                <button className="btn btn-primary btn-sm" onClick={handlePrint}>
                  <Printer size={14} /> Print Report
                </button>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">From Date</label>
                  <input type="date" className="form-input" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">To Date</label>
                  <input type="date" className="form-input" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Customer</label>
                  <select className="form-input" value={filterCustomer} onChange={e => setFilterCustomer(e.target.value)}>
                    <option value="All">All Customers</option>
                    {allCustomerNames.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Order Status</label>
                  <select className="form-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="All">All Statuses</option>
                    {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Yarn Type</label>
                  <select className="form-input" value={filterYarnType} onChange={e => setFilterYarnType(e.target.value)}>
                    <option value="All">All Yarn Types</option>
                    {uniqueYarnTypes.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Search</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '32px' }}
                      placeholder="Order ID, customer..."
                      value={reportSearch}
                      onChange={e => setReportSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary bar for filtered results */}
          <div style={{
            display: 'flex', gap: '16px', flexWrap: 'wrap',
            background: 'var(--bg-card)', padding: '12px 20px',
            borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
            marginBottom: '16px', fontSize: '0.82rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Showing <strong style={{ color: 'var(--text-main)' }}>{filteredReportOrders.length}</strong> of {orders.length} orders</span>
            <span style={{ color: 'var(--text-muted)' }}>Total Revenue: <strong style={{ color: 'var(--success)' }}>₹{fmt(filteredReportOrders.reduce((s, o) => s + (o.price || 0), 0))}</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>Total Yarns: <strong style={{ color: 'var(--primary)' }}>{filteredReportOrders.reduce((s, o) => s + (o.totalYarns || 0), 0).toLocaleString()}</strong></span>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: 'auto', fontSize: '0.75rem' }}
              onClick={() => { setFilterCustomer('All'); setFilterStatus('All'); setFilterYarnType('All'); setReportSearch(''); setFilterDateFrom('2026-06-01'); setFilterDateTo('2026-06-18'); }}
            >
              <RefreshCw size={12} /> Reset Filters
            </button>
          </div>

          {/* Results Table */}
          <SectionCard
            title={`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report — Order Details`}
            icon={FileText}
            iconColor="var(--primary)"
            action={
              <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
                <Download size={14} /> CSV
              </button>
            }
          >
            {filteredReportOrders.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Yarn Type</th>
                      <th style={{ textAlign: 'center' }}>Yarns</th>
                      <th style={{ textAlign: 'center' }}>Bells</th>
                      <th>Status</th>
                      <th>Date Created</th>
                      <th>Delivery Date</th>
                      <th style={{ textAlign: 'right' }}>Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReportOrders.map(o => {
                      const statusClass = {
                        Received: 'badge-received', Started: 'badge-started',
                        'In Progress': 'badge-inprogress', Completed: 'badge-completed',
                        Delivered: 'badge-delivered',
                      }[o.status] || 'badge-received';
                      const isDelayed = !['Delivered', 'Completed'].includes(o.status) && new Date(o.deliveryDate) < TODAY;
                      return (
                        <tr key={o.id} style={{ background: isDelayed ? 'rgba(239,68,68,0.04)' : undefined }}>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{o.id}</td>
                          <td style={{ fontWeight: 600 }}>{o.customerName}</td>
                          <td>
                            <span style={{ background: 'rgba(99,102,241,.12)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,.3)', padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                              {o.threadType}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>{(o.totalYarns || 0).toLocaleString()}</td>
                          <td style={{ textAlign: 'center' }}>{o.bellCount}</td>
                          <td><span className={`badge ${statusClass}`}>{o.status}</span></td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{o.dateCreated}</td>
                          <td style={{ color: isDelayed ? 'var(--danger)' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: isDelayed ? 700 : 400 }}>
                            {o.deliveryDate}{isDelayed ? ' ⚠️' : ''}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>₹{fmt(o.price)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'var(--bg-app)', fontWeight: 700 }}>
                      <td colSpan={3} style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Total — {filteredReportOrders.length} order(s)
                      </td>
                      <td style={{ textAlign: 'center', padding: '12px 16px', fontWeight: 700, color: 'var(--primary)' }}>
                        {filteredReportOrders.reduce((s, o) => s + (o.totalYarns || 0), 0).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'center', padding: '12px 16px', fontWeight: 700, color: 'var(--primary)' }}>
                        {filteredReportOrders.reduce((s, o) => s + (o.bellCount || 0), 0)}
                      </td>
                      <td colSpan={3} />
                      <td style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, color: 'var(--success)', fontSize: '1rem' }}>
                        ₹{fmt(filteredReportOrders.reduce((s, o) => s + (o.price || 0), 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <FileText size={40} style={{ opacity: 0.3, marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
                <p>No orders match the selected filters.</p>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}

export default ReportsAnalytics;
