"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("./entities/transaction.entity");
const transaction_type_enum_1 = require("./enums/transaction-type.enum");
const transaction_status_enum_1 = require("./enums/transaction-status.enum");
const wallets_service_1 = require("../wallets/wallets.service");
const ledger_service_1 = require("../ledger/ledger.service");
const ledger_entry_type_enum_1 = require("../ledger/enums/ledger-entry-type.enum");
const wallet_status_enum_1 = require("../wallets/enums/wallet-status.enum");
let TransactionsService = class TransactionsService {
    transactionRepository;
    walletsService;
    ledgerService;
    dataSource;
    constructor(transactionRepository, walletsService, ledgerService, dataSource) {
        this.transactionRepository = transactionRepository;
        this.walletsService = walletsService;
        this.ledgerService = ledgerService;
        this.dataSource = dataSource;
    }
    async p2pTransfer(senderWalletId, receiverReference, amount, idempotencyKey, description) {
        const existingTx = await this.transactionRepository.findOne({ where: { idempotencyKey } });
        if (existingTx) {
            return existingTx;
        }
        if (amount <= 0n) {
            throw new common_1.BadRequestException('Amount must be positive');
        }
        const senderWallet = await this.walletsService.getWalletById(senderWalletId);
        if (senderWallet.status !== wallet_status_enum_1.WalletStatus.ACTIVE) {
            throw new common_1.BadRequestException('Sender wallet is not active');
        }
        const receiverWallet = await this.dataSource.getRepository('wallets').findOne({ where: { reference: receiverReference } });
        if (!receiverWallet) {
            throw new common_1.NotFoundException('Receiver wallet not found');
        }
        if (receiverWallet.status !== wallet_status_enum_1.WalletStatus.ACTIVE) {
            throw new common_1.BadRequestException('Receiver wallet is not active');
        }
        if (senderWallet.id === receiverWallet.id) {
            throw new common_1.BadRequestException('Cannot transfer to self');
        }
        const senderBalance = await this.ledgerService.getBalance(senderWallet.id);
        if (senderBalance < amount) {
            throw new common_1.BadRequestException('Insufficient balance');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const transaction = queryRunner.manager.create(transaction_entity_1.Transaction, {
                idempotencyKey,
                type: transaction_type_enum_1.TransactionType.P2P_TRANSFER,
                status: transaction_status_enum_1.TransactionStatus.PENDING,
                senderWalletId: senderWallet.id,
                receiverWalletId: receiverWallet.id,
                amount: amount.toString(),
                description,
            });
            const savedTx = await queryRunner.manager.save(transaction);
            const newSenderBalance = senderBalance - amount;
            const debitEntry = queryRunner.manager.create('ledger_entries', {
                transactionId: savedTx.id,
                walletId: senderWallet.id,
                type: ledger_entry_type_enum_1.LedgerEntryType.DEBIT,
                amount: amount.toString(),
                balanceAfter: newSenderBalance.toString(),
            });
            await queryRunner.manager.save(debitEntry);
            const receiverBalance = await this.ledgerService.getBalance(receiverWallet.id);
            const newReceiverBalance = receiverBalance + amount;
            const creditEntry = queryRunner.manager.create('ledger_entries', {
                transactionId: savedTx.id,
                walletId: receiverWallet.id,
                type: ledger_entry_type_enum_1.LedgerEntryType.CREDIT,
                amount: amount.toString(),
                balanceAfter: newReceiverBalance.toString(),
            });
            await queryRunner.manager.save(creditEntry);
            savedTx.status = transaction_status_enum_1.TransactionStatus.SUCCEEDED;
            const finalTx = await queryRunner.manager.save(savedTx);
            await queryRunner.commitTransaction();
            return finalTx;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        wallets_service_1.WalletsService,
        ledger_service_1.LedgerService,
        typeorm_2.DataSource])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map