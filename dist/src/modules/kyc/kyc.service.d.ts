import { Repository } from 'typeorm';
import { KycCase } from './entities/kyc-case.entity';
import { WalletsService } from '../wallets/wallets.service';
import { IdenfyProvider } from './providers/idenfy.provider';
export declare class KycService {
    private readonly kycRepository;
    private readonly walletsService;
    private readonly idenfyProvider;
    private readonly logger;
    constructor(kycRepository: Repository<KycCase>, walletsService: WalletsService, idenfyProvider: IdenfyProvider);
    createCase(userId: string): Promise<KycCase>;
    getCaseByUserId(userId: string): Promise<KycCase>;
    approveCase(caseId: string): Promise<KycCase>;
}
