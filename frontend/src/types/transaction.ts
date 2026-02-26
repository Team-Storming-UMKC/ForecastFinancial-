export type Transaction = {
    id: number;
    merchantName: string;
    amount: number;   // spending amount
    date: string;     // "YYYY-MM-DD"
    category: string; // e.g. "Groceries"
};