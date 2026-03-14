import React from 'react';
import { Copy as CopyIcon } from 'lucide-react';
import { InvoiceData } from '../../types';
import { VendorConfig } from '../../config/vendorConfig';
import { formatDate } from '../../utils/dataProcessor';

interface ResultsMainTableProps {
  selectedMonth: string;
  onCopy: (text: string) => void;
  generateCopyText: () => string;
  displayedData: InvoiceData[];
  selectedSum: number;
  activeVendorConfig: VendorConfig | null;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const ResultsMainTable: React.FC<ResultsMainTableProps> = ({
  selectedMonth,
  onCopy,
  generateCopyText,
  displayedData,
  selectedSum,
  activeVendorConfig,
  scrollContainerRef
}) => {
  if (!selectedMonth) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      請選擇廠商與月份
    </div>
  );

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      minWidth: 0,
      background: 'var(--card)',
      borderRadius: '16px',
      border: '1px solid var(--glass-border)',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => onCopy(generateCopyText())}
            className="btn-copy-premium"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <CopyIcon size={16} />
            快速複製
          </button>
          {displayedData.length > 0 && (
            <span style={{ 
              fontSize: '0.85rem', 
              color: 'var(--text-muted)', 
              opacity: 0.8,
              maxWidth: '300px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              檔案來源: {displayedData[0].fileName}
            </span>
          )}
        </div>
        
        <div style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>
          本月小計: <strong style={{ color: 'var(--primary)', fontSize: '1.25rem', marginLeft: '0.2rem' }}>${selectedSum.toLocaleString()}</strong>
        </div>
      </div>

      <div ref={scrollContainerRef} style={{ overflowY: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--glass-bg)', backdropFilter: 'blur(10px)' }}>
            <tr>
              <th style={thStyle}>發票日期</th>
              <th style={thStyle}>發票號碼</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>付款金額</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>處理單號</th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((item, i) => (
              <tr key={i} className="table-row-hover">
                <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>
                  {item.date === "-" || !item.date ? (
                    <span style={{ background: '#fee2e2', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                      未偵測日期
                    </span>
                  ) : formatDate(item.date)}
                </td>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{item.invoice} {activeVendorConfig?.suffix}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                  {item.amount.toLocaleString()}
                </td>
                <td style={{ ...tdStyle, fontFamily: 'monospace', textAlign: 'right', fontSize: '0.8rem', opacity: 0.8 }}>{item.dn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: '1rem 1.5rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid var(--glass-border)'
};

const tdStyle: React.CSSProperties = {
  padding: '1rem 1.5rem',
  borderBottom: '1px solid var(--glass-border)',
  color: 'var(--text-main)',
  fontSize: '0.9rem'
};
