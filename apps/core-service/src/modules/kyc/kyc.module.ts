import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { KycCase } from './entities/kyc-case.entity';
import { WalletsModule } from '../wallets/wallets.module';
import { IdenfyProvider } from './providers/idenfy.provider';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([KycCase]), WalletsModule, AuditModule],
  controllers: [KycController],
  providers: [KycService, IdenfyProvider],
  exports: [KycService, IdenfyProvider],
})
export class KycModule {}
