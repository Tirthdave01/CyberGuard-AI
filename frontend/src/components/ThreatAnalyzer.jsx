import React, { useState } from 'react';
import { Shield, Cpu, AlertTriangle, CheckCircle, ArrowRight, Zap, Send } from 'lucide-react';
import { api } from '../services/api';

export const ThreatAnalyzer = ({ onPacketIngested }) => {
  const [formData, setFormData] = useState({
    source_ip: '194.26.29.112',
    destination_ip: '192.168.1.10',
    protocol: 'TCP',
    destination_port: '22',
    packet_size: '1500',
    flags: 'SYN'
  });

  const [loading, setLoading] = useState(false);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [ingestStatus, setIngestStatus] = useState(null);

  const presets = [
    {
      label: 'DDoS SYN Flood',
      data: { source_ip: '45.33.32.156', destination_ip: '192.168.1.25', protocol: 'TCP', destination_port: '80', packet_size: '65400', flags: 'SYN,ACK' }
    },
    {
      label: 'SSH Brute Force',
      data: { source_ip: '185.220.101.5', destination_ip: '192.168.1.10', protocol: 'TCP', destination_port: '22', packet_size: '1480', flags: 'SYN' }
    },
    {
      label: 'Stealth Port Scan',
      data: { source_ip: '198.51.100.77', destination_ip: '192.168.1.50', protocol: 'TCP', destination_port: '48900', packet_size: '64', flags: 'FIN,PSH' }
    },
    {
      label: 'Benign HTTPS Traffic',
      data: { source_ip: '192.168.1.105', destination_ip: '142.250.190.46', protocol: 'HTTPS', destination_port: '443', packet_size: '512', flags: 'ACK' }
    }
  ];

  const handleApplyPreset = (presetData) => {
    setFormData(presetData);
    setResult(null);
    setIngestStatus(null);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIngestStatus(null);
    try {
      const res = await api.traffic.analyzeSandbox(formData);
      if (res.success) {
        setResult(res.analysis);
      }
    } catch (err) {
      alert('Analysis failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIngestLive = async () => {
    setIngestLoading(true);
    try {
      const res = await api.traffic.sendPacket(formData);
      if (res.success) {
        setIngestStatus({
          type: 'success',
          message: res.ai_analysis.is_threat
            ? `Threat logged! Alert generated: ${res.ai_analysis.threat_type}`
            : 'Benign packet recorded to network stream.'
        });
        if (onPacketIngested) onPacketIngested();
      }
    } catch (err) {
      setIngestStatus({
        type: 'error',
        message: err.message
      });
    } finally {
      setIngestLoading(false);
    }
  };

  return (
    <div className="section-container">
      <div className="section-header-row">
        <div>
          <h2>AI Intrusion Detection Sandbox</h2>
          <p className="section-sub">
            Real-time inference engine trained on NSL-KDD & CICIDS2017 feature patterns
          </p>
        </div>
      </div>

      <div className="presets-banner">
        <span className="preset-title">Test Scenarios:</span>
        <div className="preset-buttons">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              className="btn-preset"
              onClick={() => handleApplyPreset(p.data)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="analyzer-layout">
        {/* Form Column */}
        <div className="card analyzer-form-card">
          <div className="card-header">
            <h3><Zap size={18} /> Packet Attributes</h3>
          </div>

          <form onSubmit={handleAnalyze} className="cyber-form">
            <div className="form-row-2">
              <div className="form-group">
                <label>Source IP Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 194.26.29.112"
                  value={formData.source_ip}
                  onChange={(e) => setFormData({ ...formData, source_ip: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Destination IP Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 192.168.1.10"
                  value={formData.destination_ip}
                  onChange={(e) => setFormData({ ...formData, destination_ip: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label>Protocol</label>
                <select
                  value={formData.protocol}
                  onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="HTTPS">HTTPS</option>
                  <option value="ICMP">ICMP</option>
                </select>
              </div>

              <div className="form-group">
                <label>Dest Port</label>
                <input
                  type="number"
                  required
                  value={formData.destination_port}
                  onChange={(e) => setFormData({ ...formData, destination_port: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Packet Size (Bytes)</label>
                <input
                  type="number"
                  required
                  value={formData.packet_size}
                  onChange={(e) => setFormData({ ...formData, packet_size: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>TCP Flags</label>
              <input
                type="text"
                placeholder="SYN, ACK, FIN, PSH, RST"
                value={formData.flags}
                onChange={(e) => setFormData({ ...formData, flags: e.target.value })}
              />
            </div>

            <div className="form-buttons-row">
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                <Cpu size={16} />
                <span>{loading ? 'Evaluating Model...' : 'Analyze with CyberGuard AI'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* AI Result Column */}
        <div className="card analyzer-result-card">
          <div className="card-header">
            <h3><Shield size={18} /> AI Model Inference Result</h3>
          </div>

          {!result ? (
            <div className="result-placeholder">
              <Cpu size={48} className="pulse-icon" />
              <p>Configure packet attributes and click <strong>"Analyze with CyberGuard AI"</strong> to run real-time ML threat classification.</p>
            </div>
          ) : (
            <div className="result-details">
              <div className={`result-verdict-banner sev-${result.severity.toLowerCase()}`}>
                <div className="verdict-icon">
                  {result.is_threat ? <AlertTriangle size={28} /> : <CheckCircle size={28} />}
                </div>
                <div>
                  <span className="verdict-type">{result.threat_type}</span>
                  <span className="verdict-sub">Severity: <strong>{result.severity.toUpperCase()}</strong></span>
                </div>
              </div>

              <div className="metric-gauges-grid">
                <div className="gauge-box">
                  <span className="gauge-label">Confidence Score</span>
                  <span className="gauge-value">{(result.confidence_score * 100).toFixed(0)}%</span>
                  <div className="gauge-track">
                    <div className="gauge-fill" style={{ width: `${result.confidence_score * 100}%` }} />
                  </div>
                </div>

                <div className="gauge-box">
                  <span className="gauge-label">Anomaly Risk Score</span>
                  <span className="gauge-value">{result.risk_score} / 100</span>
                  <div className="gauge-track">
                    <div
                      className="gauge-fill"
                      style={{
                        width: `${result.risk_score}%`,
                        backgroundColor: result.risk_score > 70 ? '#ff3366' : result.risk_score > 40 ? '#ff9900' : '#00ff88'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="result-info-list">
                <div className="info-item">
                  <span className="info-key">Classifier Algorithm:</span>
                  <span className="info-val">{result.algorithm_used}</span>
                </div>
                <div className="info-item">
                  <span className="info-key">Recommended Action:</span>
                  <span className="info-val text-accent">{result.recommended_action}</span>
                </div>
                <div className="info-item">
                  <span className="info-key">Inspection Timestamp:</span>
                  <span className="info-val">{new Date(result.analyzed_at).toLocaleTimeString()}</span>
                </div>
              </div>

              {ingestStatus && (
                <div className={`status-banner banner-${ingestStatus.type}`}>
                  {ingestStatus.message}
                </div>
              )}

              <button
                type="button"
                className="btn btn-secondary btn-block mt-3"
                onClick={handleIngestLive}
                disabled={ingestLoading}
              >
                <Send size={15} />
                <span>{ingestLoading ? 'Injecting...' : 'Commit Packet to Network Stream & DB'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
