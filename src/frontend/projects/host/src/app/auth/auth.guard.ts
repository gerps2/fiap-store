import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { UserContextService } from '@fiap/shared';

/**
 * Guard de rota que exige usuário autenticado. Faz hydrate lazy se ainda
 * não soubermos o estado (ex.: primeira navegação após refresh do browser).
 */
export const authGuard: CanMatchFn = async (): Promise<boolean | UrlTree> => {
  const ctx = inject(UserContextService);
  const router = inject(Router);

  if (ctx.isAuthenticated()) return true;

  const hydrated = await ctx.hydrate().catch(() => null);
  if (hydrated) return true;

  return router.createUrlTree(['/auth/login']);
};
