import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { LoginResponse } from '../interfaces/responses/auth.response';
import { LoginDto } from '../interfaces/dtos/auth.dto';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthService {
  private prefix = '/auth';
  private loggedInChangeSubject: Subject<boolean> = new Subject();

  constructor(private readonly httpClient: HttpClient) {}

  public get loggedInChange(): Subject<boolean> {
    return this.loggedInChangeSubject;
  }

  public login(loginDto: LoginDto, options?: object): Observable<LoginResponse> {
    return this.httpClient
      .post<LoginResponse>(this.prefix + '/login', loginDto, options)
      .pipe(tap(() => this.loggedInChangeSubject.next(true)));
  }

  public get jwtToken(): string {
    return localStorage.getItem('userJWTToken');
  }

  public isLoggedIn(): boolean {
    return this.jwtToken !== null;
  }

  public logout(): void {
    localStorage.removeItem('userJWTToken');
    this.loggedInChangeSubject.next(false);
  }
}
