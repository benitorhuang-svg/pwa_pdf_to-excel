import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon, 
  style,
  ...props 
}) => {
  const isPrimary = variant === 'primary';
  
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    border: 'none',
    gap: '0.75rem',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    ...style
  };

  const primaryStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    color: 'white',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
  };

  const outlineStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-muted)',
    padding: '0.75rem 1.25rem',
    fontSize: '0.9rem',
  };

  const currentVariantStyle = isPrimary ? primaryStyle : outlineStyle;

  return (
    <button 
      style={{ ...baseStyle, ...currentVariantStyle }}
      className="btn-hover-effect"
      {...props}
    >
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
      <style>{`
        .btn-hover-effect:hover {
          transform: translateY(-3px);
          filter: brightness(1.1);
          box-shadow: ${isPrimary ? '0 15px 30px -5px rgba(99, 102, 241, 0.5)' : 'none'};
          border-color: ${!isPrimary ? 'var(--primary-light)' : 'transparent'};
          color: ${!isPrimary ? 'white' : 'white'};
          background: ${!isPrimary ? 'rgba(255, 255, 255, 0.05)' : ''};
        }
      `}</style>
    </button>
  );
};
