import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Seul l'administrateur a accès au back-office. */
export const adminGuard: CanActivateFn & CanActivateChildFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated() && auth.isAdmin()) return true;

  if (auth.isAuthenticated()) {
    auth.logout(false);
    return router.createUrlTree(['/login'], { queryParams: { reason: 'forbidden' } });
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
