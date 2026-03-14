export interface InvoiceData {
    dn: string;
    invoice: string;
    date: string;
    // Optional sequence number captured during parsing to preserve original PDF order
    seq?: number;
    amount: number;
    fileName: string;
    vendorId: string;
}

export interface ParsingStatus {
    currentPage: number;
    totalPages: number;
    text: string;
}

export type AppScreen = 'welcome' | 'loading' | 'results';
