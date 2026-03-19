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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const crypto_util_1 = require("../../common/utils/crypto.util");
let UsersService = class UsersService {
    userRepository;
    cryptoUtil;
    constructor(userRepository, cryptoUtil) {
        this.userRepository = userRepository;
        this.cryptoUtil = cryptoUtil;
    }
    async create(userData) {
        if (!userData.email || !userData.phone) {
            throw new common_1.BadRequestException('Email and phone are required');
        }
        const encryptedEmail = this.cryptoUtil.encrypt(userData.email);
        const encryptedPhone = this.cryptoUtil.encrypt(userData.phone);
        const existingUser = await this.userRepository.findOne({
            where: [{ email: encryptedEmail }, { phone: encryptedPhone }],
        });
        if (existingUser) {
            throw new common_1.ConflictException('User already exists');
        }
        const user = this.userRepository.create({
            ...userData,
            email: encryptedEmail,
            phone: encryptedPhone,
        });
        return this.userRepository.save(user);
    }
    async findByEmail(email) {
        const encryptedEmail = this.cryptoUtil.encrypt(email);
        const user = await this.userRepository.findOne({
            where: { email: encryptedEmail },
        });
        return user ? this.decryptUser(user) : null;
    }
    async findById(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        return user ? this.decryptUser(user) : null;
    }
    async update(id, updateData) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new Error('User not found');
        }
        if (updateData.email) {
            updateData.email = this.cryptoUtil.encrypt(updateData.email);
        }
        if (updateData.phone) {
            updateData.phone = this.cryptoUtil.encrypt(updateData.phone);
        }
        if (updateData.mfaSecret) {
            updateData.mfaSecret = this.cryptoUtil.encrypt(updateData.mfaSecret);
        }
        Object.assign(user, updateData);
        return this.userRepository.save(user);
    }
    decryptUser(user) {
        return {
            ...user,
            email: this.cryptoUtil.decrypt(user.email),
            phone: this.cryptoUtil.decrypt(user.phone),
            mfaSecret: user.mfaSecret ? this.cryptoUtil.decrypt(user.mfaSecret) : null,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        crypto_util_1.CryptoUtil])
], UsersService);
//# sourceMappingURL=users.service.js.map