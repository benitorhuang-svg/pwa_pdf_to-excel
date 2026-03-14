import React, { useState, useMemo, useEffect, useRef } from 'react';
import { InvoiceData } from '../types';
import { formatDate, sortInvoiceData, groupDataByMonth, groupDataByVendor } from '../utils/dataProcessor';
import { VENDORS } from '../config/vendorConfig';

// Atomic Components
import { ResultsHeader } from '../components/organisms/ResultsHeader';
import { ResultsSidebar } from '../components/organisms/ResultsSidebar';
import { ResultsMainTable } from '../components/organisms/ResultsMainTable';

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
  const [activeVendorId, setActiveVendorId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [isVendorOpen, setIsVendorOpen] = useState<Record<string, boolean>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when month changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedMonth]);

  const groupedData = useMemo(() => {
    const byVendor = groupDataByVendor(data);
    const result: Record<string, Record<string, InvoiceData[]>> = {};
    Object.keys(byVendor).forEach(vid => {
      result[vid] = groupDataByMonth(byVendor[vid]);
    });
    return result;
  }, [data]);

  const vendorIds = useMemo(() => Object.keys(groupedData).sort(), [groupedData]);

  const activeVendorConfig = activeVendorId ? (VENDORS[activeVendorId] || { name: activeVendorId, suffix: '', id: activeVendorId }) : null;
  
  // Calculate stats based on active selection (0 if nothing selected)
  const vendorDataForHeader = useMemo(() => {
    if (!activeVendorId) return [];
    const byVendor = groupDataByVendor(data);
    return byVendor[activeVendorId] || [];
  }, [activeVendorId, data]);

  const displayTotalSum = activeVendorId ? vendorDataForHeader.reduce((acc, curr) => acc + curr.amount, 0) : 0;
  const displayDataLength = activeVendorId ? vendorDataForHeader.length : 0;
  const displayTotalPages = activeVendorId ? totalPages : 0;

  const selectedData = (activeVendorId && selectedMonth) ? (groupedData[activeVendorId][selectedMonth] || []) : [];
  const displayedData = useMemo(() => sortInvoiceData(selectedData), [selectedData]);
  const selectedSum = displayedData.reduce((acc, curr) => acc + curr.amount, 0);

  const generateCopyText = () => {
    if (!activeVendorConfig) return '';
    let text = `${activeVendorConfig.name} ${selectedMonth} 貨款\n`;
    displayedData.forEach(item => {
      text += `${formatDate(item.date)}\t${item.invoice} ${activeVendorConfig.suffix}\t\t${item.amount}\n`;
    });
    return text;
  };

  const handleSelectMonth = (vid: string, month: string) => {
    setActiveVendorId(vid);
    setSelectedMonth(month);
  };

  const handleToggleVendor = (vid: string) => {
    setIsVendorOpen(prev => {
      const isOpening = !prev[vid];
      if (isOpening) {
        // Close others and set active
        const nextMonths = Object.keys(groupedData[vid]).sort();
        if (nextMonths.length > 0) {
          handleSelectMonth(vid, nextMonths[0]);
        }
        return { [vid]: true };
      } else {
        return { ...prev, [vid]: false };
      }
    });
  };

  return (
    <div style={{
      padding: '1.25rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      height: '100%',
      width: '100%',
      overflow: 'hidden'
    }}>
      <ResultsHeader 
        dataLength={displayDataLength}
        totalSum={displayTotalSum}
        totalPagesCount={displayTotalPages}
        onBack={onBack}
        onExport={onExport}
      />

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        <ResultsSidebar 
          vendorIds={vendorIds}
          groupedData={groupedData}
          activeVendorId={activeVendorId}
          selectedMonth={selectedMonth}
          isVendorOpen={isVendorOpen}
          onToggleVendor={handleToggleVendor}
          onSelectMonth={handleSelectMonth}
        />

        <ResultsMainTable 
          selectedMonth={selectedMonth}
          onCopy={onCopy}
          generateCopyText={generateCopyText}
          displayedData={displayedData}
          selectedSum={selectedSum}
          activeVendorConfig={activeVendorConfig}
          scrollContainerRef={scrollContainerRef}
        />
      </div>
      
      <style>{`
        .table-row-hover:hover td {
          background: var(--card);
        }
        .month-tab-hover:hover {
          background: var(--glass-border) !important;
          border-color: var(--primary-light) !important;
        }
        .btn-copy-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.5) !important;
          filter: brightness(1.1);
        }
        .btn-copy-premium:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default ResultsPage;
