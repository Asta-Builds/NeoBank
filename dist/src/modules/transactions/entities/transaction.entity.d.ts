import { Wallet } from '../../wallets/entities/wallet.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';
export declare class Transaction {
    id: string;
    idempotencyKey: string;
    type: TransactionType;
    status: TransactionStatus;
    senderWalletId: string;
    senderWallet: Wallet;
    receiverWalletId: string;
    receiverWallet: Wallet;
    amount: string;
    currency: string;
    fee: string;
    description: string;
    metadata: any;
    failureReason: string;
    createdAt: Date;
    updatedAt: Date;
}
