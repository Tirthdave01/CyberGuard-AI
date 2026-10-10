import React from 'react';
import { Shield, Activity, Radio, AlertOctagon, Terminal, LogOut, User, LogIn } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, user, onLogout, onOpenLogin }) => {
  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <div className="brand" onClick={() => setActiveTab('dashboard')}>
          <div className="brand-icon-wrapper">
            <Shield className="brand-icon" size={24} />
            <div className="brand-pulse-ring" />
          </div>
          <div className="brand-text">
            <span className="brand-name">CyberGuard<span className="brand-accent">.AI</span></span>
            <span className="brand-sub">Next-Gen Intrusion Prevention</span>
          </div>
        </div>

        <div className="live-status-pill">
          <span className="pulse-dot" />
          <span className="status-label">System Active - Monitoring live</span>
        </div>
      </div>

      <nav className="navbar-links">
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Activity size={16} />
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'traffic' ? 'active' : ''}`}
          onClick={() => setActiveTab('traffic')}
        >
          <Radio size={16} />
          <span>Live Traffic</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'analyzer' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyzer')}
        >
          <Shield size={16} />
          <span>AI Inspector</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <AlertOctagon size={16} />
          <span>Alerts & Actions</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Terminal size={16} />
          <span>Audit Logs</span>
        </button>
      </nav>

      <div className="navbar-right">
        {user ? (
          <div className="user-profile-widget">
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className={`user-role-badge role-${user.role}`}>{user.role.toUpperCase()}</span>
            </div>
            <button className="btn-icon-logout" onClick={onLogout} title="Logout">
              <LogOut size={17} />
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onOpenLogin}>
            <LogIn size={15} />
            <span>Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
