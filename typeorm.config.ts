import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './apps/core-service/src/modules/users/entities/user.entity';
import { Wallet } from './apps/core-service/src/modules/wallets/entities/wallet.entity';
import { Transaction } from './apps/core-service/src/modules/transactions/entities/transaction.entity';
import { LedgerEntry } from './apps/core-service/src/modules/ledger/entities/ledger-entry.entity';
import { KycCase } from './apps/core-service/src/modules/kyc/entities/kyc-case.entity';
import { AuditLog } from './apps/core-service/src/modules/audit/entities/audit-log.entity';
import { FraudAlert } from './apps/core-service/src/modules/fraud/entities/fraud-alert.entity';

config({ override: true });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Wallet, Transaction, LedgerEntry, KycCase, AuditLog, FraudAlert],
  migrations: ['./apps/core-service/src/database/migrations/*.ts'],
  synchronize: false,
});
