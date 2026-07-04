import { useState, useEffect } from 'react';
import {
  Building, FileText, Bell, Sun, Database, Users, Shield,
  Upload, Download, Plus, Trash2, ShieldAlert, CheckCircle, Save
} from 'lucide-react';

function Settings({ theme, setTheme }) {
  const [activeTab, setActiveTab] = useState('company');
  const [successMsg, setSuccessMsg] = useState('');

  // ─────────────────────────────────────────────
  // 1. Company Profile State
  // ─────────────────────────────────────────────
  const [company, setCompany] = useState(() => {
    const stored = localStorage.getItem('warpwrap_settings_company');
    return stored ? JSON.parse(stored) : {
      name: 'Babu Textile Industries',
      owner: 'Babu',
      address: 'Narasimhaswamy Layout, Laggere, Banglore 560058',
      phone: '7019655290',
      logo: ''
    };
  });

  const handleCompanySave = (e) => {
    e.preventDefault();
    localStorage.setItem('warpwrap_settings_company', JSON.stringify(company));
    triggerSuccess('Company Profile updated successfully.');
  };

  // ─────────────────────────────────────────────
  // 2. Invoice Settings State
  // ─────────────────────────────────────────────
  const [invoiceSettings, setInvoiceSettings] = useState(() => {
    const stored = localStorage.getItem('warpwrap_settings_invoice');
    return stored ? JSON.parse(stored) : {
      prefix: 'INV-',
      terms: '1. Payment is due within 15 days of invoice date.\n2. Interest will be charged at 12% per annum on overdue amounts.\n3. Goods once sold will not be taken back.',
      notes: 'Thank you for choosing Babu Textile Industries for your warping needs.'
    };
  });

  const handleInvoiceSave = (e) => {
    e.preventDefault();
    localStorage.setItem('warpwrap_settings_invoice', JSON.stringify(invoiceSettings));
    triggerSuccess('Invoice Settings saved.');
  };

  // ─────────────────────────────────────────────
  // 3. Notification Settings State
  // ─────────────────────────────────────────────
  const [notifSettings, setNotifSettings] = useState(() => {
    const stored = localStorage.getItem('warpwrap_settings_notifications');
    return stored ? JSON.parse(stored) : {
      enabled: true,
      sound: false,
      delayAlerts: true,
      collectionReminder: true
    };
  });

  const handleNotifSave = (e) => {
    e.preventDefault();
    localStorage.setItem('warpwrap_settings_notifications', JSON.stringify(notifSettings));
    triggerSuccess('Notification Preferences updated.');
  };

  // ─────────────────────────────────────────────
  // 4. Backup & Restore Logic
  // ─────────────────────────────────────────────
  const handleExportData = () => {
    const backup = {};
    const keys = [
      'warpwrap_customers', 'warpwrap_orders', 'warpwrap_feedback',
      'warpwrap_yarn_rates', 'warpwrap_invoices', 'warpwrap_payments',
      'warpwrap_advances', 'warpwrap_notifications', 'warpwrap_theme',
      'warpwrap_settings_company', 'warpwrap_settings_invoice',
      'warpwrap_settings_notifications', 'warpwrap_settings_users'
    ];
    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val !== null) backup[k] = val;
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `warpwrap_backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
    triggerSuccess('Backup file generated and downloaded.');
  };

  const handleImportData = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        let restoredCount = 0;
        Object.keys(parsed).forEach(k => {
          if (k.startsWith('warpwrap_')) {
            localStorage.setItem(k, parsed[k]);
            restoredCount++;
          }
        });

        if (restoredCount > 0) {
          alert('Data restored successfully! The page will now reload.');
          window.location.reload();
        } else {
          alert('No valid WarpWrap keys found in this backup file.');
        }
      } catch (err) {
        alert('Invalid file format. Please upload a valid WarpWrap backup JSON file.');
      }
    };
    fileReader.readAsText(file);
  };

  // ─────────────────────────────────────────────
  // 5. User Management State
  // ─────────────────────────────────────────────
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem('warpwrap_settings_users');
    return stored ? JSON.parse(stored) : [
      { id: "USR-001", name: "Magesh Kumar", role: "Super Admin", email: "magesh@warpwrap.com", permissions: { orders: true, invoices: true, settings: true } },
      { id: "USR-002", name: "Ramesh Chandran", role: "Operator Manager", email: "ramesh@warpwrap.com", permissions: { orders: true, invoices: false, settings: false } }
    ];
  });

  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Operator Manager');
  const [newUserEmail, setNewUserEmail] = useState('');

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert('Please fill out all user fields.');
      return;
    }
    const newUser = {
      id: `USR-${Date.now().toString().slice(-3)}`,
      name: newUserName.trim(),
      role: newUserRole,
      email: newUserEmail.trim(),
      permissions: {
        orders: true,
        invoices: newUserRole === 'Super Admin' || newUserRole === 'Billing Admin',
        settings: newUserRole === 'Super Admin'
      }
    };
    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem('warpwrap_settings_users', JSON.stringify(updated));
    setNewUserName('');
    setNewUserEmail('');
    triggerSuccess('New administrator added successfully.');
  };

  const handleDeleteUser = (id) => {
    if (users.length <= 1) {
      alert('Cannot delete the last admin user.');
      return;
    }
    if (window.confirm('Are you sure you want to remove this administrator?')) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      localStorage.setItem('warpwrap_settings_users', JSON.stringify(updated));
      triggerSuccess('User removed.');
    }
  };

  const togglePermission = (userId, field) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          permissions: {
            ...u.permissions,
            [field]: !u.permissions[field]
          }
        };
      }
      return u;
    });
    setUsers(updated);
    localStorage.setItem('warpwrap_settings_users', JSON.stringify(updated));
    triggerSuccess('Permission flags updated.');
  };

  // Helper
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const subNavItems = [
    { key: 'company', label: 'Company Profile', icon: <Building size={16} /> },
    { key: 'invoice', label: 'Invoice Rules', icon: <FileText size={16} /> },
    { key: 'notifications', label: 'Alert Settings', icon: <Bell size={16} /> },
    { key: 'theme', label: 'Theme Styling', icon: <Sun size={16} /> },
    { key: 'backup', label: 'Backup & Restore', icon: <Database size={16} /> },
    { key: 'users', label: 'User Operations', icon: <Users size={16} /> },
  ];

  return (
    <div>
      {/* Header */}
      <div className="section-header">
        <div className="header-title">
          <h1>System Settings</h1>
          <p>Configure company credentials, billing parameters, UI styling, and backup operations.</p>
        </div>
      </div>

      {/* Save Success Alert Banner */}
      {successMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)',
          padding: '12px 20px', borderRadius: 'var(--radius-md)',
          color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600,
          marginBottom: '20px', animation: 'fadeIn 0.2s'
        }}>
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      {/* Main Settings Split Frame */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '28px', alignItems: 'start' }}>

        {/* Left Side Sub Nav */}
        <div className="card" style={{ padding: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {subNavItems.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '10px 14px', border: 'none',
                  borderRadius: 'var(--radius-sm)', background: activeTab === item.key ? 'rgba(99,102,241,0.08)' : 'none',
                  color: activeTab === item.key ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: activeTab === item.key ? 700 : 500, fontSize: '0.84rem',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="card" style={{ padding: '24px' }}>

          {/* Tab 1: Company Profile */}
          {activeTab === 'company' && (
            <form onSubmit={handleCompanySave}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--text-main)' }}>Company profile configuration</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={company.name}
                    onChange={e => setCompany({ ...company, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Owner Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={company.owner}
                    onChange={e => setCompany({ ...company, owner: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={company.phone}
                    onChange={e => setCompany({ ...company, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GSTIN Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={company.gst}
                    onChange={e => setCompany({ ...company, gst: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Official Address</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: '60px', resize: 'vertical' }}
                    value={company.address}
                    onChange={e => setCompany({ ...company, address: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Upload Company Logo</label>
                  <div style={{ border: '2px dashed var(--border-color)', padding: '20px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-app)' }}>
                    <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                    <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Drag and drop or click to upload PNG/JPG logo (Max 2MB)</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={14} /> Save Profile
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Invoice Settings */}
          {activeTab === 'invoice' && (
            <form onSubmit={handleInvoiceSave}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--text-main)' }}>Billing &amp; Invoice Calculations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ maxWidth: '280px' }}>
                  <label className="form-label">Default Invoice Prefix</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.prefix}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, prefix: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Terms &amp; Conditions</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: '100px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
                    value={invoiceSettings.terms}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, terms: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Default Notes</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: '60px', resize: 'vertical' }}
                    value={invoiceSettings.notes}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, notes: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={14} /> Save Invoice Settings
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Notification Settings */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleNotifSave}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--text-main)' }}>Alert Trigger Configurations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-main)' }}>Enable System Notifications</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Generate alert entries in the header bell dropdown.</span>
                  </div>
                  <input
                    type="checkbox"
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    checked={notifSettings.enabled}
                    onChange={e => setNotifSettings({ ...notifSettings, enabled: e.target.checked })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: notifSettings.enabled ? 1 : 0.5 }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-main)' }}>Enable Notification Audio Sound</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Trigger audio sound on receiving delay warnings.</span>
                  </div>
                  <input
                    type="checkbox"
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    disabled={!notifSettings.enabled}
                    checked={notifSettings.sound}
                    onChange={e => setNotifSettings({ ...notifSettings, sound: e.target.checked })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: notifSettings.enabled ? 1 : 0.5 }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-main)' }}>Production Delay Warning Reminders</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Proactively flags delay risks when progress falls behind.</span>
                  </div>
                  <input
                    type="checkbox"
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    disabled={!notifSettings.enabled}
                    checked={notifSettings.delayAlerts}
                    onChange={e => setNotifSettings({ ...notifSettings, delayAlerts: e.target.checked })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: notifSettings.enabled ? 1 : 0.5 }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-main)' }}>Ready for Collection Alert Logs</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Notify immediately when order finishes warping run.</span>
                  </div>
                  <input
                    type="checkbox"
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    disabled={!notifSettings.enabled}
                    checked={notifSettings.collectionReminder}
                    onChange={e => setNotifSettings({ ...notifSettings, collectionReminder: e.target.checked })}
                  />
                </div>
              </div>

              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={14} /> Save Preferences
                </button>
              </div>
            </form>
          )}

          {/* Tab 4: Theme Settings */}
          {activeTab === 'theme' && (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--text-main)' }}>Theme Styles Selector</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { key: 'light', label: 'Light Mode Styling', desc: 'Standard clean light background for bright setups.' },
                  { key: 'dark', label: 'Dark Mode Space', desc: 'Deep color palettes for low light environments.' },
                ].map(opt => (
                  <div
                    key={opt.key}
                    onClick={() => {
                      if (opt.key === 'system') {
                        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                        setTheme(prefersDark ? 'dark' : 'light');
                      } else {
                        setTheme(opt.key);
                      }
                    }}
                    style={{
                      border: '1px solid var(--border-color)', padding: '14px 18px', borderRadius: '8px',
                      cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyItems: 'space-between',
                      background: (theme === opt.key || (opt.key === 'system' && localStorage.getItem("warpwrap_theme") === 'system')) ? 'rgba(99,102,241,0.06)' : 'none',
                      borderColor: (theme === opt.key || (opt.key === 'system' && localStorage.getItem("warpwrap_theme") === 'system')) ? 'var(--primary)' : 'var(--border-color)',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-main)' }}>{opt.label}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{opt.desc}</span>
                    </div>
                    <input
                      type="radio"
                      name="theme"
                      style={{ cursor: 'pointer' }}
                      checked={theme === opt.key || (opt.key === 'system' && localStorage.getItem("warpwrap_theme") === 'system')}
                      readOnly
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Backup & Restore */}
          {activeTab === 'backup' && (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--text-main)' }}>System Backup &amp; Recovery Data Exporter</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>Export Database Backup</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>Download a complete snapshot of warping runs, customer histories, and configurations in a single JSON backup file.</p>
                  <button className="btn btn-primary" onClick={handleExportData} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={14} /> Download Backup (.json)
                  </button>
                </div>

                <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>Import Database Backup</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>Upload a previously exported JSON backup file. WARNING: This will overwrite all your current local client data and orders.</p>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      style={{
                        position: 'absolute', left: 0, top: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer'
                      }}
                    />
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: 'none' }}>
                      <Upload size={14} /> Upload Backup File
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 6: User Management */}
          {activeTab === 'users' && (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--text-main)' }}>Administrator User Roles</h3>

              {/* Users list table */}
              <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '24px' }}>
                <table className="table">
                  <thead>
                    <tr style={{ background: 'var(--bg-app)' }}>
                      <th>Full Name</th>
                      <th>Email ID</th>
                      <th>Role Profile</th>
                      <th style={{ textAlign: 'center' }}>Orders Perm</th>
                      <th style={{ textAlign: 'center' }}>Invoices Perm</th>
                      <th style={{ textAlign: 'center' }}>Settings Perm</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'Super Admin' ? 'badge-completed' : 'badge-inprogress'}`} style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            style={{ cursor: 'pointer' }}
                            checked={u.permissions.orders}
                            onChange={() => togglePermission(u.id, 'orders')}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            style={{ cursor: 'pointer' }}
                            checked={u.permissions.invoices}
                            onChange={() => togglePermission(u.id, 'invoices')}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            style={{ cursor: 'pointer' }}
                            checked={u.permissions.settings}
                            onChange={() => togglePermission(u.id, 'settings')}
                          />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary btn-sm btn-icon"
                            style={{ color: 'var(--danger)' }}
                            disabled={users.length <= 1}
                            onClick={() => handleDeleteUser(u.id)}
                            title="Delete administrator"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add User form */}
              <form onSubmit={handleAddUser} style={{ background: 'var(--bg-app)', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 14px 0' }}>Register New Administrator</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newUserName}
                      onChange={e => setNewUserName(e.target.value)}
                      placeholder="e.g. Anand Kumar"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email ID</label>
                    <input
                      type="email"
                      className="form-input"
                      value={newUserEmail}
                      onChange={e => setNewUserEmail(e.target.value)}
                      placeholder="anand@warpwrap.com"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Role Access</label>
                    <select
                      className="form-input"
                      value={newUserRole}
                      onChange={e => setNewUserRole(e.target.value)}
                    >
                      <option value="Super Admin">Super Admin (All Perms)</option>
                      <option value="Operator Manager">Operator Manager (Orders only)</option>
                      <option value="Billing Admin">Billing Admin (Orders + Invoices)</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={14} /> Add Administrator
                  </button>
                </div>
              </form>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Settings;
