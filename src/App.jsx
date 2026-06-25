import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Activity, 
  MessageSquare, 
  BarChart2, 
  Cpu, 
  Menu, 
  X,
  Tag,
  Receipt
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import CustomerManager from './components/CustomerManager';
import OrderManager from './components/OrderManager';
import ProductionTracker from './components/ProductionTracker';
import FeedbackManager from './components/FeedbackManager';
import ReportsAnalytics from './components/ReportsAnalytics';
import FutureScope from './components/FutureScope';
import YarnRateMaster from './components/YarnRateMaster';
import InvoiceManager from './components/InvoiceManager';

// ─────────────────────────────────────────────
// Initial Mock Data
// ─────────────────────────────────────────────
const INITIAL_CUSTOMERS = [
  { id: "CUST-001", name: "Lakshmi Sarees",    phone: "9876543210", address: "12, Weaver Street, Salem, TN",             materialSource: "Company Supplied", customerType: "Regular Customer" },
  { id: "CUST-002", name: "Kumar Textiles",    phone: "9443219876", address: "45, Cotton Mills Area, Erode, TN",         materialSource: "Market Supply",     customerType: "Regular Customer" },
  { id: "CUST-003", name: "Revathi Fabrics",   phone: "8877665544", address: "8, Handloom Complex, Madurai, TN",         materialSource: "Company Supplied", customerType: "New Customer"     },
  { id: "CUST-004", name: "Royal Looms",       phone: "9001234567", address: "Sec-3, GIDC Industrial Estate, Surat, GJ", materialSource: "Market Supply",     customerType: "Regular Customer" }
];

const INITIAL_ORDERS = [
  { id: "ORD-101", customerName: "Lakshmi Sarees",  threadType: "Silk",      bobbinCount: 120, bellCount: 8,  sections: 12, borderWidth: 4, deliveryDate: "2026-06-20", transportRequired: true,  status: "In Progress", progress: 60,  dateCreated: "2026-06-16", price: 18000 },
  { id: "ORD-102", customerName: "Kumar Textiles",  threadType: "Cotton",    bobbinCount: 200, bellCount: 10, sections: 15, borderWidth: 2, deliveryDate: "2026-06-19", transportRequired: false, status: "Started",     progress: 30,  dateCreated: "2026-06-17", price: 25000 },
  { id: "ORD-103", customerName: "Revathi Fabrics", threadType: "Polyester", bobbinCount: 80,  bellCount: 6,  sections: 8,  borderWidth: 3, deliveryDate: "2026-06-18", transportRequired: true,  status: "Received",    progress: 10,  dateCreated: "2026-06-18", price: 9500  },
  { id: "ORD-104", customerName: "Royal Looms",     threadType: "Cotton",    bobbinCount: 300, bellCount: 12, sections: 20, borderWidth: 5, deliveryDate: "2026-06-15", transportRequired: true,  status: "In Progress", progress: 60,  dateCreated: "2026-06-10", price: 42000 },
  { id: "ORD-105", customerName: "Lakshmi Sarees",  threadType: "Silk",      bobbinCount: 150, bellCount: 8,  sections: 10, borderWidth: 4, deliveryDate: "2026-06-25", transportRequired: false, status: "Completed",   progress: 90,  dateCreated: "2026-06-14", price: 21000 },
  { id: "ORD-106", customerName: "Kumar Textiles",  threadType: "Blend",     bobbinCount: 180, bellCount: 7,  sections: 12, borderWidth: 2, deliveryDate: "2026-06-12", transportRequired: true,  status: "Delivered",   progress: 100, dateCreated: "2026-06-05", price: 23500 }
];

const INITIAL_FEEDBACKS = [
  { id: "FB-001", orderId: "ORD-106", customerName: "Kumar Textiles",  deliveryExperience: "On Time",     qualityExperience: "Excellent", futurePartnership: "Definitely", comments: "Yarn warping was perfect, no breakage during weaving." },
  { id: "FB-002", orderId: "ORD-105", customerName: "Lakshmi Sarees",  deliveryExperience: "Before Time", qualityExperience: "Good",      futurePartnership: "Definitely", comments: "Very prompt completion. Appreciate the support." }
];

const INITIAL_YARN_RATES = [
  { id: "YR-001", yarnType: "Cotton",    ratePerThousand: 66 },
  { id: "YR-002", yarnType: "Silk",      ratePerThousand: 75 },
  { id: "YR-003", yarnType: "Polyester", ratePerThousand: 55 },
  { id: "YR-004", yarnType: "Blend",     ratePerThousand: 60 },
  { id: "YR-005", yarnType: "Wool",      ratePerThousand: 80 },
  { id: "YR-006", yarnType: "Linen",     ratePerThousand: 70 }
];

// ─────────────────────────────────────────────
// Invoice auto-generation helper
// ─────────────────────────────────────────────
const generateInvoiceForOrder = (order, yarnRates, existingInvoices) => {
  // Don't duplicate
  if (existingInvoices.some(inv => inv.orderId === order.id)) return null;

  const rateObj = yarnRates.find(r => r.yarnType === order.threadType);
  const ratePerThousand = rateObj ? rateObj.ratePerThousand : 0;
  const amountPerBell = ratePerThousand > 0
    ? (order.bobbinCount * ratePerThousand) / 1000
    : 0;
  const totalAmount = amountPerBell * order.bellCount;

  const invNum = `INV-${Date.now().toString().slice(-5)}`;
  return {
    id: invNum,
    orderId: order.id,
    customerName: order.customerName,
    yarnType: order.threadType,
    yarnCount: order.bobbinCount,
    bellCount: order.bellCount,
    ratePerThousand,
    amountPerBell,
    totalAmount,
    orderDate: order.dateCreated,
    deliveryDate: order.deliveryDate,
    invoiceDate: new Date("2026-06-18").toISOString().split('T')[0],
    status: 'Draft',
    notes: ''
  };
};

// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customers,  setCustomers]  = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [feedbacks,  setFeedbacks]  = useState([]);
  const [yarnRates,  setYarnRates]  = useState([]);
  const [invoices,   setInvoices]   = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── Load from localStorage ──────────────────
  useEffect(() => {
    // Customers
    const storedCustomers = localStorage.getItem('warpwrap_customers');
    if (storedCustomers) {
      try {
        const parsed = JSON.parse(storedCustomers);
        if (parsed.length > 0 && parsed[0].materialSource === undefined) throw new Error("Legacy");
        setCustomers(parsed);
      } catch { localStorage.setItem('warpwrap_customers', JSON.stringify(INITIAL_CUSTOMERS)); setCustomers(INITIAL_CUSTOMERS); }
    } else { localStorage.setItem('warpwrap_customers', JSON.stringify(INITIAL_CUSTOMERS)); setCustomers(INITIAL_CUSTOMERS); }

    // Orders
    const storedOrders = localStorage.getItem('warpwrap_orders');
    if (storedOrders) {
      try {
        const parsed = JSON.parse(storedOrders);
        if (parsed.length > 0 && (parsed[0].price === undefined || parsed[0].progress === undefined)) throw new Error("Legacy");
        setOrders(parsed);
      } catch { localStorage.setItem('warpwrap_orders', JSON.stringify(INITIAL_ORDERS)); setOrders(INITIAL_ORDERS); }
    } else { localStorage.setItem('warpwrap_orders', JSON.stringify(INITIAL_ORDERS)); setOrders(INITIAL_ORDERS); }

    // Feedbacks
    const storedFeedbacks = localStorage.getItem('warpwrap_feedback');
    if (storedFeedbacks) {
      try {
        const parsed = JSON.parse(storedFeedbacks);
        if (parsed.length > 0 && parsed[0].deliveryExperience === undefined) throw new Error("Legacy");
        setFeedbacks(parsed);
      } catch { localStorage.setItem('warpwrap_feedback', JSON.stringify(INITIAL_FEEDBACKS)); setFeedbacks(INITIAL_FEEDBACKS); }
    } else { localStorage.setItem('warpwrap_feedback', JSON.stringify(INITIAL_FEEDBACKS)); setFeedbacks(INITIAL_FEEDBACKS); }

    // Yarn Rates
    const storedYarnRates = localStorage.getItem('warpwrap_yarn_rates');
    if (storedYarnRates) {
      try { setYarnRates(JSON.parse(storedYarnRates)); }
      catch { localStorage.setItem('warpwrap_yarn_rates', JSON.stringify(INITIAL_YARN_RATES)); setYarnRates(INITIAL_YARN_RATES); }
    } else { localStorage.setItem('warpwrap_yarn_rates', JSON.stringify(INITIAL_YARN_RATES)); setYarnRates(INITIAL_YARN_RATES); }

    // Invoices
    const storedInvoices = localStorage.getItem('warpwrap_invoices');
    if (storedInvoices) {
      try { setInvoices(JSON.parse(storedInvoices)); }
      catch { localStorage.setItem('warpwrap_invoices', JSON.stringify([])); setInvoices([]); }
    } else {
      // Auto-generate draft invoices for all existing orders on first load
      const rates = storedYarnRates ? JSON.parse(storedYarnRates) : INITIAL_YARN_RATES;
      const ordersToUse = storedOrders ? JSON.parse(storedOrders) : INITIAL_ORDERS;
      const generatedInvoices = [];
      ordersToUse.forEach(order => {
        const inv = generateInvoiceForOrder(order, rates, generatedInvoices);
        if (inv) generatedInvoices.push(inv);
      });
      localStorage.setItem('warpwrap_invoices', JSON.stringify(generatedInvoices));
      setInvoices(generatedInvoices);
    }
  }, []);

  // ── Persist helpers ─────────────────────────
  const saveCustomers = (newCustomers) => {
    setCustomers(newCustomers);
    localStorage.setItem('warpwrap_customers', JSON.stringify(newCustomers));
  };

  const saveOrders = (newOrders) => {
    // Detect newly added orders and auto-generate invoices
    const currentIds = new Set(orders.map(o => o.id));
    const addedOrders = newOrders.filter(o => !currentIds.has(o.id));

    let updatedInvoices = [...invoices];
    addedOrders.forEach(order => {
      const currentYarnRates = yarnRates.length > 0 ? yarnRates : INITIAL_YARN_RATES;
      const inv = generateInvoiceForOrder(order, currentYarnRates, updatedInvoices);
      if (inv) updatedInvoices.push(inv);
    });

    setOrders(newOrders);
    localStorage.setItem('warpwrap_orders', JSON.stringify(newOrders));

    if (addedOrders.length > 0) {
      setInvoices(updatedInvoices);
      localStorage.setItem('warpwrap_invoices', JSON.stringify(updatedInvoices));
    }
  };

  const saveFeedbacks = (newFeedbacks) => {
    setFeedbacks(newFeedbacks);
    localStorage.setItem('warpwrap_feedback', JSON.stringify(newFeedbacks));
  };

  const saveYarnRates = (newRates) => {
    setYarnRates(newRates);
    localStorage.setItem('warpwrap_yarn_rates', JSON.stringify(newRates));
  };

  const saveInvoices = (newInvoices) => {
    setInvoices(newInvoices);
    localStorage.setItem('warpwrap_invoices', JSON.stringify(newInvoices));
  };

  // ── Navigation items ────────────────────────
  const navItems = [
    { key: 'dashboard',  label: 'Dashboard',         icon: <LayoutDashboard /> },
    { key: 'customers',  label: 'Customers',          icon: <Users /> },
    { key: 'orders',     label: 'Orders',             icon: <FileText /> },
    { key: 'production', label: 'Production',         icon: <Activity /> },
    { key: 'yarn-rates', label: 'Yarn Rate Master',   icon: <Tag /> },
    { key: 'invoices',   label: 'Invoices',           icon: <Receipt /> },
    { key: 'feedback',   label: 'Feedback',           icon: <MessageSquare /> },
    { key: 'reports',    label: 'Reports & Analytics',icon: <BarChart2 /> },
    { key: 'future',     label: 'Future AI Scope',    icon: <Cpu /> },
  ];

  // ── Render content ──────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            orders={orders}
            customers={customers}
            setActiveTab={setActiveTab}
            invoices={invoices}
          />
        );
      case 'customers':
        return (
          <CustomerManager
            customers={customers}
            saveCustomers={saveCustomers}
            orders={orders}
          />
        );
      case 'orders':
        return (
          <OrderManager
            orders={orders}
            saveOrders={saveOrders}
            customers={customers}
            yarnRates={yarnRates}
          />
        );
      case 'production':
        return (
          <ProductionTracker
            orders={orders}
            saveOrders={saveOrders}
          />
        );
      case 'yarn-rates':
        return (
          <YarnRateMaster
            yarnRates={yarnRates}
            saveYarnRates={saveYarnRates}
          />
        );
      case 'invoices':
        return (
          <InvoiceManager
            invoices={invoices}
            saveInvoices={saveInvoices}
            yarnRates={yarnRates}
          />
        );
      case 'feedback':
        return (
          <FeedbackManager
            feedbacks={feedbacks}
            saveFeedbacks={saveFeedbacks}
            orders={orders}
          />
        );
      case 'reports':
        return (
          <ReportsAnalytics
            orders={orders}
            customers={customers}
          />
        );
      case 'future':
        return <FutureScope />;
      default:
        return (
          <Dashboard
            orders={orders}
            customers={customers}
            setActiveTab={setActiveTab}
            invoices={invoices}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Hamburger Header */}
      <div style={{
        display: 'none',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#0f172a',
        color: 'white',
        padding: '16px 20px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }} className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #818cf8, #4f46e5)',
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>W</div>
          <h2 style={{ fontSize: '1rem', margin: 0, fontFamily: 'Outfit' }}>WarpWrap</h2>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">W</div>
          <div className="logo-text">
            <h2>WarpWrap</h2>
            <span>Production Intel</span>
          </div>
        </div>

        <div className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.key); setIsSidebarOpen(false); }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <p>© 2026 WarpWrap App</p>
          <p style={{ fontSize: '0.65rem', marginTop: '2px', color: '#475569' }}>BCA Mini Project Prototype</p>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="main-viewport">
        {renderContent()}
      </div>

      {/* Mobile responsive inject */}
      <style>{`
        @media (max-width: 992px) {
          .mobile-header {
            display: flex !important;
          }
          .main-viewport {
            margin-top: 60px;
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export default App;
