import { KycStatus } from '@neobank/common';

export interface KycProviderResult {
  providerCaseId: string;
  status: KycStatus;
  verificationUrl?: string;
  metadata?: any;
}

export interface IKycProvider {
  createSession(userId: string): Promise<KycProviderResult>;
  getSessionStatus(providerCaseId: string): Promise<KycStatus>;
}
