import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

const HEADER = 'x-trace-id';

/**
 * Anexa um traceId em cada request. Lê de X-Trace-Id se o caller já mandou
 * (propagação distribuída) ou gera um UUID novo. Ecoa no response header.
 */
@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: Request & { traceId?: string }, res: Response, next: NextFunction): void {
    const incoming = req.headers[HEADER];
    const traceId = typeof incoming === 'string' && incoming.length > 0 ? incoming : randomUUID();
    req.traceId = traceId;
    res.setHeader(HEADER, traceId);
    next();
  }
}
