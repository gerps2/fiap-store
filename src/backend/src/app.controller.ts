import { Controller, Get, NotFoundException } from '@nestjs/common';

@Controller()
export class AppController {
  /** Healthcheck para monitoramento e smoke test. */
  @Get('health')
  health() {
    return { status: 'ok', ts: new Date().toISOString() };
  }

  /** Endpoint disponível apenas fora de produção — simula erro 500 para testar o filtro. */
  @Get('__boom')
  boom() {
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException();
    }
    throw new Error('kaboom — erro intencional para validar o HttpExceptionFilter');
  }
}
