import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  private readonly logger = new Logger(JwtMiddleware.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private readonly publicRoutes = [
    '/v1/auth/login',
    '/v1/auth/register',
    '/v1/auth/verify-email',
    '/api/health',
    '/api/docs', // Swagger docs if proxying
  ];

  async use(req: Request, res: Response, next: NextFunction) {
    // Clear potentially injected headers
    delete req.headers['x-user-id'];
    delete req.headers['x-user-email'];
    delete req.headers['x-user-role'];

    // Skip JWT for public routes
    if (this.publicRoutes.some(route => req.path.startsWith(route))) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn(`Missing or invalid auth header for path: ${req.path}`);
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });
      // Attach user info to headers for downstream services
      req.headers['x-user-id'] = payload.sub || payload.userId;
      req.headers['x-user-email'] = payload.email;
      req.headers['x-user-role'] = payload.role;
      next();
    } catch (err) {
      this.logger.error(`Invalid token for path: ${req.path}, error: ${err.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
