import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { GraphQLError } from 'graphql';
import { HTTP_STATUS_TO_CODE, StructuredError } from './errors';

const isProd = () => process.env.NODE_ENV === 'production';

/**
 * Filtro global unificado: captura tudo e devolve { code, message, traceId }
 * em REST (JSON) ou em extensions do GraphQLError conforme o host.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): GraphQLError | void {
    const { status, code, message, details } = this.normalize(exception);

    if (host.getType<'http' | 'graphql'>() === 'graphql') {
      return this.handleGraphql(exception, host, status, code, message);
    }
    return this.handleHttp(exception, host, status, code, message, details);
  }

  private handleHttp(
    exception: unknown,
    host: ArgumentsHost,
    status: number,
    code: string,
    message: string,
    details: unknown,
  ): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request & { traceId?: string }>();
    const res = ctx.getResponse<Response>();
    const traceId = req.traceId ?? 'no-trace';

    const payload: StructuredError = {
      code,
      message: status >= 500 && isProd() ? 'Erro interno do servidor.' : message,
      traceId,
    };
    if (!isProd() && details !== undefined) payload.details = details;

    if (status >= 500) {
      this.logger.error(
        `[${traceId}] ${req.method} ${req.url} → ${status} ${code}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    res.status(status).json(payload);
  }

  private handleGraphql(
    exception: unknown,
    host: ArgumentsHost,
    status: number,
    code: string,
    message: string,
  ): GraphQLError {
    const gqlHost = GqlArgumentsHost.create(host);
    const req = gqlHost.getContext<{ req?: { traceId?: string } }>().req;
    const traceId = req?.traceId ?? 'no-trace';

    const safeMessage = status >= 500 && isProd() ? 'Erro interno do servidor.' : message;

    if (status >= 500) {
      this.logger.error(
        `[${traceId}] graphql ${gqlHost.getInfo()?.fieldName}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    return new GraphQLError(safeMessage, {
      extensions: { code, traceId, status },
    });
  }

  private normalize(exception: unknown): {
    status: number;
    code: string;
    message: string;
    details?: unknown;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      let message = exception.message;
      let details: unknown;
      if (typeof response === 'string') {
        message = response;
      } else if (response && typeof response === 'object') {
        const r = response as Record<string, unknown>;
        const msg = r.message ?? exception.message;
        message = Array.isArray(msg) ? msg.join('; ') : String(msg);
        details = Array.isArray(r.message) ? r.message : r.errors;
      }
      return { status, code: HTTP_STATUS_TO_CODE[status] ?? 'INTERNAL', message, details };
    }
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL',
      message: exception instanceof Error ? exception.message : 'Unknown error',
    };
  }
}
