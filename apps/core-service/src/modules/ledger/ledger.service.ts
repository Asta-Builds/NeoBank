import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { LedgerEntryType } from './enums/ledger-entry-type.enum';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(LedgerEntry)
    private readonly ledgerRepository: Repository<LedgerEntry>,
    private readonly dataSource: DataSource,
  ) {}

  async getBalance(walletId: string): Promise<bigint> {
    const result = await this.ledgerRepository
      .createQueryBuilder('entry')
      .select(
        'SUM(CASE WHEN entry.type = :credit THEN entry.amount ELSE -entry.amount END)',
        'balance',
      )
      .where('entry.walletId = :walletId', {
        walletId,
        credit: LedgerEntryType.CREDIT,
      })
      .getRawOne();

    return BigInt(result.balance || '0');
  }

  async createEntry(
    transactionId: string,
    walletId: string,
    type: LedgerEntryType,
    amount: bigint,
    balanceAfter: bigint,
  ): Promise<LedgerEntry> {
    const entry = this.ledgerRepository.create({
      transactionId,
      walletId,
      type,
      amount: amount.toString(),
      balanceAfter: balanceAfter.toString(),
    });

    return this.ledgerRepository.save(entry);
  }
}
