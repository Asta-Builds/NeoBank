import { User } from '../../users/entities/user.entity';
export declare class AuditLog {
    id: string;
    actorId: string;
    actor: User;
    actorRole: string;
    action: string;
    targetEntity: string;
    targetId: string;
    ipAddress: string;
    userAgent: string;
    payload: any;
    createdAt: Date;
}
