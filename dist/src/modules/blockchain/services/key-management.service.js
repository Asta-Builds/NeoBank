"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var KeyManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyManagementService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const bip39 = __importStar(require("bip39"));
const crypto_util_1 = require("../../../common/utils/crypto.util");
let KeyManagementService = KeyManagementService_1 = class KeyManagementService {
    cryptoUtil;
    logger = new common_1.Logger(KeyManagementService_1.name);
    constructor(cryptoUtil) {
        this.cryptoUtil = cryptoUtil;
    }
    async createNewWallet() {
        const mnemonic = bip39.generateMnemonic();
        const wallet = ethers_1.HDNodeWallet.fromPhrase(mnemonic);
        return {
            mnemonic,
            address: wallet.address,
            privateKey: wallet.privateKey,
        };
    }
    encryptWalletData(data) {
        return this.cryptoUtil.encrypt(data);
    }
    decryptWalletData(encryptedData) {
        return this.cryptoUtil.decrypt(encryptedData);
    }
    async getWalletFromMnemonic(mnemonic) {
        return ethers_1.HDNodeWallet.fromPhrase(mnemonic);
    }
    async getWalletFromPrivateKey(privateKey) {
        return new ethers_1.Wallet(privateKey);
    }
};
exports.KeyManagementService = KeyManagementService;
exports.KeyManagementService = KeyManagementService = KeyManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [crypto_util_1.CryptoUtil])
], KeyManagementService);
//# sourceMappingURL=key-management.service.js.map