import React from 'react';
import { ProgressBar } from '../components/atoms/ProgressBar';
import { Settings } from 'lucide-react';

interface LoadingPageProps {
  progress: number;
  statusText: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ progress, statusText }) => {
  return (
    <div style={{
      padding: '4rem',
      justifyContent: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      height: '100%'
    }}>
      <div className="rotating" style={{ fontSize: '4rem', marginBottom: '2rem' }}>
        <Settings size={80} color="var(--primary-light)" />
      </div>
      <h2 style={{ fontSize: '2rem', margin: 0, color: 'white' }}>{statusText}</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>正在逐頁定位「驗退收單號」與「應付金額」</p>

      <ProgressBar progress={progress} />
    </div>
  );
};

export default LoadingPage;
