import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from './api-base-url.token';
import type { UserCtx } from './user-context.types';

export const AUTH_CHANGED_EVENT = 'fiap:auth:changed';

@Injectable({ providedIn: 'root' })
export class UserContextService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);
  private readonly _user = signal<UserCtx | null>(null);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly groups = computed(() => this._user()?.groups ?? []);

  constructor() {
    window.addEventListener(AUTH_CHANGED_EVENT, () => void this.hydrate());
    void this.hydrate();
  }

  /** Indica se o usuário logado pertence a pelo menos um dos grupos. */
  hasAnyGroup(...groups: string[]): boolean {
    return groups.some((grupo) => this.groups().includes(grupo));
  }

  /** Pergunta ao backend quem está logado; o cookie httpOnly vai junto. */
  async hydrate(): Promise<UserCtx | null> {
    try {
      const me = await firstValueFrom(
        this.http.get<UserCtx>(`${this.apiBase}/users/me`, { withCredentials: true }),
      );
      this._user.set(me);
      return me;
    } catch {
      this._user.set(null);
      return null;
    }
  }
}
