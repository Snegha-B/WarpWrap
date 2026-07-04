import React, { useState, useEffect } from 'react';
import logo from '../assets/Logo.png';

function LoginPage({ onLogin, theme }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Trigger entrance animation after mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);

    // Simulate a brief auth delay for UX polish
    setTimeout(() => {
      if (username.trim().toLowerCase() === 'admin' && password === 'admin') {
        onLogin();
      } else {
        setLoading(false);
        setError('Invalid credentials. Try admin / admin.');
      }
    }, 900);
  };

  const isDark = theme === 'dark';

  // ── Inline style tokens (mirrors index.css variables) ──────────────────────
  const colors = isDark
    ? {
        pageBg    : 'linear-gradient(135deg, #0d0f1a 0%, #111827 50%, #0f172a 100%)',
        cardBg    : 'rgba(17, 24, 39, 0.85)',
        cardBorder: 'rgba(99, 102, 241, 0.18)',
        inputBg   : 'rgba(255,255,255,0.05)',
        inputBorder: 'rgba(255,255,255,0.12)',
        inputFocus: 'rgba(99,102,241,0.6)',
        textMain  : '#f1f5f9',
        textMuted : '#94a3b8',
        textSub   : '#64748b',
        dot       : 'rgba(99,102,241,0.25)',
        shadow    : '0 32px 96px rgba(0,0,0,0.7)',
      }
    : {
        pageBg    : 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #ede9fe 100%)',
        cardBg    : 'rgba(255,255,255,0.9)',
        cardBorder: 'rgba(99,102,241,0.15)',
        inputBg   : '#f8faff',
        inputBorder: '#e2e8f0',
        inputFocus: 'rgba(99,102,241,0.5)',
        textMain  : '#0f172a',
        textMuted : '#475569',
        textSub   : '#94a3b8',
        dot       : 'rgba(99,102,241,0.12)',
        shadow    : '0 32px 96px rgba(99,102,241,0.12)',
      };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: colors.pageBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', 'Outfit', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Decorative floating orbs ─────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        {/* Large orb – top left */}
        <div style={{
          position: 'absolute', top: '-120px', left: '-120px',
          width: '480px', height: '480px', borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }} />
        {/* Medium orb – bottom right */}
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-80px',
          width: '380px', height: '380px', borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        }} />
        {/* Small orb – top right */}
        <div style={{
          position: 'absolute', top: '10%', right: '8%',
          width: '200px', height: '200px', borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
        }} />

        {/* Dot-grid texture */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', inset: 0, opacity: isDark ? 0.3 : 0.4 }}>
          <defs>
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill={colors.dot} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Floating textile-grid decoration */}
        <svg
          style={{
            position: 'absolute', bottom: '14%', left: '5%',
            opacity: isDark ? 0.07 : 0.06,
          }}
          width="260" height="260" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          {[0,10,20,30,40,50,60,70].map(y =>
            <line key={`h${y}`} x1="0" y1={y} x2="80" y2={y} stroke="#6366f1" strokeWidth="1.2" />
          )}
          {[0,10,20,30,40,50,60,70,80].map(x =>
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="80" stroke="#6366f1" strokeWidth="1.2" />
          )}
        </svg>
      </div>

      {/* ── Login Card ───────────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          margin: '0 16px',
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '24px',
          boxShadow: colors.shadow,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding: '48px 44px 40px',
          position: 'relative',
          zIndex: 10,
          // Entrance animation via opacity + translateY
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.55s ease, transform 0.55s ease',
        }}
      >
        {/* ── Brand Header ─────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          {/* Logo — transparent background, soft glow only */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '96px', height: '96px',
            borderRadius: '24px',
            background: isDark
              ? 'rgba(99, 102, 241, 0.08)'
              : 'rgba(255, 255, 255, 0.85)',
            boxShadow: isDark
              ? '0 0 0 1px rgba(99,102,241,0.18), 0 12px 40px rgba(79,70,229,0.25)'
              : '0 0 0 1px rgba(99,102,241,0.1), 0 12px 40px rgba(79,70,229,0.12)',
            marginBottom: '18px',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}>
            <img
              src={logo}
              alt="WarpWrap"
              style={{ width: '72px', height: '72px', objectFit: 'contain' }}
            />
          </div>

          {/* App Name */}
          <h1 style={{
            margin: '0 0 6px',
            fontFamily: "'Outfit', 'Inter', sans-serif",
            fontWeight: 800,
            fontSize: '2rem',
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            WarpWrap
          </h1>

          {/* Tagline */}
          <p style={{
            margin: '0 0 6px',
            fontWeight: 600,
            fontSize: '0.88rem',
            color: colors.textMuted,
            letterSpacing: '0.01em',
          }}>
            Smart Production. Seamless Weaving.
          </p>

          {/* Subtitle */}
          <p style={{
            margin: 0,
            fontSize: '0.775rem',
            color: colors.textSub,
            lineHeight: 1.5,
          }}>
            Textile Production &amp; Customer Management System
          </p>
        </div>

        {/* ── Divider ───────────────────────────────────────────────── */}
        <div style={{
          height: '1px',
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)',
          marginBottom: '28px',
        }} />

        {/* ── Login Form ────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Username */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: colors.textMuted,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                pointerEvents: 'none', color: colors.textSub,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                id="ww-username"
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="Enter username"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px 12px 40px',
                  borderRadius: '12px',
                  border: `1.5px solid ${error ? '#ef4444' : colors.inputBorder}`,
                  background: colors.inputBg,
                  color: colors.textMain,
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = `0 0 0 3px ${colors.inputFocus}`;
                }}
                onBlur={e => {
                  e.target.style.borderColor = error ? '#ef4444' : colors.inputBorder;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: colors.textMuted,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                pointerEvents: 'none', color: colors.textSub,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="ww-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter password"
                autoComplete="off"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 44px 12px 40px',
                  borderRadius: '12px',
                  border: `1.5px solid ${error ? '#ef4444' : colors.inputBorder}`,
                  background: colors.inputBg,
                  color: colors.textMain,
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = `0 0 0 3px ${colors.inputFocus}`;
                }}
                onBlur={e => {
                  e.target.style.borderColor = error ? '#ef4444' : colors.inputBorder;
                  e.target.style.boxShadow = 'none';
                }}
              />
              {/* Show/Hide password toggle */}
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: colors.textSub, padding: '4px', display: 'flex', alignItems: 'center',
                }}
                tabIndex={-1}
                title={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '0.82rem',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '4px',
              padding: '13px 24px',
              borderRadius: '12px',
              border: 'none',
              background: loading
                ? 'rgba(99,102,241,0.6)'
                : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              letterSpacing: '0.01em',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(79,70,229,0.4)',
              transition: 'all 0.2s ease',
              transform: 'translateY(0)',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(79,70,229,0.5)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.4)';
            }}
          >
            {loading ? (
              <>
                <svg
                  width="16" height="16"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ animation: 'ww-spin 0.8s linear infinite' }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Signing in…
              </>
            ) : (
              <>
                Enter Dashboard
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* ── Demo credentials hint ─────────────────────────────────── */}
        <p style={{
          marginTop: '20px',
          marginBottom: 0,
          textAlign: 'center',
          fontSize: '0.72rem',
          color: colors.textSub,
        }}>
          Demo credentials: <span style={{ color: colors.textMuted, fontWeight: 600 }}>admin</span> /{' '}
          <span style={{ color: colors.textMuted, fontWeight: 600 }}>admin</span>
        </p>
      </div>

      {/* ── Bottom badge ─────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: '22px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease 0.4s',
      }}>
        {/* Small weave icon */}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 4h3v3H2zM6 4h3v3H6zM10 4h4v3h-4zM2 8h4v4H2zM8 8h2v4H8zM12 8h2v4h-2z"
            fill={isDark ? '#6366f1' : '#4f46e5'} opacity="0.8" />
        </svg>
        <span style={{
          fontSize: '0.72rem',
          color: colors.textSub,
          letterSpacing: '0.04em',
          fontWeight: 500,
        }}>
          Powered by <strong style={{ color: colors.textMuted, fontWeight: 700 }}>Babu Textile</strong>
          <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
          WarpWrap v2.0
        </span>
      </div>

      {/* ── Spinner keyframe ─────────────────────────────────────────── */}
      <style>{`
        @keyframes ww-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LoginPage;
