import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import proxy from 'express-http-proxy';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProxyMiddleware.name);

  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const coreServiceUrl = this.configService.get<string>('CORE_SERVICE_URL') || 'http://localhost:3000';
    const notificationServiceUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL') || 'http://localhost:3001';

    // Do not proxy the API Gateway's own routes
    const gatewayRoutes = ['/api/health', '/health', '/api', '/'];
    if (gatewayRoutes.includes(req.path)) {
      return next();
    }

    // Route: Notification Service
    if (req.path.startsWith('/v1/notifications')) {
      this.logger.log(`Proxying ${req.method} ${req.path} -> Notification Service`);
      return proxy(notificationServiceUrl, {
        proxyReqPathResolver: (request: Request) => {
          // Map /v1/notifications/health to /api/health
          return request.url.replace('/v1/notifications', '/api');
        },
        proxyErrorHandler: (err: any, res: any, next: NextFunction) => {
          this.logger.error(`Notification Service error: ${err.message}`);
          next(err);
        }
      })(req, res, next);
    }

    // Default Route: Core Service
    this.logger.log(`Proxying ${req.method} ${req.path} -> Core Service`);
    return proxy(coreServiceUrl, {
      proxyReqPathResolver: (request: Request) => {
        // If the service expects /v1/v1 but we only have /v1
        let path = request.url;
        if (path.startsWith('/v1') && !path.startsWith('/v1/v1')) {
          path = path.replace('/v1', '/v1/v1');
        }
        return path;
      },
      proxyErrorHandler: (err: any, res: any, next: NextFunction) => {
        this.logger.error(`Core Service error: ${err.message}`);
        next(err);
      }
    })(req, res, next);
  }
}
