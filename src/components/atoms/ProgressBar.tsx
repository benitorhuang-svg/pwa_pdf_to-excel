import React from 'react';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div style={{
      height: '14px',
      background: '#e2e8f0',
      borderRadius: '7px',
      overflow: 'hidden',
      margin: '3rem 0',
      width: '100%',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
    }}>
      <div style={{
        height: '100%',
        background: 'linear-gradient(90deg, var(--primary), #818cf8, #a78bfa)',
        backgroundSize: '200% 100%',
        width: `${progress}%`,
        borderRadius: '7px',
        transition: 'width 0.4s cubic-bezier(0.1, 0.9, 0.2, 1)',
      }}></div>
    </div>
  );
};
