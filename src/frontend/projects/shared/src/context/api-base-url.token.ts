import { InjectionToken, isDevMode } from '@angular/core';

/** URL base da API fiap-store: backend local em dev, prefixo /api do Ingress em produção. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () => (isDevMode() ? 'http://localhost:3000' : '/api'),
});
