import { InvoiceData } from '../types';

/**
 * Sorts invoice data by date (YYYYMMDD) and then by sequence number (seq) if available.
 */
export function sortInvoiceData(data: InvoiceData[]): InvoiceData[] {
  return [...data].sort((a, b) => {
    const dateA = a.date || '';
    const dateB = b.date || '';
    const dateCmp = dateA.localeCompare(dateB);
    if (dateCmp !== 0) return dateCmp;
    
    // Within same date, use capture sequence to preserve original PDF order
    if (a.seq !== undefined && b.seq !== undefined) {
      return a.seq - b.seq;
    }
    return 0;
  });
}

/**
 * Formats YYYYMMDD to YYYY/MM/DD
 */
export function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === "-" || dateStr.length !== 8) return dateStr || "-";
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${year}/${month}/${day}`;
}

/**
 * Groups data by YYYY年MM月
 */
export function groupDataByMonth(data: InvoiceData[]): Record<string, InvoiceData[]> {
  const grouped: Record<string, InvoiceData[]> = {};
  
  data.forEach(item => {
    let label = "未知日期";
    if (item.date && item.date !== "-" && item.date.length >= 6) {
      const year = item.date.substring(0, 4);
      const month = item.date.substring(4, 6);
      label = `${year}年${month}月`;
    }
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(item);
  });
  
  return grouped;
}

/**
 * Groups data by vendorId
 */
export function groupDataByVendor(data: InvoiceData[]): Record<string, InvoiceData[]> {
  const grouped: Record<string, InvoiceData[]> = {};
  data.forEach(item => {
    const vid = item.vendorId || 'unknown';
    if (!grouped[vid]) grouped[vid] = [];
    grouped[vid].push(item);
  });
  return grouped;
}
