import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class APIInterceptor implements HttpInterceptor {
  constructor(private readonly router: Router, private readonly authService: AuthService) {}

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const requestUpdates: any = { url: process.env.SERVER_URI + request.url };
    if (this.authService.isLoggedIn()) {
      requestUpdates.setHeaders = { Authorization: 'Bearer ' + this.authService.jwtToken };
    }
    return next.handle(request.clone(requestUpdates)).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logout();
          if (this.router.url !== '/user/login') {
            this.router.navigateByUrl('/user/login');
          }
        }
        return throwError(error);
      }),
    );
  }
}
