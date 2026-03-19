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
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wallet_entity_1 = require("./entities/wallet.entity");
const wallet_status_enum_1 = require("./enums/wallet-status.enum");
const key_management_service_1 = require("../blockchain/services/key-management.service");
let WalletsService = class WalletsService {
    walletRepository;
    keyManagementService;
    constructor(walletRepository, keyManagementService) {
        this.walletRepository = walletRepository;
        this.keyManagementService = keyManagementService;
    }
    async createWallet(userId) {
        const existingWallet = await this.walletRepository.findOne({ where: { userId } });
        if (existingWallet) {
            throw new common_1.ConflictException('User already has a wallet');
        }
        const blockchainWallet = await this.keyManagementService.createNewWallet();
        const wallet = this.walletRepository.create({
            userId,
            reference: this.generateReference(),
            status: wallet_status_enum_1.WalletStatus.PENDING,
            currency: 'MAD',
            dailySpendLimit: '0',
            monthlySpendLimit: '0',
            blockchainAddress: blockchainWallet.address,
            encryptedMnemonic: this.keyManagementService.encryptWalletData(blockchainWallet.mnemonic),
            encryptedPrivateKey: this.keyManagementService.encryptWalletData(blockchainWallet.privateKey),
        });
        return this.walletRepository.save(wallet);
    }
    async getWalletByUserId(userId) {
        const wallet = await this.walletRepository.findOne({ where: { userId } });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found for this user');
        }
        return wallet;
    }
    async getWalletById(id) {
        const wallet = await this.walletRepository.findOne({ where: { id } });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        return wallet;
    }
    async updateStatus(id, status) {
        const wallet = await this.getWalletById(id);
        wallet.status = status;
        return this.walletRepository.save(wallet);
    }
    generateReference() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'NB';
        for (let i = 0; i < 3; i++) {
            result += '-';
            for (let j = 0; j < 4; j++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        }
        return result;
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        key_management_service_1.KeyManagementService])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map