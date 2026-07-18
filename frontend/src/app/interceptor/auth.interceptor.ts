import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { mergeMap } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(OidcSecurityService);

  return authService.getAccessToken().pipe(
    mergeMap((token) => {
      if (token) {
        const headers = req.headers.set('Authorization', 'Bearer ' + token);
        req = req.clone({ headers });
      }
      return next(req);
    })
  );
};
