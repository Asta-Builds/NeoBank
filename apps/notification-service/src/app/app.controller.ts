import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @EventPattern('transaction.initiated')
  async handleTransactionInitiated(@Payload() data: any) {
    this.logger.log(`🔄 Transaction Initiated: ID ${data.transactionId}`);
    // Optional: Notify user that a transaction has started (Security precaution)
  }

  @EventPattern('transaction.succeeded')
  async handleTransactionSucceeded(@Payload() data: any) {
    const { userEmail, userPhone, amount, currency, recipientName } = data;
    
    // 1. Send Success Email
    await this.appService.sendEmail(
      userEmail,
      '✅ Transfer Successful — NeoBank',
      `Dear customer, your transfer of ${amount} ${currency} to ${recipientName} was successful. Reference: ${data.transactionId}`
    );

    // 2. Send SMS for high-value transactions
    if (amount >= 1000) {
      await this.appService.sendSMS(
        userPhone,
        `NeoBank: Transfer of ${amount} ${currency} to ${recipientName} successful. Ref: ${data.transactionId}`
      );
    }
  }

  @EventPattern('transaction.failed')
  async handleTransactionFailed(@Payload() data: any) {
    const { userEmail, amount, currency, error } = data;
    
    await this.appService.sendEmail(
      userEmail,
      '❌ Transfer Failed — NeoBank',
      `Dear customer, your transfer of ${amount} ${currency} could not be completed. Reason: ${error || 'System error'}. No funds were debited.`
    );
  }
}
