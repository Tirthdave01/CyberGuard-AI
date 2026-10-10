import React, { useState } from 'react';
import { Terminal, Search, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';

export const SecurityLogs = ({ logs, onRefresh, onClearLogs, user, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter((log) => {
    const text = `${log.action} ${log.description} ${log.user} ${log.ip_address}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const getActionBadgeColor = (action = '') => {
    if (action.includes('BLOCK') || action.includes('FAILURE')) return 'sev-critical';
    if (action.includes('ALERT') || action.includes('THREAT')) return 'sev-high';
    if (action.includes('REGISTER') || action.includes('SIMULATION')) return 'sev-medium';
    return 'sev-low';
  };

  return (
    <div className="section-container">
      <div className="section-header-row">
        <div>
          <h2>Security Audit & Incident Logs</h2>
          <p className="section-sub">Tamper-evident audit trail conforming to DD-Security_Logs</p>
        </div>

        <div className="section-actions">
          <div className="search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="btn btn-secondary" onClick={onRefresh} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          {user?.role === 'admin' && (
            <button className="btn btn-danger btn-sm" onClick={onClearLogs}>
              <Trash2 size={15} />
              <span>Purge Audit Logs</span>
            </button>
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Operator / User</th>
                <th>Action Identifier</th>
                <th>Event Description</th>
                <th>Origin IP</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty">
                    No security events found matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="log-row">
                    <td>
                      <code className="code-id">{log.id}</code>
                    </td>
                    <td>
                      <span className="log-user">{log.user}</span>
                    </td>
                    <td>
                      <span className={`badge-action ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className="log-desc">{log.description}</span>
                    </td>
                    <td>
                      <span className="ip-text">{log.ip_address}</span>
                    </td>
                    <td className="timestamp-cell">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Displaying {filteredLogs.length} audit records</span>
        </div>
      </div>
    </div>
  );
};
