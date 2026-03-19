import { ConfigService } from '@nestjs/config';
import { IKycProvider, KycProviderResult } from './kyc-provider.interface';
import { KycStatus } from '../enums/kyc-status.enum';
export declare class IdenfyProvider implements IKycProvider {
    private readonly configService;
    private readonly logger;
    private readonly apiKey;
    private readonly apiSecret;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    createSession(userId: string): Promise<KycProviderResult>;
    getSessionStatus(providerCaseId: string): Promise<KycStatus>;
}
