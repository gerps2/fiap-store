import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { UserContextService } from '@fiap/shared';

export const adminGuard: CanMatchFn = async () => {
  const ctx = inject(UserContextService);
  const router = inject(Router);

  if (!ctx.isAuthenticated()) {
    await ctx.hydrate();
  }
  return ctx.hasAnyGroup('admin') ? true : router.createUrlTree(['/']);
};
