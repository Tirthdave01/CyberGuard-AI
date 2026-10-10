import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, CheckCircle2, Clock, Trash2, ShieldX, Plus, X } from 'lucide-react';

export const AlertManager = ({ alerts, onStatusChange, onBlockIp, onDeleteAlert, onCreateAlert, loading }) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);

  // New alert form state
  const [formAlert, setFormAlert] = useState({
    alert_message: '',
    severity: 'High',
    source_ip: '198.51.100.99'
  });

  const filteredAlerts = alerts.filter((a) => {
    const matchesStatus = statusFilter === 'ALL' || a.status.toUpperCase() === statusFilter.toUpperCase();
    const matchesSeverity = severityFilter === 'ALL' || a.severity.toUpperCase() === severityFilter.toUpperCase();
    return matchesStatus && matchesSeverity;
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formAlert.alert_message.trim()) return;
    await onCreateAlert(formAlert);
    setFormAlert({ alert_message: '', severity: 'High', source_ip: '198.51.100.99' });
    setShowModal(false);
  };

  return (
    <div className="section-container">
      <div className="section-header-row">
        <div>
          <h2>Incident & Alert Management</h2>
          <p className="section-sub">Full CRUD Incident Triage & Automated Defense (Conforms to DD-Alerts)</p>
        </div>

        <div className="section-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Create Alert</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="filters-toolbar">
        <div className="filter-group">
          <span className="filter-label">Status:</span>
          {['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'].map((st) => (
            <button
              key={st}
              className={`btn-pill ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <span className="filter-label">Severity:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              className={`btn-pill ${severityFilter === sev ? 'active' : ''}`}
              onClick={() => setSeverityFilter(sev)}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Severity</th>
                <th>Alert Message & Target</th>
                <th>Source IP</th>
                <th>Status</th>
                <th>Created</th>
                <th>Response Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">
                    No security alerts found matching selected criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alt) => (
                  <tr key={alt.id} className={`alert-row status-${alt.status.toLowerCase()}`}>
                    <td>
                      <code className="code-id">{alt.id}</code>
                    </td>
                    <td>
                      <span className={`badge-sev sev-${alt.severity.toLowerCase()}`}>
                        {alt.severity}
                      </span>
                    </td>
                    <td>
                      <div className="alert-message-text">{alt.alert_message}</div>
                      {alt.recommended_action && (
                        <div className="alert-recommendation">
                          AI Advice: {alt.recommended_action}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="ip-text">{alt.source_ip || 'Internal'}</span>
                    </td>
                    <td>
                      <select
                        className={`status-select status-val-${alt.status.toLowerCase()}`}
                        value={alt.status}
                        onChange={(e) => onStatusChange(alt.id, e.target.value)}
                      >
                        <option value="Open">Open</option>
                        <option value="Investigating">Investigating</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="timestamp-cell">
                      {new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        {alt.source_ip && alt.status !== 'Resolved' && (
                          <button
                            className="btn btn-danger btn-xs"
                            onClick={() => onBlockIp(alt.id)}
                            title="Block Source IP at Firewall"
                          >
                            <ShieldX size={13} />
                            <span>Block IP</span>
                          </button>
                        )}
                        <button
                          className="btn-icon-danger"
                          onClick={() => onDeleteAlert(alt.id)}
                          title="Delete / Dismiss Alert"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Total Alerts: {filteredAlerts.length}</span>
        </div>
      </div>

      {/* Create Manual Alert Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><AlertOctagon size={18} /> Log Manual Security Incident</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="modal-form">
              <div className="form-group">
                <label>Alert Description / Anomaly Details</label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Unusual traffic surge detected targeting internal DNS cache..."
                  value={formAlert.alert_message}
                  onChange={(e) => setFormAlert({ ...formAlert, alert_message: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Severity Level</label>
                  <select
                    value={formAlert.severity}
                    onChange={(e) => setFormAlert({ ...formAlert, severity: e.target.value })}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Suspicious Source IP</label>
                  <input
                    type="text"
                    placeholder="198.51.100.99"
                    value={formAlert.source_ip}
                    onChange={(e) => setFormAlert({ ...formAlert, source_ip: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Incident Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
