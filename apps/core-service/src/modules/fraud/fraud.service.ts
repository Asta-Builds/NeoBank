import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { FraudAlert } from './entities/fraud-alert.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import {
  FraudAlertType,
  FraudSeverity,
  FraudStatus,
} from './enums/fraud-enums';

@Injectable()
export class FraudService {
  private readonly logger = new Logger(FraudService.name);
  private readonly AML_THRESHOLD = 1000000n; // 10,000 MAD in centimes

  constructor(
    @InjectRepository(FraudAlert)
    private readonly fraudRepository: Repository<FraudAlert>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async evaluateTransaction(transaction: Transaction): Promise<boolean> {
    this.logger.log(`Evaluating transaction ${transaction.id} for fraud...`);

    // Rule 1: AML Threshold
    if (BigInt(transaction.amount) >= this.AML_THRESHOLD) {
      await this.createAlert({
        transactionId: transaction.id,
        walletId: transaction.senderWalletId,
        alertType: FraudAlertType.AML_THRESHOLD,
        severity: FraudSeverity.HIGH,
        ruleTriggered: 'Transaction amount exceeds AML threshold of 10,000 MAD',
      });
      return false; // Requires review or block? For MVP, we alert but might allow
    }

    // Rule 2: Velocity Check (simplified)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const txCount = await this.transactionRepository.count({
      where: {
        senderWalletId: transaction.senderWalletId,
        createdAt: MoreThan(oneHourAgo),
      },
    });

    if (txCount >= 5) {
      await this.createAlert({
        transactionId: transaction.id,
        walletId: transaction.senderWalletId,
        alertType: FraudAlertType.VELOCITY,
        severity: FraudSeverity.MEDIUM,
        ruleTriggered: 'More than 5 transactions in the last hour',
      });
    }

    return true; // Proceed with transaction
  }

  private async createAlert(data: Partial<FraudAlert>): Promise<FraudAlert> {
    const alert = this.fraudRepository.create({
      ...data,
      status: FraudStatus.OPEN,
    });
    const savedAlert = await this.fraudRepository.save(alert);
    this.logger.warn(
      `Fraud Alert Created: [${savedAlert.alertType}] for Wallet ${savedAlert.walletId}`,
    );
    return savedAlert;
  }

  async findAll(query: any): Promise<[FraudAlert[], number]> {
    return await this.fraudRepository.findAndCount({
      ...query,
      order: { createdAt: 'DESC' },
    });
  }

  async resolveAlert(
    alertId: string,
    notes: string,
    reviewedById: string,
  ): Promise<FraudAlert> {
    const alert = await this.fraudRepository.findOne({
      where: { id: alertId },
    });
    if (!alert) throw new Error('Alert not found');

    alert.status = FraudStatus.RESOLVED;
    alert.notes = notes;
    alert.reviewedById = reviewedById;

    return await this.fraudRepository.save(alert);
  }
}
