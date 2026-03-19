import { Role } from '../enums/role.enum';
import { UserStatus } from '../enums/user-status.enum';
export declare class User {
    id: string;
    email: string;
    phone: string;
    passwordHash: string;
    role: Role;
    status: UserStatus;
    emailVerified: boolean;
    phoneVerified: boolean;
    mfaEnabled: boolean;
    mfaSecret: string | null;
    createdAt: Date;
    updatedAt: Date;
}
