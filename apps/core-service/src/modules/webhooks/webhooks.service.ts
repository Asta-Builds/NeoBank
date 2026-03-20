import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { KycService } from '../kyc/kyc.service';
import { KycStatus } from '@neobank/common';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly kycService: KycService,
  ) {}

  verifyIdenfySignature(rawBody: Buffer, signature: string): boolean {
    const secret = this.configService.get<string>('KYC_WEBHOOK_SECRET');
    if (!secret) {
      this.logger.error('KYC_WEBHOOK_SECRET is not configured');
      return false;
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(rawBody).digest('hex');

    return digest === signature;
  }

  async handleIdenfyWebhook(payload: any) {
    // iDenfy webhook structure can vary, but typically it's status.overall and externalId
    const scanStatus = payload.status?.overall || payload.scanStatus;
    const externalId = payload.externalId;

    if (!externalId) {
      this.logger.error('Received iDenfy webhook without externalId');
      return;
    }

    this.logger.log(
      `Received iDenfy webhook for user ${externalId}: ${scanStatus}`,
    );

    const kycCase = await this.kycService.getCaseByUserId(externalId);
    if (!kycCase) {
      this.logger.error(`KYC case not found for user ${externalId}`);
      return;
    }

    switch (scanStatus) {
      case 'APPROVED':
        await this.kycService.approveCase(kycCase.id);
        break;
      case 'REJECTED':
      case 'SUSPECTED':
        await this.updateKycStatus(kycCase.id, KycStatus.REJECTED);
        break;
      case 'EXPIRED':
        await this.updateKycStatus(kycCase.id, KycStatus.FAILED);
        break;
      default:
        this.logger.warn(`Unhandled iDenfy scan status: ${scanStatus}`);
    }
  }

  private async updateKycStatus(caseId: string, status: KycStatus) {
    this.logger.log(`Updating KYC case ${caseId} status to ${status}`);
    await this.kycService.updateStatus(caseId, status);
  }
}
