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
exports.KycCase = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const kyc_status_enum_1 = require("../enums/kyc-status.enum");
const kyc_document_type_enum_1 = require("../enums/kyc-document-type.enum");
let KycCase = class KycCase {
    id;
    userId;
    user;
    providerCaseId;
    status;
    documentType;
    documentNumber;
    reviewedBy;
    reviewer;
    reviewNote;
    submittedAt;
    resolvedAt;
    createdAt;
    updatedAt;
};
exports.KycCase = KycCase;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], KycCase.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], KycCase.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], KycCase.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycCase.prototype, "providerCaseId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: kyc_status_enum_1.KycStatus,
        default: kyc_status_enum_1.KycStatus.NOT_STARTED,
    }),
    __metadata("design:type", String)
], KycCase.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: kyc_document_type_enum_1.KycDocumentType,
        nullable: true,
    }),
    __metadata("design:type", String)
], KycCase.prototype, "documentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycCase.prototype, "documentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycCase.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'reviewedBy' }),
    __metadata("design:type", user_entity_1.User)
], KycCase.prototype, "reviewer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], KycCase.prototype, "reviewNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], KycCase.prototype, "submittedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], KycCase.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], KycCase.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], KycCase.prototype, "updatedAt", void 0);
exports.KycCase = KycCase = __decorate([
    (0, typeorm_1.Entity)('kyc_cases')
], KycCase);
//# sourceMappingURL=kyc-case.entity.js.map