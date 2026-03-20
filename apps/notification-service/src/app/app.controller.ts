import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'notification-service' };
  }

  @EventPattern('transaction.initiated')
  handleTransactionInitiated(@Payload() data: any) {
    this.logger.log(`🔔 Event received: transaction.initiated - ${JSON.stringify(data)}`);
    // Process notification logic here (e.g., send push or email)
  }

  @EventPattern('transaction.succeeded')
  handleTransactionSucceeded(@Payload() data: any) {
    this.logger.log(`✅ Event received: transaction.succeeded - ${JSON.stringify(data)}`);
  }

  @EventPattern('transaction.failed')
  handleTransactionFailed(@Payload() data: any) {
    this.logger.warn(`❌ Event received: transaction.failed - ${JSON.stringify(data)}`);
  }
}
