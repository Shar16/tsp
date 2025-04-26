import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  if (request.url.includes('/api/users/login')) {
    return next(request);
  }

  if (request.url.includes('/api/users/logout')) {
    return next(request);
  }

  const token = authService.getToken();
  console.log('Token when interceptor:', token);

  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(request);
};
