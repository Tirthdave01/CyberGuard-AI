import React from 'react';
import { ShieldCheck, Cpu, Database, AlertTriangle } from 'lucide-react';

export const ThreatDistributionChart = ({ stats }) => {
  const threatsByType = stats?.threats_by_type || {};
  const total = stats?.total_threats || 1;

  const threatColors = {
    'DDoS (SYN / Volumetric Flood)': '#ff3366',
    'SSH Brute Force Attack': '#ff9900',
    'Stealth Port Scanning / Recon Probe': '#00e5ff',
    'Malicious Web Exploit / Injection Payload': '#a855f7',
    'UDP Reflection / Botnet Amplification': '#ec4899',
    'RDP Exploit Attempt': '#f59e0b',
    'Benign / Legitimate Traffic': '#00ff88'
  };

  const threatKeys = Object.keys(threatsByType);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3>Threat Category Distribution</h3>
          <p className="chart-sub">Classified via Multi-Layer AI Ensembles (NSL-KDD / CICIDS2017)</p>
        </div>
      </div>

      <div className="threat-bars-list">
        {threatKeys.length === 0 ? (
          <p className="empty-chart-text">No threat categories logged yet.</p>
        ) : (
          threatKeys.map((type) => {
            const count = threatsByType[type];
            const pct = Math.round((count / total) * 100);
            const color = threatColors[type] || '#3b82f6';

            return (
              <div key={type} className="threat-bar-item">
                <div className="threat-bar-label-row">
                  <span className="threat-bar-name">{type}</span>
                  <span className="threat-bar-count">
                    <strong>{count}</strong> ({pct}%)
                  </span>
                </div>
                <div className="threat-progress-track">
                  <div
                    className="threat-progress-fill"
                    style={{ width: `${Math.max(pct, 5)}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const SeverityBreakdownCard = ({ stats }) => {
  const severity = stats?.severity_breakdown || { Critical: 0, High: 0, Medium: 0, Low: 0 };
  const total = (severity.Critical + severity.High + severity.Medium + severity.Low) || 1;

  const items = [
    { label: 'Critical', count: severity.Critical, color: 'critical', pct: Math.round((severity.Critical / total) * 100) },
    { label: 'High', count: severity.High, color: 'high', pct: Math.round((severity.High / total) * 100) },
    { label: 'Medium', count: severity.Medium, color: 'medium', pct: Math.round((severity.Medium / total) * 100) },
    { label: 'Low', count: severity.Low, color: 'low', pct: Math.round((severity.Low / total) * 100) },
  ];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3>Incident Severity Levels</h3>
          <p className="chart-sub">Real-Time Threat Triage Matrix</p>
        </div>
      </div>

      <div className="severity-grid">
        {items.map((item) => (
          <div key={item.label} className={`severity-box sev-${item.color}`}>
            <span className="sev-title">{item.label}</span>
            <span className="sev-count">{item.count}</span>
            <div className="sev-mini-bar">
              <div className="sev-mini-fill" style={{ width: `${item.pct}%` }} />
            </div>
            <span className="sev-pct">{item.pct}% of threats</span>
          </div>
        ))}
      </div>

      <div className="ai-metadata-footer">
        <div className="meta-badge"><Cpu size={14} /> Model: Random Forest + DNN</div>
        <div className="meta-badge"><Database size={14} /> Datasets: NSL-KDD / CICIDS2017</div>
        <div className="meta-badge"><ShieldCheck size={14} /> Accuracy: 98.4%</div>
      </div>
    </div>
  );
};
