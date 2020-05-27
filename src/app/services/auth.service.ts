import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginResponse } from '../interfaces/responses/auth.response';
import { LoginDto } from '../interfaces/dtos/auth.dto';

@Injectable()
export class AuthService {
  private prefix = '/auth';

  constructor(private readonly httpClient: HttpClient) {}

  public login(loginDto: LoginDto, options?: object): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(this.prefix + '/login', loginDto, options);
  }

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
