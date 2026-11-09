import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL, AUTH_CHANGED_EVENT, readCookie, type UserCtx } from '@fiap/shared';
import { firstValueFrom } from 'rxjs';

interface AuthResponse {
  user: UserCtx;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);

  async signup(email: string, password: string): Promise<UserCtx> {
    return this.entrar('signup', email, password);
  }

  async login(email: string, password: string): Promise<UserCtx> {
    return this.entrar('login', email, password);
  }

  async logout(): Promise<void> {
    const csrf = readCookie('csrf_token') ?? '';
    await firstValueFrom(
      this.http.post(`${this.apiBase}/auth/logout`, {}, { withCredentials: true, headers: { 'X-CSRF-Token': csrf } }),
    );
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
  }

  private async entrar(rota: 'signup' | 'login', email: string, password: string): Promise<UserCtx> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.apiBase}/auth/${rota}`, { email, password }, { withCredentials: true }),
    );
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
    return res.user;
  }
}
