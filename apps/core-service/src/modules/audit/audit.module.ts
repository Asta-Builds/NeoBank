import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [
    AuditService,
    {
      provide: 'AUDIT_SERVICE',
      useClass: AuditService,
    },
  ],
  exports: [AuditService, 'AUDIT_SERVICE'],
})
export class AuditModule {}
