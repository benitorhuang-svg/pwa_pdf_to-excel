import { InvoiceData } from '../types';
import { DEFAULT_VENDOR, VENDORS } from '../config/vendorConfig';
import { parseCmuhPdfFile } from './parsers/cmuh';
import { parseVghPdfFile } from './parsers/tungs';

export async function parsePdfFile(
  file: File,
  onProgress: (page: number, total: number) => void,
  vendorId?: string
): Promise<{ data: InvoiceData[]; totalPages: number }> {
  const resolvedVendorId = vendorId || detectVendorId(file.name);

  // In the future we can add more vendor-specific parsers (e.g. for different PDF layouts).
  switch (resolvedVendorId) {
    case VENDORS.cmuh.id:
      return parseCmuhPdfFile(file, onProgress);
    case VENDORS.vgh.id:
      return parseVghPdfFile(file, onProgress);
    default:
      // Fall back to the CMUH parser since it is robust for most invoice layouts.
      return parseCmuhPdfFile(file, onProgress);
  }
}

export function detectVendorId(fileName: string): string {
  const lower = fileName.toLowerCase();

  // For this project, a filename that includes "中國附醫" is considered CMUH.
  // Anything else is treated as “not CMUH”.
  if (lower.includes('中國附醫')) {
    return VENDORS.cmuh.id;
  }
  if (lower.includes('童綜合')) {
    return VENDORS.vgh.id;
  }

  return DEFAULT_VENDOR.id;
}
