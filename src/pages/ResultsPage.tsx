import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../components/atoms/Button';
import { StatCard } from '../components/molecules/StatCard';
import { InvoiceData } from '../types';
import { Download, ArrowLeft, FileText, CreditCard, Hash, Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { ThemeToggle } from '../components/atoms/ThemeToggle';

interface ResultsPageProps {
  data: InvoiceData[];
  totalPages: number;
  onBack: () => void;
  onExport: () => void;
  onCopy: (text: string) => void;
}

import { DEFAULT_VENDOR } from '../config/vendorConfig';

const ResultsPage: React.FC<ResultsPageProps> = ({ 
  data, 
  totalPages, 
  onBack, 
  onExport, 
  onCopy 
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [isVendorOpen, setIsVendorOpen] = useState<boolean>(true);


  const totalSum = data.reduce((acc, curr) => acc + curr.amount, 0);
  
  const groupedByMonth = useMemo(() => {
    return data.reduce((acc, item) => {
      let label = "未知日期";
      if (item.date && item.date !== "-") {
        const year = item.date.substring(0, 4);
        const month = item.date.substring(4, 6);
        label = `${year}年${month}月`;
      }
      if (!acc[label]) acc[label] = [];
      acc[label].push(item);
      return acc;
    }, {} as Record<string, InvoiceData[]>);
  }, [data]);

  const months = useMemo(() => Object.keys(groupedByMonth).sort(), [groupedByMonth]);

  useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }
  }, [months, selectedMonth]);

  const selectedData = selectedMonth ? groupedByMonth[selectedMonth] : [];
  const selectedSum = selectedData.reduce((acc, curr) => acc + curr.amount, 0);

  const generateCopyText = () => {
    let text = `${DEFAULT_VENDOR.name} ${selectedMonth} 貨款\n`;
    selectedData.forEach(item => {
      text += `${item.dn}\t${item.invoice} ${DEFAULT_VENDOR.suffix}\t${item.date}\t${item.amount}\n`;
    });
    return text;
  };

  return (
    <div style={{
      padding: '1.25rem 2rem', // Reduced top/bottom padding
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem', // Reduced gap
      height: '100%',
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* Header with Stats */}
      <div style={{
        paddingBottom: '0.75rem', // Reduced padding
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem', // Reduced gap
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, minWidth: '400px' }}>
          <ThemeToggle />
          <StatCard label="有效記錄" value={data.length} icon={<FileText size={18} />} />
          <StatCard label="總付款總計" value={`$${totalSum.toLocaleString()}`} highlight flex={1.5} minWidth="150px" icon={<CreditCard size={18} />} />
          <StatCard label="掃描頁數" value={totalPages} icon={<Hash size={18} />} />
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
        
        {/* Left: Monthly Selection (Accordion/Tabs) */}
        <div style={{ 
          flex: '0 0 280px', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'var(--card)',
          borderRadius: '12px',
          border: '1px solid var(--glass-border)',
          overflow: 'hidden'
        }}>
          {/* Accordion Header */}
          <button 
            onClick={() => setIsVendorOpen(!isVendorOpen)}
            style={{
              padding: '1rem 1.25rem',
              borderBottom: isVendorOpen ? '1px solid var(--glass-border)' : 'none',
              background: 'var(--glass-bg)',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              fontFamily: 'inherit',
              flexShrink: 0,
              width: '100%',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '4px', height: '1.25rem', background: 'var(--primary-light)', borderRadius: '4px' }} />
              {DEFAULT_VENDOR.name}
            </div>
            {isVendorOpen ? <ChevronDown size={18} color="var(--text-muted)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
          </button>
          
          {/* Accordion List - scrollable inner area */}
          {isVendorOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
              {months.map((month, index) => {
                const isSelected = selectedMonth === month;
                return (
                  <button 
                    key={month} 
                    onClick={() => setSelectedMonth(month)}
                    className="month-tab-hover"
                    style={{
                      padding: '1rem 1.25rem',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      border: 'none',
                      borderBottom: index < months.length - 1 ? '1px solid var(--glass-border)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: isSelected ? 'var(--text-main)' : 'var(--text-muted)'
                  }}
                >
                  <div style={{ textAlign: 'left', flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontWeight: isSelected ? 600 : 500, fontSize: '0.95rem', color: isSelected ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {month}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8, color: isSelected ? 'var(--primary-light)' : 'inherit' }}>
                      共 {groupedByMonth[month].length} 筆
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      flexShrink: 0
                    }} />
                  )}
                </button>
              );
            })}
          </div>
          )}
        </div>

        {/* Right: Detailed Table */}
        {/* Right: Detailed Table */}
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
          {selectedMonth && (
            <>
              {/* Table Header area with Copy Button & Subtotal */}
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
                    className="btn-copy-hover"
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--primary)',
                      border: '1px solid var(--primary-light)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Copy size={14} />
                    複製
                  </button>
                </div>
                
                <div style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>
                  本月小計: <strong style={{ color: 'var(--primary)', fontSize: '1.25rem', marginLeft: '0.2rem' }}>${selectedSum.toLocaleString()}</strong>
                </div>
              </div>

              {/* Table Data */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--glass-bg)', backdropFilter: 'blur(10px)' }}>
                    <tr>
                      <th style={thStyle}>驗退收單號</th>
                      <th style={thStyle}>發票號碼</th>
                      <th style={thStyle}>發票日期</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>付款金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedData.map((item, i) => (
                      <tr key={i} className="table-row-hover">
                        <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{item.dn}</td>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>{item.invoice}</td>
                        <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>
                          {item.date === "-" || !item.date ? (
                            <span style={{ background: '#fee2e2', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                              未偵測日期
                            </span>
                          ) : item.date}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                          {item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
      
      <style>{`
        .table-row-hover:hover td {
          background: var(--card);
        }
        .month-tab-hover:hover {
          background: var(--glass-border) !important;
          border-color: var(--primary-light) !important;
        }
        .btn-copy-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(99, 102, 241, 0.4) !important;
          filter: brightness(1.1);
        }
        .text-primary-light {
          color: var(--primary-light);
        }
      `}</style>
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

export default ResultsPage;
