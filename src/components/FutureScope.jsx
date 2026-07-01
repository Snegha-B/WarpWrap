import React from 'react';
import { Sparkles, Brain, Clock, AlertTriangle, TrendingUp, Cpu, Gauge } from 'lucide-react';

function FutureScope() {
  const AI_FEATURES = [
    {
      id: "ai-1",
      icon: <Brain size={24} />,
      title: "Machine Learning Completion Prediction",
      desc: "Upgrading the rule-based counts to a Deep Neural Network trained on historical warping speeds, machine models, yarn materials, and operator efficiency levels. This will forecast delivery times with 98% accuracy.",
      status: "Planned (Next Phase)",
      tech: "TensorFlow Lite + Python microservice"
    },
    {
      id: "ai-2",
      icon: <AlertTriangle size={24} />,
      title: "AI-Powered Delay Risk Alerts",
      desc: "Integrating predictive models that monitor live traffic, shipping lane delays, power outages, and humidity levels inside the warping facility. It proactively flags delay risk 3 days in advance and triggers SMS alerts.",
      status: "Research Phase",
      tech: "XGBoost Classifier + Webhooks"
    },
    {
      id: "ai-3",
      icon: <TrendingUp size={24} />,
      title: "Intelligent Workload Forecasting",
      desc: "Analyzing historical warp demand trends to forecast peak periods (e.g. wedding seasons, festive textile surges). Provides recommendation alerts to scale staffing levels and yarn inventory proactive buffer stocks.",
      status: "Under Design",
      tech: "Prophet Time-Series Modeling"
    },
    {
      id: "ai-4",
      icon: <Cpu size={24} />,
      title: "Customer Behavior & Order Analysis",
      desc: "Profiling warping businesses to predict order frequency, favorite thread types, and transport habits. Enables smart promotional discounts and customized yarns stocking recommendations for repeat clients.",
      status: "Drafting Specs",
      tech: "K-Means Clustering + Cohort Analysis"
    },
    {
      id: "ai-5",
      icon: <Gauge size={24} />,
      title: "Production Optimization Engine",
      desc: "A genetic scheduling algorithm that re-orders the active warp runs queue to group identical thread types and border widths together. This minimizes machine reset calibration times and yarn waste by 18%.",
      status: "Planned (Next Phase)",
      tech: "Genetic Solvers + React-Worker"
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="section-header">
        <div className="header-title">
          <h1>Future AI Capabilities</h1>
          <p>Explore the conceptual artificial intelligence roadmap designed to scale textile operations.</p>
        </div>
      </div>

      {/* Info Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #3b0764)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        color: 'white',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow lights */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '180px',
          height: '180px',
          background: 'rgba(168, 85, 247, 0.3)',
          filter: 'blur(60px)',
          borderRadius: '50%'
        }} />
        
        <div style={{
          backgroundColor: 'rgba(168, 85, 247, 0.15)',
          color: '#c084fc',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(168, 85, 247, 0.2)'
        }}>
          <Sparkles size={36} />
        </div>
        
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 600, color: 'white', marginBottom: '8px' }}>
            Vision: Machine Intelligence in Textile Warping
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#e9d5ff', lineHeight: '1.6', maxWidth: '800px' }}>
            While our current prototype uses high-fidelity, rule-based algorithms to estimate production schedules and delay flags, 
            the production version of WarpWrap is built to accommodate deep machine learning. The roadmap below highlights key integrations 
            intended for the next phase of deployment.
          </p>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="future-scope-grid">
        {AI_FEATURES.map(feat => (
          <div key={feat.id} className="future-card">
            <div className="future-icon-wrapper">
              {feat.icon}
            </div>
            
            <h3 className="future-title">{feat.title}</h3>
            
            <p className="future-desc">{feat.desc}</p>
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <span className="future-tag" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', borderColor: '#d8b4fe' }}>
                {feat.status}
              </span>
              <span className="future-tag" style={{ backgroundColor: 'var(--border-color)', color: '#475569', borderColor: '#cbd5e1' }}>
                {feat.tech}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FutureScope;
