import { Wallet } from '../../wallets/entities/wallet.entity';
import { LedgerEntryType } from '../enums/ledger-entry-type.enum';
export declare class LedgerEntry {
    id: string;
    transactionId: string;
    walletId: string;
    wallet: Wallet;
    type: LedgerEntryType;
    amount: string;
    balanceAfter: string;
    createdAt: Date;
}
