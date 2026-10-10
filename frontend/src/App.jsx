import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldAlert, ShieldCheck, ShieldX, Radio, Cpu, 
  Terminal, RefreshCw, Zap, Download, CheckCircle, ExternalLink 
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { StatCard } from './components/StatCard';
import { ThreatDistributionChart, SeverityBreakdownCard } from './components/Charts';
import { TrafficMonitor } from './components/TrafficMonitor';
import { ThreatAnalyzer } from './components/ThreatAnalyzer';
import { AlertManager } from './components/AlertManager';
import { SecurityLogs } from './components/SecurityLogs';
import { LoginModal } from './components/LoginModal';

export default function App() {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Application Data States
  const [stats, setStats] = useState(null);
  const [packets, setPackets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, trafficRes, alertsRes, logsRes] = await Promise.all([
        api.threats.getStats(),
        api.traffic.getTraffic(40),
        api.alerts.getAlerts(),
        api.logs.getLogs(60)
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (trafficRes.success) setPackets(trafficRes.packets);
      if (alertsRes.success) setAlerts(alertsRes.alerts);
      if (logsRes.success) setLogs(logsRes.logs);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    // Auto-refresh every 20 seconds
    const interval = setInterval(loadAllData, 20000);
    return () => clearInterval(interval);
  }, []);

  // Handlers for Traffic Actions
  const handleSimulateTraffic = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await api.traffic.simulate();
      if (res.success) {
        showToast(res.message, 'success');
        loadAllData();
      }
    } catch (err) {
      showToast('Simulation failed: ' + err.message, 'error');
    }
  };

  const handleDeletePacket = async (id) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await api.traffic.deletePacket(id);
      if (res.success) {
        setPackets((prev) => prev.filter((p) => p.id !== id));
        showToast('Packet record removed.', 'info');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Alert Actions (CRUD)
  const handleStatusChange = async (id, status) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await api.alerts.updateAlert(id, { status });
      if (res.success) {
        showToast(`Alert status updated to ${status}.`, 'success');
        loadAllData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleBlockIp = async (id) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await api.alerts.blockIp(id);
      if (res.success) {
        showToast(res.message, 'success');
        loadAllData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAlert = async (id) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await api.alerts.deleteAlert(id);
      if (res.success) {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
        showToast('Alert dismissed.', 'info');
        loadAllData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateAlert = async (alertData) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await api.alerts.createAlert(alertData);
      if (res.success) {
        showToast('Security alert logged successfully!', 'success');
        loadAllData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Audit Logs
  const handleClearLogs = async () => {
    if (!isAuthenticated || user?.role !== 'admin') {
      showToast('Admin privileges required to purge logs.', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to purge all security audit logs?')) return;
    try {
      const res = await api.logs.clearLogs();
      if (res.success) {
        setLogs([]);
        showToast(res.message, 'info');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleExportReport = () => {
    const reportData = {
      project: 'CyberGuard AI',
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      summary: stats,
      active_alerts: alerts.slice(0, 10),
      recent_threats: packets.filter((p) => p.packet_size > 30000 || p.flags?.includes('SYN')).slice(0, 10)
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberGuard_Security_Report_${Date.now()}.json`;
    a.click();
    showToast('CyberGuard AI Security Report exported.', 'success');
  };

  return (
    <div className="app-shell">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-popup toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={logout}
        onOpenLogin={() => setShowLoginModal(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-view">
            {/* Hero Welcome / System Banner */}
            <div className="system-banner">
              <div className="banner-left">
                <span className="badge-capstone">Intelligent SOC Console • v1.0</span>
                <h1>AI-Powered Threat Detection & Network Defense Console</h1>
                <p>
                  Continuous network intrusion analysis, behavioral anomaly detection, and automated threat mitigation powered by machine learning and real-time packet inspection.
                </p>
              </div>

              <div className="banner-actions">
                <button className="btn btn-primary" onClick={handleSimulateTraffic}>
                  <Zap size={16} />
                  <span>Simulate Traffic Burst</span>
                </button>
                <button className="btn btn-secondary" onClick={handleExportReport}>
                  <Download size={16} />
                  <span>Export Report</span>
                </button>
              </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="stats-grid">
              <StatCard
                title="Packets Analyzed"
                value={stats?.total_packets ?? '—'}
                subtitle="Captured in network session"
                icon={Radio}
                color="cyan"
                trend="+100% Monitored"
              />
              <StatCard
                title="Threats Flagged"
                value={stats?.total_threats ?? '—'}
                subtitle="Classified by ML Models"
                icon={ShieldAlert}
                color="rose"
                trend="AI Scanned"
              />
              <StatCard
                title="Active Alerts"
                value={stats?.active_alerts ?? '—'}
                subtitle="Requires SOC action"
                icon={Activity}
                color="amber"
                trend="Triage Pending"
              />
              <StatCard
                title="Blocked Malicious IPs"
                value={stats?.blocked_ips ?? '0'}
                subtitle="Firewall perimeter drops"
                icon={ShieldX}
                color="emerald"
                trend="Auto Mitigated"
              />
            </div>

            {/* Telemetry Visuals Grid */}
            <div className="charts-grid">
              <ThreatDistributionChart stats={stats} />
              <SeverityBreakdownCard stats={stats} />
            </div>

            {/* Quick Live Alerts Preview */}
            <div className="section-container mt-4">
              <div className="section-header-row">
                <div>
                  <h3>Priority Threat Incident Feed</h3>
                  <p className="section-sub">Latest real-time anomalies detected on interface</p>
                </div>
                <button className="link-button" onClick={() => setActiveTab('alerts')}>
                  View All Alerts ({alerts.length}) →
                </button>
              </div>

              <div className="table-card">
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Severity</th>
                        <th>Alert Description</th>
                        <th>Source IP</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.slice(0, 4).map((alt) => (
                        <tr key={alt.id}>
                          <td><code className="code-id">{alt.id}</code></td>
                          <td>
                            <span className={`badge-sev sev-${alt.severity.toLowerCase()}`}>
                              {alt.severity}
                            </span>
                          </td>
                          <td className="alert-message-text">{alt.alert_message}</td>
                          <td><span className="ip-text">{alt.source_ip}</span></td>
                          <td>
                            <span className={`status-pill status-${alt.status.toLowerCase()}`}>
                              {alt.status}
                            </span>
                          </td>
                          <td>
                            {alt.status !== 'Resolved' && (
                              <button
                                className="btn btn-danger btn-xs"
                                onClick={() => handleBlockIp(alt.id)}
                              >
                                Block IP
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'traffic' && (
          <TrafficMonitor
            packets={packets}
            onRefresh={loadAllData}
            onSimulate={handleSimulateTraffic}
            onDelete={handleDeletePacket}
            loading={loading}
          />
        )}

        {activeTab === 'analyzer' && (
          <ThreatAnalyzer onPacketIngested={loadAllData} />
        )}

        {activeTab === 'alerts' && (
          <AlertManager
            alerts={alerts}
            onStatusChange={handleStatusChange}
            onBlockIp={handleBlockIp}
            onDeleteAlert={handleDeleteAlert}
            onCreateAlert={handleCreateAlert}
            loading={loading}
          />
        )}

        {activeTab === 'logs' && (
          <SecurityLogs
            logs={logs}
            onRefresh={loadAllData}
            onClearLogs={handleClearLogs}
            user={user}
            loading={loading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="footer-bar">
        <div className="footer-left">
          <span>CyberGuard AI • Next-Gen Intrusion Detection & Threat Prevention Platform</span>
          <span className="dot-divider">•</span>
          <span>Real-Time Security Intelligence</span>
        </div>
        <div className="footer-right">
          <span>© 2026 CyberGuard AI. All rights reserved.</span>
        </div>
      </footer>

      {/* Login & Register Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
