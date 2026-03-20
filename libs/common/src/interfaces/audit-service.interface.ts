export interface IAuditLogData {
  actorId?: string;
  actorRole: string;
  action: string;
  targetEntity: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  payload?: any;
}

export interface IAuditService {
  create(data: IAuditLogData): Promise<any>;
}
