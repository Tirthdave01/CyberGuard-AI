import React, { useState } from 'react';
import { Radio, RefreshCw, Zap, Trash2, ArrowRight } from 'lucide-react';

export const TrafficMonitor = ({ packets, onRefresh, onSimulate, onDelete, loading }) => {
  const [protocolFilter, setProtocolFilter] = useState('ALL');

  const filteredPackets = protocolFilter === 'ALL'
    ? packets
    : packets.filter((p) => p.protocol.toUpperCase() === protocolFilter);

  return (
    <div className="section-container">
      <div className="section-header-row">
        <div>
          <h2>Live Network Packet Stream</h2>
          <p className="section-sub">Real-time packet inspection (Conforms to DD-Network_Traffic)</p>
        </div>

        <div className="section-actions">
          <div className="filter-group">
            <span className="filter-label">Protocol:</span>
            {['ALL', 'TCP', 'UDP', 'HTTPS'].map((proto) => (
              <button
                key={proto}
                className={`btn-pill ${protocolFilter === proto ? 'active' : ''}`}
                onClick={() => setProtocolFilter(proto)}
              >
                {proto}
              </button>
            ))}
          </div>

          <button className="btn btn-secondary" onClick={onRefresh} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button className="btn btn-primary" onClick={onSimulate} disabled={loading}>
            <Zap size={15} />
            <span>Simulate Traffic Burst</span>
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Source IP : Port</th>
                <th></th>
                <th>Destination IP : Port</th>
                <th>Protocol</th>
                <th>Packet Size</th>
                <th>Flags</th>
                <th>Timestamp</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackets.length === 0 ? (
                <tr>
                  <td colSpan="9" className="table-empty">
                    No network packets detected matching filters. Click "Simulate Traffic Burst" to generate stream.
                  </td>
                </tr>
              ) : (
                filteredPackets.map((pkt) => (
                  <tr key={pkt.id} className="packet-row">
                    <td>
                      <code className="code-id">{pkt.id}</code>
                    </td>
                    <td>
                      <span className="ip-text">{pkt.source_ip}</span>
                      <span className="port-tag">:{pkt.source_port}</span>
                    </td>
                    <td className="arrow-cell">
                      <ArrowRight size={14} className="traffic-arrow" />
                    </td>
                    <td>
                      <span className="ip-text">{pkt.destination_ip}</span>
                      <span className="port-tag">:{pkt.destination_port}</span>
                    </td>
                    <td>
                      <span className={`badge-proto proto-${pkt.protocol.toLowerCase()}`}>
                        {pkt.protocol}
                      </span>
                    </td>
                    <td>
                      <span className={pkt.packet_size > 30000 ? 'text-danger font-bold' : ''}>
                        {pkt.packet_size.toLocaleString()} B
                      </span>
                    </td>
                    <td>
                      <code className="code-flag">{pkt.flags || 'NONE'}</code>
                    </td>
                    <td className="timestamp-cell">
                      {new Date(pkt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td>
                      <button
                        className="btn-icon-danger"
                        onClick={() => onDelete(pkt.id)}
                        title="Delete Packet Record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Displaying {filteredPackets.length} of {packets.length} captured packets</span>
        </div>
      </div>
    </div>
  );
};
