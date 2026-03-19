import { Repository, DataSource } from 'typeorm';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { LedgerEntryType } from './enums/ledger-entry-type.enum';
export declare class LedgerService {
    private readonly ledgerRepository;
    private readonly dataSource;
    constructor(ledgerRepository: Repository<LedgerEntry>, dataSource: DataSource);
    getBalance(walletId: string): Promise<bigint>;
    createEntry(transactionId: string, walletId: string, type: LedgerEntryType, amount: bigint, balanceAfter: bigint): Promise<LedgerEntry>;
}
