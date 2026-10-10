import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald', trend }) => {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-card-header">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className={`stat-icon-box bg-${color}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-footer">
        {trend && <span className="stat-trend">{trend}</span>}
        <span className="stat-sub">{subtitle}</span>
      </div>
    </div>
  );
};
