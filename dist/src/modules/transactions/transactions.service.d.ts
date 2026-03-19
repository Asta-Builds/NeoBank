import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { WalletsService } from '../wallets/wallets.service';
import { LedgerService } from '../ledger/ledger.service';
export declare class TransactionsService {
    private readonly transactionRepository;
    private readonly walletsService;
    private readonly ledgerService;
    private readonly dataSource;
    constructor(transactionRepository: Repository<Transaction>, walletsService: WalletsService, ledgerService: LedgerService, dataSource: DataSource);
    p2pTransfer(senderWalletId: string, receiverReference: string, amount: bigint, idempotencyKey: string, description?: string): Promise<Transaction>;
}
