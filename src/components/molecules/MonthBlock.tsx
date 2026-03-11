import React from 'react';
import { Copy } from 'lucide-react';
import { InvoiceData } from '../../types';

interface MonthBlockProps {
  month: string;
  items: InvoiceData[];
  onCopy: (text: string) => void;
}

export const MonthBlock: React.FC<MonthBlockProps> = ({ month, items, onCopy }) => {
  const generateCopyText = () => {
    let text = `中國附醫 ${month}月 貨款\n`;
    items.forEach(item => {
      text += `${item.dn}\t${item.invoice} 中國附醫\t${item.date}\t${item.amount}\n`;
    });
    return text;
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '20px',
      border: '1px solid var(--glass-border)',
      padding: '1.5rem',
      position: 'relative'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          color: 'var(--primary-light)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>📅 {month}月份發票明細</div>
        
        <button 
          onClick={() => onCopy(generateCopyText())}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.8rem',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.2)',
            color: 'var(--primary-light)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          className="btn-copy-hover"
        >
          <Copy size={16} />
          複製報表內容
          <style>{`
            .btn-copy-hover:hover {
              background: var(--primary);
              color: white;
            }
          `}</style>
        </button>
      </div>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        已整理 {items.length} 筆資料，點擊上方按鈕可直接貼上至 Excel。
      </div>
    </div>
  );
};
