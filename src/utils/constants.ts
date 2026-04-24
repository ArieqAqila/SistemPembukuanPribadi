export const TIPE_TRANSAKSI = {
    TOPUP: 'TOPUP',
    TRANSFER: 'TRANSFER',
    INCOME: 'INCOME',
    EXPENSE: 'EXPENSE',
} as const;

export type TipeTransaksiKey = keyof typeof TIPE_TRANSAKSI;
