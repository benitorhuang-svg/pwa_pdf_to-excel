export interface InvoiceData {
    dn: string;
    invoice: string;
    date: string;
    amount: number;
}

export interface ParsingStatus {
    currentPage: number;
    totalPages: number;
    text: string;
}

export type AppScreen = 'welcome' | 'loading' | 'results';
