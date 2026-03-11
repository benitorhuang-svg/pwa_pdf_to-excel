import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  flex?: number | string;
  minWidth?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  highlight = false,
  flex = 1,
  minWidth = '100px',
  icon
}) => {
  return (
    <div className="stat-card" style={{
      background: 'var(--card)',
      padding: '0.75rem 1.25rem',
      borderRadius: '20px',
      border: '1px solid var(--glass-border)',
      flex: flex as any,
      minWidth,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {icon && (
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '12px',
          background: highlight ? 'rgba(99, 102, 241, 0.1)' : 'var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: highlight ? 'var(--primary-light)' : 'var(--text-muted)'
        }}>
          {icon}
        </div>
      )}
      <div>
        <div style={{
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          marginBottom: '2px',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>{label}</div>
        <div style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: highlight ? 'var(--primary)' : 'var(--text-main)',
          fontFamily: typeof value === 'string' && value.includes('$') ? 'inherit' : 'monospace'
        }}>{value}</div>
      </div>
      
      <style>{`
        .stat-card {
          transition: transform 0.3s ease, background 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          background: var(--glass-bg) !important;
        }
      `}</style>
    </div>
  );
};
