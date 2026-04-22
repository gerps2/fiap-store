import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from './api-base-url.token';
import type { UserCtx } from './user-context.types';

/**
 * Service de contexto do usuário logado.
 *
 * Escopo: **1 instância por MFE** (cada MFE tem a sua). Sincronização entre MFEs
 * acontece via hidratação contra `GET /users/me` — o backend é a fonte de verdade.
 * Para compartilhar estado em tempo real entre MFEs sem round-trip, ver a Aula 3
 * V4 (comparação entre BFF, shared deps e event bus).
 */
@Injectable({ providedIn: 'root' })
export class UserContextService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);

  private readonly _user = signal<UserCtx | null>(null);
  private readonly _loading = signal(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly groups = computed<string[]>(() => this._user()?.groups ?? []);

  /** Retorna true se o usuário pertence a ao menos um dos grupos listados. */
  hasAnyGroup(...groups: string[]): boolean {
    if (groups.length === 0) return false;
    const current = this._user()?.groups ?? [];
    return groups.some((g) => current.includes(g));
  }

  /** Busca /users/me com cookies httpOnly e popula o signal. Idempotente. */
  async hydrate(): Promise<UserCtx | null> {
    this._loading.set(true);
    try {
      const me = await firstValueFrom(
        this.http.get<UserCtx>(`${this.apiBase}/users/me`, { withCredentials: true }),
      );
      this._user.set(me);
      return me;
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        this._user.set(null);
        return null;
      }
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  /** Atualiza o contexto sem bater na API — útil após login/signup que já retorna o user. */
  setUser(user: UserCtx | null): void {
    this._user.set(user);
  }

  /** Limpa o contexto local após logout (chamar depois do POST /auth/logout). */
  clear(): void {
    this._user.set(null);
  }
}
