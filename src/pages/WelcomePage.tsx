import React from 'react';
import { Badge } from '../components/atoms/Badge';
import { UploadCard } from '../components/organisms/UploadCard';

interface WelcomePageProps {
  onFileSelect: (file: File) => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onFileSelect }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      width: '100%',
      height: '100%'
    }}>
      <div style={{
        flex: 1.2,
        padding: '4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        background: 'linear-gradient(to right, rgba(99, 102, 241, 0.05), transparent)'
      }}>
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%', pointerEvents: 'none' }}></div>
        
        <Badge>v2.0 專業版現已上線</Badge>
        
        <div className="hero">
          <h1 style={{
            fontSize: '4rem',
            margin: 0,
            background: 'linear-gradient(to bottom right, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            letterSpacing: '-2px',
            lineHeight: 1.1
          }}>
            中國附醫<br />發票提取工具
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            marginTop: '1.5rem',
            fontSize: '1.25rem',
            fontWeight: 400,
            lineHeight: 1.6,
            maxWidth: '500px'
          }}>
            基於智慧識別技術的高效率發票數據處理系統。專為複雜的內部報表流程打造，將繁瑣的人工登帳自動化。
          </p>

          <div style={{
            marginTop: '3rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem'
          }}>
            {[
              { icon: '🔍', text: '自動定位核心數據' },
              { icon: '📅', text: '民國轉西元處理' },
              { icon: '📊', text: '按月份自動分類' },
              { icon: '📂', text: '一鍵導出 Excel' }
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-light)'
                }}>{f.icon}</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        padding: '4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--accent)', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%', pointerEvents: 'none' }}></div>
        <UploadCard onFileSelect={onFileSelect} />
      </div>
    </div>
  );
};

export default WelcomePage;
