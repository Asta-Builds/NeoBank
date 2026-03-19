import { User } from '../../users/entities/user.entity';
import { KycStatus } from '../enums/kyc-status.enum';
import { KycDocumentType } from '../enums/kyc-document-type.enum';
export declare class KycCase {
    id: string;
    userId: string;
    user: User;
    providerCaseId: string;
    status: KycStatus;
    documentType: KycDocumentType;
    documentNumber: string;
    reviewedBy: string;
    reviewer: User;
    reviewNote: string;
    submittedAt: Date;
    resolvedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
