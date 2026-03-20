import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { KycModule } from '../kyc/kyc.module';
import { RawBodyMiddleware } from '@neobank/common';

@Module({
  imports: [KycModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({ path: 'webhooks/idenfy', method: RequestMethod.POST });
  }
}
