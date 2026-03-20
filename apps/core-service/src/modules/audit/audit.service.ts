import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { IAuditService, IAuditLogData } from '@neobank/common';

@Injectable()
export class AuditService implements IAuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(data: IAuditLogData): Promise<AuditLog> {
    const log = this.auditLogRepository.create(data as any);
    const saved = await this.auditLogRepository.save(log);
    return (Array.isArray(saved) ? saved[0] : saved) as AuditLog;
  }

  async findAll(query: any): Promise<[AuditLog[], number]> {
    return await this.auditLogRepository.findAndCount({
      ...query,
      order: { createdAt: 'DESC' },
    });
  }
}
