import React from 'react';
import { Download, ArrowLeft, FileText, CreditCard, Hash } from 'lucide-react';
import { Button } from '../atoms/Button';
import { StatCard } from '../molecules/StatCard';
import { ThemeToggle } from '../atoms/ThemeToggle';

interface ResultsHeaderProps {
  dataLength: string | number;
  totalSum: string | number;
  totalPagesCount: string | number;
  onBack: () => void;
  onExport: () => void;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  dataLength,
  totalSum,
  totalPagesCount,
  onBack,
  onExport
}) => {
  const formatValue = (val: string | number, isCurrency = false) => {
    if (val === 0 || val === '0' || val === '-') return '-';
    if (typeof val === 'number') {
      const formatted = val.toLocaleString();
      return isCurrency ? `$${formatted}` : formatted;
    }
    return val;
  };

  return (
    <div style={{
      paddingBottom: '0.75rem',
      borderBottom: '1px solid var(--glass-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.75rem',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, minWidth: '400px' }}>
        <ThemeToggle />
        <StatCard label="有效記錄" value={formatValue(dataLength)} icon={<FileText size={18} />} />
        <StatCard 
          label="總付款總計" 
          value={formatValue(totalSum, true)} 
          highlight 
          flex={1.5} 
          minWidth="150px" 
          icon={<CreditCard size={18} />} 
        />
        <StatCard label="掃描頁數" value={formatValue(totalPagesCount)} icon={<Hash size={18} />} />
      </div>
      
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Button 
          onClick={onExport} 
          icon={<Download size={20} />}
        >
          匯出 Excel
        </Button>
        <Button onClick={onBack} variant="outline" icon={<ArrowLeft size={18} />}>
          返回
        </Button>
      </div>
    </div>
  );
};
