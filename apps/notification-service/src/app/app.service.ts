import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // Mocking email dispatch
    this.logger.log(`📧 [EMAIL SENT] To: ${to} | Subject: ${subject}`);
    this.logger.debug(`Body: ${body}`);
    // Real Nodemailer/SendGrid logic would go here
  }

  async sendSMS(to: string, message: string): Promise<void> {
    // Mocking SMS dispatch
    this.logger.log(`📱 [SMS SENT] To: ${to} | Msg: ${message}`);
    // Real Twilio/Infobip logic would go here
  }

  getHealth(): { status: string } {
    return { status: 'OK' };
  }
}
