import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { UserContextService } from '@fiap/shared';

export const authGuard: CanMatchFn = async () => {
  const ctx = inject(UserContextService);
  const router = inject(Router);

  if (ctx.isAuthenticated() || (await ctx.hydrate())) {
    return true;
  }
  return router.createUrlTree(['/auth/login']);
};
