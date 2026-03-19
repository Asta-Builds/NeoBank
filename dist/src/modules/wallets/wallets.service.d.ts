import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletStatus } from './enums/wallet-status.enum';
import { KeyManagementService } from '../blockchain/services/key-management.service';
export declare class WalletsService {
    private readonly walletRepository;
    private readonly keyManagementService;
    constructor(walletRepository: Repository<Wallet>, keyManagementService: KeyManagementService);
    createWallet(userId: string): Promise<Wallet>;
    getWalletByUserId(userId: string): Promise<Wallet>;
    getWalletById(id: string): Promise<Wallet>;
    updateStatus(id: string, status: WalletStatus): Promise<Wallet>;
    private generateReference;
}
