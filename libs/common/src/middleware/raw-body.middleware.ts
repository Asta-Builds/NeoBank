import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as bodyParser from 'body-parser';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    bodyParser.raw({ type: '*/*' })(req, res, (err) => {
      if (err) return next(err);
      req.body = req.body; // body is now a Buffer
      next();
    });
  }
}
