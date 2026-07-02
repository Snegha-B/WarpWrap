import React, { useState, useEffect, useRef } from 'react';
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
  Receipt,
  Bell,
  Trash2,
  Check,
  IndianRupee,
  Settings as SettingsIcon
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
import AccountsPayments from './components/AccountsPayments';
import Settings from './components/Settings';

// ─────────────────────────────────────────────
// Initial Mock Data
// ─────────────────────────────────────────────
const INITIAL_CUSTOMERS = [
  { id: "CUST-001", name: "Magesh Kumar", companyName: "Lakshmi Sarees", phone: "9876543210", address: "12, Weaver Street, Salem, TN", materialSource: "Company Supplied", customerType: "Regular Customer", createdDate: "2026-06-01", openingBalance: 0 },
  { id: "CUST-002", name: "Suresh Kumar", companyName: "Kumar Textiles", phone: "9443219876", address: "45, Cotton Mills Area, Erode, TN", materialSource: "Market Supply", customerType: "Regular Customer", createdDate: "2026-06-05", openingBalance: 0 },
  { id: "CUST-003", name: "Ravi Shankar", companyName: "Revathi Fabrics", phone: "8877665544", address: "8, Handloom Complex, Madurai, TN", materialSource: "Company Supplied", customerType: "New Customer", createdDate: "2026-06-10", openingBalance: 0 },
  { id: "CUST-004", name: "Rajesh Patel", companyName: "Royal Looms", phone: "9001234567", address: "Sec-3, GIDC Industrial Estate, Surat, GJ", materialSource: "Market Supply", customerType: "Regular Customer", createdDate: "2026-06-12", openingBalance: 0 }
];

const INITIAL_ORDERS = [
  { id: "ORD-101", customerName: "Lakshmi Sarees", threadType: "Silk", totalYarns: 8350, bellCount: 8, sections: 12, borderWidth: 4, deliveryDate: "2026-06-20", transportRequired: true, status: "In Progress", progress: 60, dateCreated: "2026-06-16", price: 5010 },
  { id: "ORD-102", customerName: "Kumar Textiles", threadType: "Cotton", totalYarns: 10000, bellCount: 10, sections: 15, borderWidth: 2, deliveryDate: "2026-06-19", transportRequired: false, status: "Started", progress: 30, dateCreated: "2026-06-17", price: 6600 },
  { id: "ORD-103", customerName: "Revathi Fabrics", threadType: "Polyester", totalYarns: 8000, bellCount: 6, sections: 8, borderWidth: 3, deliveryDate: "2026-06-18", transportRequired: true, status: "Received", progress: 10, dateCreated: "2026-06-18", price: 2640 },
  { id: "ORD-104", customerName: "Royal Looms", threadType: "Cotton", totalYarns: 12000, bellCount: 12, sections: 20, borderWidth: 5, deliveryDate: "2026-06-15", transportRequired: true, status: "In Progress", progress: 60, dateCreated: "2026-06-10", price: 9504 },
  { id: "ORD-105", customerName: "Lakshmi Sarees", threadType: "Silk", totalYarns: 9000, bellCount: 8, sections: 10, borderWidth: 4, deliveryDate: "2026-06-25", transportRequired: false, status: "Completed", progress: 90, dateCreated: "2026-06-14", price: 5400 },
  { id: "ORD-106", customerName: "Kumar Textiles", threadType: "Blend", totalYarns: 11000, bellCount: 7, sections: 12, borderWidth: 2, deliveryDate: "2026-06-12", transportRequired: true, status: "Delivered", progress: 100, dateCreated: "2026-06-05", price: 4620 }
];

const INITIAL_FEEDBACKS = [
  { id: "FB-001", orderId: "ORD-106", customerName: "Kumar Textiles", deliveryExperience: "On Time", qualityExperience: "Excellent", futurePartnership: "Definitely", comments: "Yarn warping was perfect, no breakage during weaving." },
  { id: "FB-002", orderId: "ORD-105", customerName: "Lakshmi Sarees", deliveryExperience: "Before Time", qualityExperience: "Good", futurePartnership: "Definitely", comments: "Very prompt completion. Appreciate the support." }
];

const INITIAL_YARN_RATES = [
  { id: "YR-001", yarnType: "Cotton", ratePerThousand: 66 },
  { id: "YR-002", yarnType: "Silk", ratePerThousand: 75 },
  { id: "YR-003", yarnType: "Polyester", ratePerThousand: 55 },
  { id: "YR-004", yarnType: "Zari", ratePerThousand: 80 },
  { id: "YR-005", yarnType: "Blend", ratePerThousand: 60 },
  { id: "YR-006", yarnType: "Wool", ratePerThousand: 85 },
  { id: "YR-007", yarnType: "Linen", ratePerThousand: 70 }
];

// ─────────────────────────────────────────────
// Invoice auto-generation helper
// ─────────────────────────────────────────────
const generateInvoiceForOrder = (order, yarnRates, existingInvoices, customersList = []) => {
  // Don't duplicate
  if (existingInvoices.some(inv => inv.orderId === order.id)) return null;

  const rateObj = yarnRates.find(r => r.yarnType === order.threadType);
  const ratePerThousand = rateObj ? rateObj.ratePerThousand : 0;

  // Amount Per Bell = (Total Yarns × Rate Per 1000 Yarns) ÷ 1000
  const amountPerBell = ratePerThousand > 0
    ? ((order.totalYarns || order.bobbinCount || 0) * ratePerThousand) / 1000
    : 0;
  const totalAmount = amountPerBell * (order.bellCount || 0);

  // Find customer contact and company details
  const customer = customersList.find(c => c.companyName === order.customerName || c.name === order.customerName);
  const contactName = customer ? customer.name : order.customerName;
  const companyName = customer ? customer.companyName : order.customerName;
  const pref = customer ? customer.paymentPreference : 'UPI';

  const invNum = `INV-${Date.now().toString().slice(-5)}`;
  const isDelivered = order.status === 'Delivered';
  const isCompleted = order.status === 'Completed';

  return {
    id: invNum,
    orderId: order.id,
    customerName: contactName,
    companyName: companyName,
    yarnType: order.threadType,
    totalYarns: order.totalYarns || order.bobbinCount || 0,
    bellCount: order.bellCount || 0,
    ratePerThousand,
    amountPerBell,
    totalAmount,
    orderDate: order.dateCreated,
    deliveryDate: order.deliveryDate,
    invoiceDate: new Date("2026-06-18").toISOString().split('T')[0],
    status: isDelivered ? 'Approved' : 'Draft',
    notes: '',
    paymentStatus: isDelivered ? 'Paid' : 'Pending',
    collectionStatus: isDelivered ? 'Collected' : (isCompleted ? 'Ready for Collection' : 'Pending Collection'),
    paymentPreference: pref || 'UPI',
    viewed: 'No',
    viewedDate: '',
    viewedTime: ''
  };
};

// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [customers, setCustomers] = useState(() => {
    const stored = localStorage.getItem('warpwrap_customers');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0 && parsed[0].materialSource === undefined) throw new Error("Legacy");
        return parsed;
      } catch {
        localStorage.setItem('warpwrap_customers', JSON.stringify(INITIAL_CUSTOMERS));
        return INITIAL_CUSTOMERS;
      }
    }
    localStorage.setItem('warpwrap_customers', JSON.stringify(INITIAL_CUSTOMERS));
    return INITIAL_CUSTOMERS;
  });

  const [orders, setOrders] = useState(() => {
    const stored = localStorage.getItem('warpwrap_orders');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0 && parsed[0].price === undefined) throw new Error("Legacy");
        return parsed;
      } catch {
        localStorage.setItem('warpwrap_orders', JSON.stringify(INITIAL_ORDERS));
        return INITIAL_ORDERS;
      }
    }
    localStorage.setItem('warpwrap_orders', JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  });

  const [feedbacks, setFeedbacks] = useState(() => {
    const stored = localStorage.getItem('warpwrap_feedback');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0 && parsed[0].deliveryExperience === undefined) throw new Error("Legacy");
        return parsed;
      } catch {
        localStorage.setItem('warpwrap_feedback', JSON.stringify(INITIAL_FEEDBACKS));
        return INITIAL_FEEDBACKS;
      }
    }
    localStorage.setItem('warpwrap_feedback', JSON.stringify(INITIAL_FEEDBACKS));
    return INITIAL_FEEDBACKS;
  });

  const [yarnRates, setYarnRates] = useState(() => {
    const stored = localStorage.getItem('warpwrap_yarn_rates');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.setItem('warpwrap_yarn_rates', JSON.stringify(INITIAL_YARN_RATES));
        return INITIAL_YARN_RATES;
      }
    }
    localStorage.setItem('warpwrap_yarn_rates', JSON.stringify(INITIAL_YARN_RATES));
    return INITIAL_YARN_RATES;
  });

  const [invoices, setInvoices] = useState(() => {
    const stored = localStorage.getItem('warpwrap_invoices');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.setItem('warpwrap_invoices', JSON.stringify([]));
        return [];
      }
    }
    // Auto-generate draft invoices for all existing orders on first load
    const storedYarnRates = localStorage.getItem('warpwrap_yarn_rates');
    const rates = storedYarnRates ? JSON.parse(storedYarnRates) : INITIAL_YARN_RATES;
    const storedOrders = localStorage.getItem('warpwrap_orders');
    const ordersToUse = storedOrders ? JSON.parse(storedOrders) : INITIAL_ORDERS;
    const storedCustomers = localStorage.getItem('warpwrap_customers');
    const custs = storedCustomers ? JSON.parse(storedCustomers) : INITIAL_CUSTOMERS;
    const generatedInvoices = [];
    ordersToUse.forEach(order => {
      const inv = generateInvoiceForOrder(order, rates, generatedInvoices, custs);
      if (inv) generatedInvoices.push(inv);
    });
    localStorage.setItem('warpwrap_invoices', JSON.stringify(generatedInvoices));
    return generatedInvoices;
  });

  // Accounts & Payments state
  const [payments, setPayments] = useState(() => {
    const stored = localStorage.getItem('warpwrap_payments');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        const initial = [
          { id: "PAY-101", invoiceId: "INV-106", customerId: "CUST-002", customerName: "Suresh Kumar", amount: 4620, date: "2026-06-12", method: "UPI", remarks: "Paid online on delivery" }
        ];
        localStorage.setItem('warpwrap_payments', JSON.stringify(initial));
        return initial;
      }
    }
    const initial = [
      { id: "PAY-101", invoiceId: "INV-106", customerId: "CUST-002", customerName: "Suresh Kumar", amount: 4620, date: "2026-06-12", method: "UPI", remarks: "Paid online on delivery" }
    ];
    localStorage.setItem('warpwrap_payments', JSON.stringify(initial));
    return initial;
  });

  const [advances, setAdvances] = useState(() => {
    const stored = localStorage.getItem('warpwrap_advances');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        const initial = [
          { id: "ADV-201", customerId: "CUST-001", customerName: "Magesh Kumar", amount: 1500, date: "2026-06-15", method: "Bank Transfer", remarks: "Advance for next order" }
        ];
        localStorage.setItem('warpwrap_advances', JSON.stringify(initial));
        return initial;
      }
    }
    const initial = [
      { id: "ADV-201", customerId: "CUST-001", customerName: "Magesh Kumar", amount: 1500, date: "2026-06-15", method: "Bank Transfer", remarks: "Advance for next order" }
    ];
    localStorage.setItem('warpwrap_advances', JSON.stringify(initial));
    return initial;
  });

  // Notifications state
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem('warpwrap_notifications');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.setItem('warpwrap_notifications', JSON.stringify([]));
        return [];
      }
    }
    localStorage.setItem('warpwrap_notifications', JSON.stringify([]));
    return [];
  });

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notificationRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("warpwrap_theme") || "light";
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("warpwrap_theme", theme);
  }, [theme]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Notifications triggering function
  const triggerNotification = (message, type, refType = 'generic', refId = '') => {
    const newNotif = {
      id: `NTF-${Date.now()}-${Math.random().toString(36).slice(-3)}`,
      message,
      type, // 'success' | 'info' | 'warning' | 'danger'
      refType,
      refId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      localStorage.setItem('warpwrap_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  // Delay checking hook
  useEffect(() => {
    const today = new Date("2026-06-18");
    orders.forEach(order => {
      if (order.status !== 'Delivered' && order.status !== 'Completed') {
        const deliveryDate = new Date(order.deliveryDate);
        if (!isNaN(deliveryDate.getTime()) && deliveryDate < today) {
          const delayNotifExists = notifications.some(n => n.refType === 'delay' && n.refId === order.id);
          if (!delayNotifExists) {
            triggerNotification(
              `Production Delay Warning: Order ${order.id} for ${order.customerName} is past its delivery date!`,
              'danger',
              'delay',
              order.id
            );
          }
        }
      }
    });
  }, [orders]);

  // Dynamic Ledger Calculations
  const getCustomerStats = (customer) => {
    const opening = Number(customer.openingBalance) || 0;

    // Approved Invoices for this customer
    const custInvoices = invoices.filter(
      inv => inv.status === 'Approved' &&
        (inv.companyName === customer.companyName || inv.customerName === customer.name)
    );
    const invoiceTotal = custInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    // Payments received
    const custPayments = payments.filter(p => p.customerId === customer.id);
    const paymentTotal = custPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Advances received
    const custAdvances = advances.filter(a => a.customerId === customer.id);
    const advanceTotal = custAdvances.reduce((sum, a) => sum + Number(a.amount), 0);

    const outstanding = opening + invoiceTotal - paymentTotal - advanceTotal;

    return {
      opening,
      invoiceTotal,
      paymentTotal,
      advanceTotal,
      outstanding
    };
  };

  const customersWithLedger = customers.map(c => {
    const stats = getCustomerStats(c);
    return {
      ...c,
      openingBalance: stats.opening,
      invoiceAmount: stats.invoiceTotal,
      advanceAmount: stats.advanceTotal,
      payments: stats.paymentTotal,
      outstandingBalance: stats.outstanding
    };
  });

  const saveCustomers = (newCustomers) => {
    const cleaned = newCustomers.map(c => {
      const { invoiceAmount, advanceAmount, payments: discardedPayments, outstandingBalance, ...rest } = c;
      return rest;
    });
    setCustomers(cleaned);
    localStorage.setItem('warpwrap_customers', JSON.stringify(cleaned));
  };

  const saveOrders = (newOrders) => {
    // Detect newly added orders and auto-generate invoices
    const currentIds = new Set(orders.map(o => o.id));
    const addedOrders = newOrders.filter(o => !currentIds.has(o.id));

    // Detect status transitions to 'Completed'
    const prevStatusMap = new Map(orders.map(o => [o.id, o.status]));
    newOrders.forEach(order => {
      const prevStatus = prevStatusMap.get(order.id);
      if (prevStatus && prevStatus !== 'Completed' && order.status === 'Completed') {
        triggerNotification(`Order ${order.id} is Ready for Collection!`, 'info', 'collection', order.id);
      }
    });

    // Sync existing invoices with order status updates
    const orderStatusMap = new Map(newOrders.map(o => [o.id, o]));
    let invoicesChanged = false;
    let newPaymentsList = [...payments];
    let paymentsChanged = false;

    let updatedInvoices = invoices.map(inv => {
      const order = orderStatusMap.get(inv.orderId);
      if (!order) return inv;

      let newCollectionStatus = inv.collectionStatus;
      let newPaymentStatus = inv.paymentStatus;
      let newStatus = inv.status;
      let changed = false;

      // 1. Sync collection status
      if (order.status === 'Delivered' && inv.collectionStatus !== 'Collected') {
        newCollectionStatus = 'Collected';
        changed = true;
      } else if (order.status === 'Completed' && inv.collectionStatus !== 'Ready for Collection') {
        newCollectionStatus = 'Ready for Collection';
        changed = true;
      } else if (!['Delivered', 'Completed'].includes(order.status) && inv.collectionStatus !== 'Pending Collection') {
        newCollectionStatus = 'Pending Collection';
        changed = true;
      }

      // 2. Sync payment status on Delivered: automatically set paymentStatus to 'Paid'
      if (order.status === 'Delivered' && inv.paymentStatus !== 'Paid') {
        newPaymentStatus = 'Paid';
        newStatus = 'Approved'; // Automatically Approve/Lock if delivered
        changed = true;

        // Register a payment record
        const matchedCust = customers.find(c => c.companyName === inv.companyName || c.name === inv.customerName);
        const custId = matchedCust ? matchedCust.id : `CUST-${Date.now().toString().slice(-3)}`;
        const hasPayment = newPaymentsList.some(p => p.invoiceId === inv.id);
        if (!hasPayment) {
          const newPayment = {
            id: `PAY-${Date.now().toString().slice(-4)}`,
            invoiceId: inv.id,
            customerId: custId,
            customerName: inv.companyName || inv.customerName,
            amount: Number(inv.totalAmount),
            date: new Date().toISOString().split('T')[0],
            method: inv.paymentPreference === 'UPI' ? 'UPI' : (inv.paymentPreference === 'Cash' ? 'Cash' : 'UPI'),
            remarks: `Auto-recorded upon order delivery`
          };
          newPaymentsList.push(newPayment);
          paymentsChanged = true;

          triggerNotification(
            `Payment Automatically Received: Invoice ${inv.id} of ₹${Number(inv.totalAmount).toLocaleString()} marked Paid upon delivery.`,
            'success',
            'payment',
            inv.id
          );
        }
      }

      if (changed) {
        invoicesChanged = true;
        return {
          ...inv,
          status: newStatus,
          paymentStatus: newPaymentStatus,
          collectionStatus: newCollectionStatus
        };
      }
      return inv;
    });

    addedOrders.forEach(order => {
      const currentYarnRates = yarnRates.length > 0 ? yarnRates : INITIAL_YARN_RATES;
      const inv = generateInvoiceForOrder(order, currentYarnRates, updatedInvoices, customers);
      if (inv) {
        updatedInvoices.push(inv);
        invoicesChanged = true;
      }

      // Trigger notification for new order received (Instruction 8)
      triggerNotification(`New Order Received: ${order.id} for ${order.customerName} (₹${order.price})`, 'info', 'order', order.id);
    });

    setOrders(newOrders);
    localStorage.setItem('warpwrap_orders', JSON.stringify(newOrders));

    if (invoicesChanged) {
      setInvoices(updatedInvoices);
      localStorage.setItem('warpwrap_invoices', JSON.stringify(updatedInvoices));
    }

    if (paymentsChanged) {
      setPayments(newPaymentsList);
      localStorage.setItem('warpwrap_payments', JSON.stringify(newPaymentsList));
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

  const savePayments = (newPayments) => {
    setPayments(newPayments);
    localStorage.setItem('warpwrap_payments', JSON.stringify(newPayments));
  };

  const saveAdvances = (newAdvances) => {
    setAdvances(newAdvances);
    localStorage.setItem('warpwrap_advances', JSON.stringify(newAdvances));
  };

  // ── Navigation items (grouped) ──────────────
  const navGroups = [
    {
      label: 'Overview',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
      ]
    },
    {
      label: 'Production',
      items: [
        { key: 'customers', label: 'Customers', icon: <Users size={17} /> },
        { key: 'orders', label: 'Orders', icon: <FileText size={17} /> },
        { key: 'production', label: 'Production', icon: <Activity size={17} /> },
        { key: 'yarn-rates', label: 'Yarn Rate Master', icon: <Tag size={17} /> },
      ]
    },
    {
      label: 'Finance',
      items: [
        { key: 'invoices', label: 'Invoices', icon: <Receipt size={17} /> },
        { key: 'accounts-payments', label: 'Accounts & Payments', icon: <IndianRupee size={17} /> },
      ]
    },
    {
      label: 'Insights',
      items: [
        { key: 'feedback', label: 'Feedback', icon: <MessageSquare size={17} /> },
        { key: 'reports', label: 'Reports & Analytics', icon: <BarChart2 size={17} /> },
        { key: 'future', label: 'AI Assistant', icon: <Cpu size={17} /> },
      ]
    },
    {
      label: 'System',
      items: [
        { key: 'settings', label: 'Settings', icon: <SettingsIcon size={17} /> },
      ]
    },
  ];

  // flat list for backwards compat
  const navItems = navGroups.flatMap(g => g.items);

  // ── Render content ──────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            orders={orders}
            customers={customersWithLedger}
            setActiveTab={setActiveTab}
            invoices={invoices}
          />
        );
      case 'customers':
        return (
          <CustomerManager
            customers={customersWithLedger}
            saveCustomers={saveCustomers}
            orders={orders}
          />
        );
      case 'orders':
        return (
          <OrderManager
            orders={orders}
            saveOrders={saveOrders}
            customers={customersWithLedger}
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
            customers={customersWithLedger}
            payments={payments}
            savePayments={savePayments}
            triggerNotification={triggerNotification}
          />
        );
      case 'accounts-payments':
        return (
          <AccountsPayments
            customers={customersWithLedger}
            invoices={invoices}
            payments={payments}
            savePayments={savePayments}
            advances={advances}
            saveAdvances={saveAdvances}
            triggerNotification={triggerNotification}
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
            customers={customersWithLedger}
            invoices={invoices}
            payments={payments}
            advances={advances}
          />
        );
      case 'future':
        return <FutureScope />;
      case 'settings':
        return <Settings theme={theme} setTheme={setTheme} />;
      default:
        return (
          <Dashboard
            orders={orders}
            customers={customersWithLedger}
            setActiveTab={setActiveTab}
            invoices={invoices}
          />
        );
    }
  };

  // ── Derived header values ─────────────────────
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const tabLabel = (() => {
    const found = navItems.find(i => i.key === activeTab);
    return found ? found.label : activeTab;
  })();

  return (
    <div className={`app-container ${theme}`}>

      {/* ── Mobile Header ───────────────────────── */}
      <div
        className="mobile-header"
        style={{
          display: 'none',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-sidebar)',
          color: 'white',
          padding: '14px 18px',
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 60,
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            width: '30px', height: '30px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {/* woven SVG mini */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4h3v3H2zM6 4h3v3H6zM10 4h4v3h-4zM2 8h4v4H2zM8 8h2v4H8zM12 8h2v4h-2z" fill="white" opacity="0.9" />
            </svg>
          </div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', color: 'white' }}>WarpWrap</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Sidebar ─────────────────────────────── */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" opacity="0.95" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.75" />
              <rect x="15" y="1" width="4" height="5" rx="1" fill="white" opacity="0.5" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.95" />
              <rect x="15" y="8" width="4" height="5" rx="1" fill="white" opacity="0.7" />
              <rect x="1" y="15" width="5" height="4" rx="1" fill="white" opacity="0.4" />
              <rect x="8" y="15" width="5" height="4" rx="1" fill="white" opacity="0.65" />
              <rect x="15" y="15" width="4" height="4" rx="1" fill="white" opacity="0.95" />
            </svg>
          </div>
          <div className="logo-text">
            <h2>WarpWrap</h2>
            <span>Smart Production. Seamless Weaving.</span>
          </div>
        </div>

        {/* Grouped Navigation */}
        <div className="sidebar-nav">
          {navGroups.map(group => (
            <div key={group.label}>
              <div className="nav-group-label">{group.label}</div>
              {group.items.map(item => (
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
          ))}
        </div>

        {/* User Profile Block */}
        <div className="sidebar-user">
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">BR</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Babu R</div>
              <div className="sidebar-user-role">Admin</div>
            </div>
          </div>
        </div>

        <div className="sidebar-footer">© 2026 WarpWrap · Textile ERP</div>
      </div>

      {/* ── Main Viewport ────────────────────────── */}
      <div className="main-viewport" style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Top Header Bar */}
        <div className="top-header-bar" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Left: Greeting + Breadcrumb */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{greeting}</span>
              <span style={{ color: 'var(--border-strong)', fontSize: '0.72rem' }}>·</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{dateStr}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Production Overview</span>
              <span style={{ color: 'var(--border-strong)' }}>/</span>
              <strong style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 700 }}>{tabLabel}</strong>
            </div>
          </div>

          {/* Right: Notifications + Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  position: 'relative',
                  width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-main)'; }}
              >
                <Bell size={17} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span style={{
                    position: 'absolute', top: '2px', right: '2px',
                    width: '16px', height: '16px',
                    background: 'var(--danger)', color: 'white',
                    fontSize: '0.6rem', fontWeight: 700, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid var(--bg-card)'
                  }}>
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifDropdown && (
                <div
                  ref={notificationRef}
                  style={{
                    position: 'absolute', top: '44px', right: 0,
                    width: '340px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 200,
                    overflow: 'hidden',
                    animation: 'slideIn 0.2s ease'
                  }}>
                  <div style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--bg-app)'
                  }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontFamily: 'Outfit', fontWeight: 700 }}>Notifications</strong>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {notifications.filter(n => !n.read).length > 0 && (
                        <button onClick={() => {
                          const u = notifications.map(n => ({ ...n, read: true }));
                          setNotifications(u);
                          localStorage.setItem('warpwrap_notifications', JSON.stringify(u));
                        }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 600 }}>
                          Mark All Read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button onClick={() => {
                          setNotifications([]);
                          localStorage.setItem('warpwrap_notifications', JSON.stringify([]));
                        }} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 600 }}>
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id}
                        style={{
                          padding: '12px 18px',
                          borderBottom: '1px solid var(--border-color)',
                          background: n.read ? 'transparent' : 'rgba(99,102,241,0.04)',
                          display: 'flex', flexDirection: 'column', gap: '5px', cursor: 'pointer',
                          transition: 'background 0.15s'
                        }}
                        onClick={() => {
                          const u = notifications.map(notif => notif.id === n.id ? { ...notif, read: true } : notif);
                          setNotifications(u);
                          localStorage.setItem('warpwrap_notifications', JSON.stringify(u));
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                        onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(99,102,241,0.04)'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: n.read ? 400 : 600, color: 'var(--text-main)', lineHeight: 1.45, flex: 1 }}>{n.message}</span>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginTop: '2px' }}>{n.timestamp}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className={`badge ${n.type === 'success' ? 'badge-completed' :
                            n.type === 'danger' ? 'badge-delivered' :
                              n.type === 'warning' ? 'badge-started' : 'badge-received'
                            }`} style={{ fontSize: '0.62rem', padding: '2px 7px' }}>{n.type}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button onClick={e => {
                              e.stopPropagation();
                              const u = notifications.filter(notif => notif.id !== n.id);
                              setNotifications(u);
                              localStorage.setItem('warpwrap_notifications', JSON.stringify(u));
                            }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '2px', borderRadius: '4px' }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                              title="Remove"
                            >
                              <Trash2 size={12} />
                            </button>
                            {!n.read && <span className="notif-dot" />}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div style={{ padding: '28px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        <Bell size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                        No new notifications.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Avatar */}
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 800, color: 'white',
              cursor: 'pointer', flexShrink: 0,
              border: '2px solid var(--border-color)'
            }} title="Admin: Babu R">
              BR
            </div>
          </div>
        </div>

        {renderContent()}
      </div>

      {/* Mobile responsive inject */}
      <style>{`
        @media (max-width: 992px) {
          .mobile-header { display: flex !important; }
          .main-viewport { margin-top: 58px; }
        }
      `}</style>
    </div>
  );
}

export default App;
