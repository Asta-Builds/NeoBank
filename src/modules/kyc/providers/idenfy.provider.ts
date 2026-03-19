import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IKycProvider, KycProviderResult } from './kyc-provider.interface';
import { KycStatus } from '../enums/kyc-status.enum';

@Injectable()
export class IdenfyProvider implements IKycProvider {
  private readonly logger = new Logger(IdenfyProvider.name);
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('IDENFY_API_KEY') || 'mock-key';
    this.apiSecret = this.configService.get<string>('IDENFY_API_SECRET') || 'mock-secret';
    this.apiUrl = this.configService.get<string>('IDENFY_API_URL') || 'https://api.idenfy.com/api/v2';
  }

  async createSession(userId: string): Promise<KycProviderResult> {
    this.logger.log(`Creating iDenfy session for user: ${userId}`);
    
    // MOCK: Simulate API call to iDenfy
    // In real implementation:
    // axios.post(`${this.apiUrl}/token`, { externalId: userId }, { auth: { username: this.apiKey, password: this.apiSecret } })
    
    return {
      providerCaseId: `idenfy_${Date.now()}_${userId}`,
      status: KycStatus.PENDING,
      verificationUrl: `https://ivs.idenfy.com/v2/redirect?token=mock_token_${userId}`,
    };
  }

  async getSessionStatus(providerCaseId: string): Promise<KycStatus> {
    this.logger.log(`Fetching status for iDenfy case: ${providerCaseId}`);
    
    // MOCK: Simulate API call to check status
    // In real implementation, you would handle iDenfy webhook or poll API
    
    return KycStatus.PENDING;
  }
}
