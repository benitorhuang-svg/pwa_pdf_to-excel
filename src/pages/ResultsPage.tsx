import React from 'react';
import { Button } from '../components/atoms/Button';
import { StatCard } from '../components/molecules/StatCard';
import { MonthBlock } from '../components/molecules/MonthBlock';
import { InvoiceData } from '../types';
import { Download, ArrowLeft } from 'lucide-react';

interface ResultsPageProps {
  data: InvoiceData[];
  totalPages: number;
  onBack: () => void;
  onExport: () => void;
  onCopy: (text: string) => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ 
  data, 
  totalPages, 
  onBack, 
  onExport, 
  onCopy 
}) => {
  const totalSum = data.reduce((acc, curr) => acc + curr.amount, 0);
  
  const groupedByMonth = data.reduce((acc, item) => {
    const month = item.date !== "-" ? item.date.substring(4, 6) : "未知";
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {} as Record<string, InvoiceData[]>);

  const months = Object.keys(groupedByMonth).sort();

  return (
    <div style={{
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      height: '100%',
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* Header with Stats */}
      <div style={{
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, minWidth: '400px' }}>
          <StatCard label="有效記錄" value={data.length} />
          <StatCard label="總付款總計" value={`$${totalSum.toLocaleString()}`} highlight flex={1.5} minWidth="120px" />
          <StatCard label="掃描頁數" value={totalPages} />
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button onClick={onExport} icon={<Download size={20} />}>
            匯出 Excel
          </Button>
          <Button onClick={onBack} variant="outline" icon={<ArrowLeft size={18} />}>
            返回
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Left: Monthly Summary */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem', 
          overflowY: 'auto',
          paddingRight: '0.5rem'
        }}>
          {months.map(month => (
            <MonthBlock 
              key={month} 
              month={month} 
              items={groupedByMonth[month]} 
              onCopy={onCopy} 
            />
          ))}
        </div>

        {/* Right: Detailed Table */}
        <div style={{ 
          flex: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          minWidth: 0,
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '16px',
          border: '1px solid var(--glass-border)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(10px)' }}>
                <tr>
                  <th style={thStyle}>驗退收單號</th>
                  <th style={thStyle}>發票號碼</th>
                  <th style={thStyle}>發票日期</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>付款金額</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={i} className="table-row-hover">
                    <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{item.dn}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{item.invoice}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>
                      {item.date === "-" ? (
                        <span style={{ background: '#fee2e2', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                          未偵測日期
                        </span>
                      ) : item.date}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: 'var(--primary-light)' }}>
                      {item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <style>{`
        .table-row-hover:hover td {
          background: rgba(255, 255, 255, 0.03);
        }
      `}</style>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: '1.25rem 1rem',
  textAlign: 'left',
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
  fontWeight: 600,
  borderBottom: '1px solid var(--glass-border)'
};

const tdStyle: React.CSSProperties = {
  padding: '1.25rem 1rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  color: '#cbd5e1'
};

export default ResultsPage;
