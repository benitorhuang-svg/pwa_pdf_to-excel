import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children }) => {
  return (
    <div className="badge" style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      background: 'rgba(99, 102, 241, 0.1)',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      borderRadius: '100px',
      color: 'var(--primary-light)',
      fontSize: '0.85rem',
      fontWeight: 600,
      marginBottom: '1.5rem',
      width: 'fit-content'
    }}>
      <span className="animate-pulse-slow" style={{
        width: '8px',
        height: '8px',
        background: 'var(--primary)',
        borderRadius: '50%',
        marginRight: '8px',
        display: 'inline-block',
        boxShadow: '0 0 12px var(--primary)',
      }}></span>
      {children}
    </div>
  );
};
