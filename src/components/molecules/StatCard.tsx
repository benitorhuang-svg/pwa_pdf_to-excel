import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  flex?: number | string;
  minWidth?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  highlight = false,
  flex = 1,
  minWidth = '100px'
}) => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '0.6rem 1.25rem',
      borderRadius: '16px',
      border: '1px solid var(--glass-border)',
      flex: flex as any,
      minWidth
    }}>
      <div style={{
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        marginBottom: '2px'
      }}>{label}</div>
      <div style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: highlight ? 'var(--primary-light)' : 'white'
      }}>{value}</div>
    </div>
  );
};
