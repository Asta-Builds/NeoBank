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
var IdenfyProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdenfyProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const kyc_status_enum_1 = require("../enums/kyc-status.enum");
let IdenfyProvider = IdenfyProvider_1 = class IdenfyProvider {
    configService;
    logger = new common_1.Logger(IdenfyProvider_1.name);
    apiKey;
    apiSecret;
    apiUrl;
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('IDENFY_API_KEY') || 'mock-key';
        this.apiSecret = this.configService.get('IDENFY_API_SECRET') || 'mock-secret';
        this.apiUrl = this.configService.get('IDENFY_API_URL') || 'https://api.idenfy.com/api/v2';
    }
    async createSession(userId) {
        this.logger.log(`Creating iDenfy session for user: ${userId}`);
        return {
            providerCaseId: `idenfy_${Date.now()}_${userId}`,
            status: kyc_status_enum_1.KycStatus.PENDING,
            verificationUrl: `https://ivs.idenfy.com/v2/redirect?token=mock_token_${userId}`,
        };
    }
    async getSessionStatus(providerCaseId) {
        this.logger.log(`Fetching status for iDenfy case: ${providerCaseId}`);
        return kyc_status_enum_1.KycStatus.PENDING;
    }
};
exports.IdenfyProvider = IdenfyProvider;
exports.IdenfyProvider = IdenfyProvider = IdenfyProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], IdenfyProvider);
//# sourceMappingURL=idenfy.provider.js.map