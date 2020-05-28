import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_NAME } from '../../../constants';
import { LoginDto } from '../../interfaces/dtos/auth.dto';
import { AuthService } from '../../services/auth.service';
import { LoginResponse } from '../../interfaces/responses/auth.response';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { map } from 'ramda';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css'],
})
export class LoginComponent implements OnInit {
  public loginDto: Partial<LoginDto> = {};

  constructor(
    private readonly title: Title,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
  ) {}

  public ngOnInit() {
    this.title.setTitle(`Login | ${APP_NAME}`);
  }

  public login(): void {
    this.authService
      .login(this.loginDto as LoginDto)
      .subscribe({ next: this.handleSuccessfulLogin.bind(this), error: this.showLoginErrors.bind(this) });
  }

  private handleSuccessfulLogin(loginResponse: LoginResponse): void {
    this.authService.jwtToken = loginResponse.access_token;
    this.router.navigateByUrl('/exercises');
    this.messageService.add({ key: 'toast', severity: 'success', summary: 'Login successful', life: 5000, closable: true });
  }

  private showLoginErrors({ error: { errors } }: HttpErrorResponse): void {
    this.messageService.add({
      key: 'toast',
      severity: 'error',
      summary: 'Login failed',
      detail: 'Check the errors for details',
      life: 5000,
    });
    this.messageService.clear('error');
    this.messageService.addAll(
      map(
        error => ({
          key: 'error',
          severity: 'error',
          detail: error,
        }),
        errors,
      ),
    );
  }
}
