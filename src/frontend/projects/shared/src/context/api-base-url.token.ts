import { InjectionToken } from '@angular/core';

/** URL base da API fiap-store (usada por Apollo + HttpClient de todos os MFEs). */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () => 'http://localhost:3000',
});
