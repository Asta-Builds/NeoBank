import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KycCase } from './entities/kyc-case.entity';
import { KycStatus } from './enums/kyc-status.enum';
import { WalletsService } from '../wallets/wallets.service';
import { WalletStatus } from '../wallets/enums/wallet-status.enum';
import { IdenfyProvider } from './providers/idenfy.provider';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    @InjectRepository(KycCase)
    private readonly kycRepository: Repository<KycCase>,
    private readonly walletsService: WalletsService,
    private readonly idenfyProvider: IdenfyProvider,
  ) {}

  async createCase(userId: string): Promise<KycCase> {
    const existingCase = await this.kycRepository.findOne({ where: { userId } });
    if (existingCase) {
      throw new ConflictException('KYC case already exists for this user');
    }

    // Initialize with provider
    const providerResult = await this.idenfyProvider.createSession(userId);

    const kycCase = this.kycRepository.create({
      userId,
      providerCaseId: providerResult.providerCaseId,
      status: providerResult.status,
    });

    const savedCase = await this.kycRepository.save(kycCase);
    
    // In a real app, we would return the verificationUrl to the frontend
    this.logger.log(`Created KYC case ${savedCase.id} for user ${userId}. URL: ${providerResult.verificationUrl}`);
    
    return savedCase;
  }

  async getCaseByUserId(userId: string): Promise<KycCase> {
    const kycCase = await this.kycRepository.findOne({ where: { userId } });
    if (!kycCase) {
      throw new NotFoundException('KYC case not found');
    }
    return kycCase;
  }

  async approveCase(caseId: string): Promise<KycCase> {
    const kycCase = await this.kycRepository.findOne({ where: { id: caseId } });
    if (!kycCase) {
      throw new NotFoundException('KYC case not found');
    }

    if (kycCase.status === KycStatus.APPROVED) {
      return kycCase;
    }

    kycCase.status = KycStatus.APPROVED;
    kycCase.resolvedAt = new Date();
    
    const savedCase = await this.kycRepository.save(kycCase);

    // Auto-create wallet and set it to ACTIVE immediately on KYC approval
    const wallet = await this.walletsService.createWallet(kycCase.userId);
    await this.walletsService.updateStatus(wallet.id, WalletStatus.ACTIVE);

    return savedCase;
  }
}
