import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL, UserContextService, type UserCtx } from '@fiap/shared';

interface AuthResponse {
  user: UserCtx;
}

const CSRF_COOKIE = 'csrf_token';

function readCookie(name: string): string | null {
  const match = typeof document !== 'undefined'
    ? document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
    : null;
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Serviço de autenticação do host. Conversa com a trilha REST da API
 * (signup/login/refresh/logout) e mantém o UserContextService em sincronia.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);
  private readonly ctx = inject(UserContextService);

  async signup(email: string, password: string): Promise<UserCtx> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(
        `${this.apiBase}/auth/signup`,
        { email, password },
        { withCredentials: true },
      ),
    );
    this.ctx.setUser(res.user);
    return res.user;
  }

  async login(email: string, password: string): Promise<UserCtx> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(
        `${this.apiBase}/auth/login`,
        { email, password },
        { withCredentials: true },
      ),
    );
    this.ctx.setUser(res.user);
    return res.user;
  }

  async logout(): Promise<void> {
    const csrf = readCookie(CSRF_COOKIE);
    await firstValueFrom(
      this.http.post(
        `${this.apiBase}/auth/logout`,
        {},
        {
          withCredentials: true,
          headers: csrf ? { 'X-CSRF-Token': csrf } : {},
        },
      ),
    );
    this.ctx.clear();
  }
}
