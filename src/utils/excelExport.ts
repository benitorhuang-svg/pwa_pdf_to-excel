import * as XLSX from 'xlsx';
import { InvoiceData } from '../types';

export function exportToExcel(data: InvoiceData[]) {
    const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));
    const groups: Record<string, InvoiceData[]> = {};
    
    sortedData.forEach(item => {
        const month = item.date !== "-" ? item.date.substring(4, 6) : "未知";
        if (!groups[month]) groups[month] = [];
        groups[month].push(item);
    });

    const aoa: any[][] = [["驗退收單號", "發票號碼", "發票日期", "付款金額"]];
    const sortedMonths = Object.keys(groups).sort();

    sortedMonths.forEach((month, idx) => {
        aoa.push([`中國附醫 ${month}月 貨款`, "", "", ""]);
        groups[month].forEach(item => {
            aoa.push([item.dn, item.invoice + " 中國附醫", item.date, item.amount]);
        });
        if (idx < sortedMonths.length - 1) aoa.push(["", "", "", ""]);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const range = XLSX.utils.decode_range(ws['!ref']!);
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: 3 });
        if (ws[cellAddress] && typeof ws[cellAddress].v === 'number') {
            ws[cellAddress].z = '#,##0';
        }
    }

    ws['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "中國附醫");
    
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;

    const fileName = `中國附醫報表_${dateStr}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
