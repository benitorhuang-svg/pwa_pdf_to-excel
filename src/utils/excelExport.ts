import * as XLSX from 'xlsx';
import { InvoiceData } from '../types';
import { sortInvoiceData, formatDate } from './dataProcessor';

import { VENDORS } from '../config/vendorConfig';

export function exportToExcel(data: InvoiceData[]) {
    const wb = XLSX.utils.book_new();
    const byVendor: Record<string, InvoiceData[]> = {};
    
    // Group by vendor
    data.forEach(item => {
        const vid = item.vendorId || 'unknown';
        if (!byVendor[vid]) byVendor[vid] = [];
        byVendor[vid].push(item);
    });

    const vendorIds = Object.keys(byVendor).sort();

    vendorIds.forEach(vid => {
        const vendor = VENDORS[vid] || { name: vid, sheetName: vid, suffix: '' };
        const vData = byVendor[vid];
        const sortedData = sortInvoiceData(vData);
        
        const groups: Record<string, InvoiceData[]> = {};
        sortedData.forEach(item => {
            const year = item.date !== "-" ? item.date.substring(0, 4) : "未知";
            const month = item.date !== "-" ? item.date.substring(4, 6) : "日期";
            const label = item.date !== "-" ? `${year}年${month}月` : "未知日期";
            if (!groups[label]) groups[label] = [];
            groups[label].push(item);
        });

        const aoa: any[][] = [["發票日期", "發票號碼", "付款金額", "處理單號"]];
        const sortedLabels = Object.keys(groups).sort();

        sortedLabels.forEach((label, idx) => {
            aoa.push([`${vendor.name} ${label} 貨款`, "", "", ""]);
            groups[label].forEach(item => {
                aoa.push([
                    formatDate(item.date), 
                    item.invoice + ` ${vendor.suffix}`, 
                    item.amount, 
                    item.dn
                ]);
            });
            if (idx < sortedLabels.length - 1) aoa.push(["", "", "", ""]);
        });

        const ws = XLSX.utils.aoa_to_sheet(aoa);
        const range = XLSX.utils.decode_range(ws['!ref']!);
        const merges: XLSX.Range[] = [];
        
        for (let R = range.s.r; R <= range.e.r; ++R) {
            const cellA = ws[XLSX.utils.encode_cell({ r: R, c: 0 })];
            // Match the header row for merging
            if (cellA && cellA.v && typeof cellA.v === 'string' && cellA.v.includes('貨款')) {
                merges.push({
                    s: { r: R, c: 0 },
                    e: { r: R, c: 2 }
                });
            }

            const cellAmount = XLSX.utils.encode_cell({ r: R, c: 2 });
            if (ws[cellAmount] && typeof ws[cellAmount].v === 'number') {
                ws[cellAmount].z = '#,##0';
            }
        }

        ws['!merges'] = merges;
        ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, ws, vendor.sheetName.substring(0, 31)); // Excel sheet name limit
    });
    
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;

    const fileName = `發票分析報表_${dateStr}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
