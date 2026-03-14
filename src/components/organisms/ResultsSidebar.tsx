import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { VENDORS } from '../../config/vendorConfig';
import { InvoiceData } from '../../types';

interface ResultsSidebarProps {
  vendorIds: string[];
  groupedData: Record<string, Record<string, InvoiceData[]>>;
  activeVendorId: string;
  selectedMonth: string;
  isVendorOpen: Record<string, boolean>;
  onToggleVendor: (vid: string) => void;
  onSelectMonth: (vid: string, month: string) => void;
}

export const ResultsSidebar: React.FC<ResultsSidebarProps> = ({
  vendorIds,
  groupedData,
  activeVendorId,
  selectedMonth,
  isVendorOpen,
  onToggleVendor,
  onSelectMonth
}) => {
  return (
    <div style={{ 
      flex: '0 0 280px', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--card)',
      borderRadius: '12px',
      border: '1px solid var(--glass-border)',
      overflowY: 'auto'
    }}>
      {vendorIds.map(vid => {
        const vConfig = VENDORS[vid] || { name: vid };
        const months = Object.keys(groupedData[vid]).sort();
        const isOpen = isVendorOpen[vid];
        
        return (
          <div key={vid} style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <button 
              onClick={() => onToggleVendor(vid)}
              style={{
                padding: '1rem 1.25rem',
                background: 'var(--glass-bg)',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                border: 'none',
                fontFamily: 'inherit',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '4px', height: '1.25rem', background: 'var(--primary-light)', borderRadius: '4px' }} />
                {vConfig.name}
              </div>
              {isOpen ? <ChevronDown size={18} color="var(--text-muted)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
            </button>
            
            {isOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.05)' }}>
                {months.map((month) => {
                  const isSelected = activeVendorId === vid && selectedMonth === month;
                  const count = groupedData[vid][month].length;
                  return (
                    <button 
                      key={month} 
                      onClick={() => onSelectMonth(vid, month)}
                      className="month-tab-hover"
                      style={{
                        padding: '0.8rem 1.25rem 0.8rem 2.25rem',
                        background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        color: isSelected ? 'var(--text-main)' : 'var(--text-muted)'
                      }}
                    >
                      <div style={{ textAlign: 'left', flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ fontWeight: isSelected ? 600 : 500, fontSize: '0.9rem' }}>
                          {month}
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                          共 {count} 筆
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
        );
      })}
    </div>
  );
};
