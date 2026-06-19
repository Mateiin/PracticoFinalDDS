import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.initialized$.pipe(
    filter((ready) => ready),
    take(1),
    map(() => auth.isAdmin() || router.parseUrl('/')),
  );
};
