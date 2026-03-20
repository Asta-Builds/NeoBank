import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletStatus } from './enums/wallet-status.enum';
import { KeyManagementService } from '../blockchain/services/key-management.service';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly keyManagementService: KeyManagementService,
  ) {}

  async createWallet(userId: string): Promise<Wallet> {
    const existingWallet = await this.walletRepository.findOne({
      where: { userId },
    });
    if (existingWallet) {
      throw new ConflictException('User already has a wallet');
    }

    // Generate blockchain keys
    const blockchainWallet = await this.keyManagementService.createNewWallet();

    const wallet = this.walletRepository.create({
      userId,
      reference: this.generateReference(),
      status: WalletStatus.PENDING,
      currency: 'MAD',
      dailySpendLimit: '0',
      monthlySpendLimit: '0',
      blockchainAddress: blockchainWallet.address,
      encryptedMnemonic: this.keyManagementService.encryptWalletData(
        blockchainWallet.mnemonic,
      ),
      encryptedPrivateKey: this.keyManagementService.encryptWalletData(
        blockchainWallet.privateKey,
      ),
    });

    return this.walletRepository.save(wallet);
  }

  async getWalletByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found for this user');
    }
    return wallet;
  }

  async getWalletById(id: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({ where: { id } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  async updateStatus(id: string, status: WalletStatus): Promise<Wallet> {
    const wallet = await this.getWalletById(id);
    wallet.status = status;
    return this.walletRepository.save(wallet);
  }

  private generateReference(): string {
    // Generate a reference like NB-XXXX-XXXX-XXXX
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'NB';
    for (let i = 0; i < 3; i++) {
      result += '-';
      for (let j = 0; j < 4; j++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    return result;
  }
}
