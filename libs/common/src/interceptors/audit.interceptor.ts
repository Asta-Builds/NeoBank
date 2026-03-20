import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { IAuditService } from '../interfaces/audit-service.interface';
import { Request } from 'express';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    @Inject('AUDIT_SERVICE')
    private readonly auditService: any,
  ) {}

  private get auditSvc(): IAuditService {
    return this.auditService;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip, user } = request as any;

    // Only audit POST, PATCH, DELETE methods
    if (['POST', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap(async (response) => {
          try {
            await this.auditService.create({
              actorId: user?.id || 'SYSTEM',
              actorRole: user?.role || 'GUEST',
              action: `${method} ${url}`,
              targetEntity: this.getTargetEntity(url),
              targetId: response?.id || request.params?.id,
              ipAddress: ip,
              userAgent: request.headers['user-agent'] as string,
              payload: this.sanitizePayload(request.body),
            });
          } catch (error) {
            this.logger.error(`Failed to create audit log: ${error.message}`);
          }
        }),
      );
    }

    return next.handle();
  }

  private getTargetEntity(url: string): string {
    const parts = url.split('/').filter((p) => p && p !== 'api' && p !== 'v1');
    return (parts[0] || 'UNKNOWN').toUpperCase();
  }

  private sanitizePayload(body: any): any {
    if (!body) return null;
    const sanitized = JSON.parse(JSON.stringify(body));
    const sensitiveKeys = [
      'password',
      'mfaSecret',
      'mnemonic',
      'privateKey',
      'oldPassword',
      'newPassword',
      'cardNumber',
      'cvv',
      'pin',
    ];

    const mask = (obj: any) => {
      for (const key in obj) {
        if (sensitiveKeys.includes(key)) {
          obj[key] = '********';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          mask(obj[key]);
        }
      }
    };

    mask(sanitized);
    return sanitized;
  }
}
