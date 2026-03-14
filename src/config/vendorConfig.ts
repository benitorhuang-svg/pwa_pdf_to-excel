export interface VendorConfig {
  id: string;
  name: string;
  suffix: string;
  sheetName: string;
}

export const VENDORS: Record<string, VendorConfig> = {
  cmuh: {
    id: 'cmuh',
    name: '中國附醫',
    suffix: '中國附醫',
    sheetName: '中國附醫'
  },
  vgh: {
    id: 'vgh',
    name: '童綜合',
    suffix: '童綜合',
    sheetName: '童綜合'
  }
};

export const DEFAULT_VENDOR = VENDORS.cmuh;
