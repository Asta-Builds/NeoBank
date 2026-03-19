import { User } from '../../users/entities/user.entity';
import { WalletStatus } from '../enums/wallet-status.enum';
export declare class Wallet {
    id: string;
    userId: string;
    user: User;
    reference: string;
    blockchainAddress: string;
    encryptedMnemonic: string;
    encryptedPrivateKey: string;
    status: WalletStatus;
    currency: string;
    dailySpendLimit: string;
    monthlySpendLimit: string;
    createdAt: Date;
    updatedAt: Date;
}
