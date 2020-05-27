import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class RoutingGuard implements CanActivate {
  constructor(private readonly router: Router, private readonly authService: AuthService) {}

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const allowedLoggedInState = route.data.allowedLoggedInState;
    if (this.authService.isLoggedIn()) {
      if (!allowedLoggedInState) {
        this.router.navigateByUrl('/exercises');
      }
      return allowedLoggedInState;
    } else {
      if (allowedLoggedInState) {
        this.router.navigateByUrl('/user/login');
      }
      return !allowedLoggedInState;
    }
  }
}
