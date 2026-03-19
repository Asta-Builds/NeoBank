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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerEntry = void 0;
const typeorm_1 = require("typeorm");
const wallet_entity_1 = require("../../wallets/entities/wallet.entity");
const ledger_entry_type_enum_1 = require("../enums/ledger-entry-type.enum");
let LedgerEntry = class LedgerEntry {
    id;
    transactionId;
    walletId;
    wallet;
    type;
    amount;
    balanceAfter;
    createdAt;
};
exports.LedgerEntry = LedgerEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LedgerEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LedgerEntry.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LedgerEntry.prototype, "walletId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wallet_entity_1.Wallet),
    (0, typeorm_1.JoinColumn)({ name: 'walletId' }),
    __metadata("design:type", wallet_entity_1.Wallet)
], LedgerEntry.prototype, "wallet", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ledger_entry_type_enum_1.LedgerEntryType,
    }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "balanceAfter", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LedgerEntry.prototype, "createdAt", void 0);
exports.LedgerEntry = LedgerEntry = __decorate([
    (0, typeorm_1.Entity)('ledger_entries')
], LedgerEntry);
//# sourceMappingURL=ledger-entry.entity.js.map