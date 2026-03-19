import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './src/modules/users/entities/user.entity';
import { Wallet } from './src/modules/wallets/entities/wallet.entity';
import { Transaction } from './src/modules/transactions/entities/transaction.entity';
import { LedgerEntry } from './src/modules/ledger/entities/ledger-entry.entity';
import { KycCase } from './src/modules/kyc/entities/kyc-case.entity';
import { AuditLog } from './src/modules/audit/entities/audit-log.entity';

config({ override: true });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Wallet, Transaction, LedgerEntry, KycCase, AuditLog],
  migrations: ['./src/database/migrations/*.ts'],
  synchronize: false,
});
