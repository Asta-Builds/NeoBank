import { Module, Global } from '@nestjs/common';
import { KeyManagementService } from './services/key-management.service';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '@neobank/common';

@Global()
@Module({
  providers: [KeyManagementService],
  exports: [KeyManagementService],
})
export class BlockchainModule {}
