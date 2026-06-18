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
  Factory
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import CustomerManager from './components/CustomerManager';
import OrderManager from './components/OrderManager';
import ProductionTracker from './components/ProductionTracker';
import FeedbackManager from './components/FeedbackManager';
import ReportsAnalytics from './components/ReportsAnalytics';
import FutureScope from './components/FutureScope';

// Initial Mock Data to populate LocalStorage if empty
const INITIAL_CUSTOMERS = [
  {
    id: "CUST-001",
    name: "Lakshmi Sarees",
    phone: "9876543210",
    address: "12, Weaver Street, Salem, TN",
    materialSource: "Company Supplied",
    customerType: "Regular Customer"
  },
  {
    id: "CUST-002",
    name: "Kumar Textiles",
    phone: "9443219876",
    address: "45, Cotton Mills Area, Erode, TN",
    materialSource: "Market Supply",
    customerType: "Regular Customer"
  },
  {
    id: "CUST-003",
    name: "Revathi Fabrics",
    phone: "8877665544",
    address: "8, Handloom Complex, Madurai, TN",
    materialSource: "Company Supplied",
    customerType: "New Customer"
  },
  {
    id: "CUST-004",
    name: "Royal Looms",
    phone: "9001234567",
    address: "Sec-3, GIDC Industrial Estate, Surat, GJ",
    materialSource: "Market Supply",
    customerType: "Regular Customer"
  }
];

const INITIAL_ORDERS = [
  {
    id: "ORD-101",
    customerName: "Lakshmi Sarees",
    threadType: "Silk",
    bobbinCount: 120,
    bellCount: 8,
    sections: 12,
    borderWidth: 4,
    deliveryDate: "2026-06-20",
    transportRequired: true,
    status: "In Progress",
    progress: 60,
    dateCreated: "2026-06-16",
    price: 18000
  },
  {
    id: "ORD-102",
    customerName: "Kumar Textiles",
    threadType: "Cotton",
    bobbinCount: 200,
    bellCount: 10,
    sections: 15,
    borderWidth: 2,
    deliveryDate: "2026-06-19",
    transportRequired: false,
    status: "Started",
    progress: 30,
    dateCreated: "2026-06-17",
    price: 25000
  },
  {
    id: "ORD-103",
    customerName: "Revathi Fabrics",
    threadType: "Polyester",
    bobbinCount: 80,
    bellCount: 6,
    sections: 8,
    borderWidth: 3,
    deliveryDate: "2026-06-18",
    transportRequired: true,
    status: "Received",
    progress: 10,
    dateCreated: "2026-06-18",
    price: 9500
  },
  {
    id: "ORD-104",
    customerName: "Royal Looms",
    threadType: "Cotton",
    bobbinCount: 300,
    bellCount: 12,
    sections: 20,
    borderWidth: 5,
    deliveryDate: "2026-06-15",
    transportRequired: true,
    status: "In Progress",
    progress: 60,
    dateCreated: "2026-06-10",
    price: 42000
  },
  {
    id: "ORD-105",
    customerName: "Lakshmi Sarees",
    threadType: "Silk",
    bobbinCount: 150,
    bellCount: 8,
    sections: 10,
    borderWidth: 4,
    deliveryDate: "2026-06-25",
    transportRequired: false,
    status: "Completed",
    progress: 90,
    dateCreated: "2026-06-14",
    price: 21000
  },
  {
    id: "ORD-106",
    customerName: "Kumar Textiles",
    threadType: "Blend",
    bobbinCount: 180,
    bellCount: 7,
    sections: 12,
    borderWidth: 2,
    deliveryDate: "2026-06-12",
    transportRequired: true,
    status: "Delivered",
    progress: 100,
    dateCreated: "2026-06-05",
    price: 23500
  }
];

const INITIAL_FEEDBACKS = [
  {
    id: "FB-001",
    orderId: "ORD-106",
    customerName: "Kumar Textiles",
    deliveryExperience: "On Time",
    qualityExperience: "Excellent",
    futurePartnership: "Definitely",
    comments: "Yarn warping was perfect, no breakage during weaving."
  },
  {
    id: "FB-002",
    orderId: "ORD-105",
    customerName: "Lakshmi Sarees",
    deliveryExperience: "Before Time",
    qualityExperience: "Good",
    futurePartnership: "Definitely",
    comments: "Very prompt completion. Appreciate the support."
  }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load state from local storage or set initial mock data
  useEffect(() => {
    const storedCustomers = localStorage.getItem('warpwrap_customers');
    const storedOrders = localStorage.getItem('warpwrap_orders');
    const storedFeedbacks = localStorage.getItem('warpwrap_feedback');

    if (storedCustomers) {
      try {
        const parsed = JSON.parse(storedCustomers);
        // Verify structural fields
        if (parsed.length > 0 && parsed[0].materialSource === undefined) {
          throw new Error("Legacy customer format");
        }
        setCustomers(parsed);
      } catch (err) {
        localStorage.setItem('warpwrap_customers', JSON.stringify(INITIAL_CUSTOMERS));
        setCustomers(INITIAL_CUSTOMERS);
      }
    } else {
      localStorage.setItem('warpwrap_customers', JSON.stringify(INITIAL_CUSTOMERS));
      setCustomers(INITIAL_CUSTOMERS);
    }

    if (storedOrders) {
      try {
        const parsed = JSON.parse(storedOrders);
        // Verify price and progress fields are defined
        if (parsed.length > 0 && (parsed[0].price === undefined || parsed[0].progress === undefined)) {
          throw new Error("Legacy order format");
        }
        setOrders(parsed);
      } catch (err) {
        localStorage.setItem('warpwrap_orders', JSON.stringify(INITIAL_ORDERS));
        setOrders(INITIAL_ORDERS);
      }
    } else {
      localStorage.setItem('warpwrap_orders', JSON.stringify(INITIAL_ORDERS));
      setOrders(INITIAL_ORDERS);
    }

    if (storedFeedbacks) {
      try {
        const parsed = JSON.parse(storedFeedbacks);
        if (parsed.length > 0 && parsed[0].deliveryExperience === undefined) {
          throw new Error("Legacy feedback format");
        }
        setFeedbacks(parsed);
      } catch (err) {
        localStorage.setItem('warpwrap_feedback', JSON.stringify(INITIAL_FEEDBACKS));
        setFeedbacks(INITIAL_FEEDBACKS);
      }
    } else {
      localStorage.setItem('warpwrap_feedback', JSON.stringify(INITIAL_FEEDBACKS));
      setFeedbacks(INITIAL_FEEDBACKS);
    }
  }, []);

  // Save changes to local storage when state changes
  const saveCustomers = (newCustomers) => {
    setCustomers(newCustomers);
    localStorage.setItem('warpwrap_customers', JSON.stringify(newCustomers));
  };

  const saveOrders = (newOrders) => {
    setOrders(newOrders);
    localStorage.setItem('warpwrap_orders', JSON.stringify(newOrders));
  };

  const saveFeedbacks = (newFeedbacks) => {
    setFeedbacks(newFeedbacks);
    localStorage.setItem('warpwrap_feedback', JSON.stringify(newFeedbacks));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            orders={orders} 
            customers={customers} 
            setActiveTab={setActiveTab} 
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
          />
        );
      case 'production':
        return (
          <ProductionTracker 
            orders={orders} 
            saveOrders={saveOrders} 
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
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
          >
            <LayoutDashboard />
            <span>Dashboard</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => { setActiveTab('customers'); setIsSidebarOpen(false); }}
          >
            <Users />
            <span>Customers</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
          >
            <FileText />
            <span>Orders</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'production' ? 'active' : ''}`}
            onClick={() => { setActiveTab('production'); setIsSidebarOpen(false); }}
          >
            <Activity />
            <span>Production</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => { setActiveTab('feedback'); setIsSidebarOpen(false); }}
          >
            <MessageSquare />
            <span>Feedback</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => { setActiveTab('reports'); setIsSidebarOpen(false); }}
          >
            <BarChart2 />
            <span>Reports & Analytics</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'future' ? 'active' : ''}`}
            onClick={() => { setActiveTab('future'); setIsSidebarOpen(false); }}
          >
            <Cpu />
            <span>Future AI Scope</span>
          </button>
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

      {/* Mobile styling inject */}
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
