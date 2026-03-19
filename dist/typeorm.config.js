"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const user_entity_1 = require("./src/modules/users/entities/user.entity");
const wallet_entity_1 = require("./src/modules/wallets/entities/wallet.entity");
const transaction_entity_1 = require("./src/modules/transactions/entities/transaction.entity");
const ledger_entry_entity_1 = require("./src/modules/ledger/entities/ledger-entry.entity");
const kyc_case_entity_1 = require("./src/modules/kyc/entities/kyc-case.entity");
const audit_log_entity_1 = require("./src/modules/audit/entities/audit-log.entity");
(0, dotenv_1.config)({ override: true });
exports.default = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [user_entity_1.User, wallet_entity_1.Wallet, transaction_entity_1.Transaction, ledger_entry_entity_1.LedgerEntry, kyc_case_entity_1.KycCase, audit_log_entity_1.AuditLog],
    migrations: ['./src/database/migrations/*.ts'],
    synchronize: false,
});
//# sourceMappingURL=typeorm.config.js.map