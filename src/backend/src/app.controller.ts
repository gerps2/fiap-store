import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  /** Healthcheck para monitoramento e smoke test. */
  @Get('health')
  health() {
    return { status: 'ok', ts: new Date().toISOString() };
  }
}
