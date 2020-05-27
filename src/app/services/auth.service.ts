import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {
  constructor() {}

  public get jwtToken(): string {
    return localStorage.getItem('userJWTToken');
  }

  public isLoggedIn(): boolean {
    return this.jwtToken !== null;
  }

  public logout(): void {
    localStorage.removeItem('userJWTToken');
  }
}
