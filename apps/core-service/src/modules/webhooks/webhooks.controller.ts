import {
  Controller,
  Post,
  Req,
  Headers,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('idenfy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive iDenfy KYC status update webhooks' })
  async handleIdenfyWebhook(
    @Req() req: Request,
    @Headers('idenfy-signature') signature: string,
  ) {
    if (!signature) {
      throw new UnauthorizedException('Missing signature');
    }

    // Body is a Buffer due to RawBodyMiddleware
    const rawBody = req.body as Buffer;
    const isValid = this.webhooksService.verifyIdenfySignature(
      rawBody,
      signature,
    );

    if (!isValid) {
      this.logger.error('Invalid iDenfy webhook signature');
      throw new UnauthorizedException('Invalid signature');
    }

    const payload = JSON.parse(rawBody.toString('utf-8'));
    await this.webhooksService.handleIdenfyWebhook(payload);

    return { status: 'OK' };
  }
}
