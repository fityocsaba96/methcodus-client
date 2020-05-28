import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_NAME } from '../../../constants';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CreateUserDto } from '../../interfaces/dtos/user.dto';
import { UserService } from '../../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { map } from 'ramda';

@Component({
  selector: 'app-register',
  templateUrl: 'register.component.html',
  styleUrls: ['register.component.css'],
})
export class RegisterComponent implements OnInit {
  public createUserDto: Partial<CreateUserDto> = {};

  constructor(
    private readonly title: Title,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly userService: UserService,
  ) {}

  public ngOnInit() {
    this.title.setTitle(`Register | ${APP_NAME}`);
  }

  public register(): void {
    this.userService
      .create(this.createUserDto as CreateUserDto)
      .subscribe({ next: this.handleSuccessfulRegister.bind(this), error: this.showRegisterErrors.bind(this) });
  }

  private handleSuccessfulRegister(): void {
    this.router.navigateByUrl('/user/login');
    this.messageService.add({
      key: 'toast',
      severity: 'success',
      summary: 'Registration successful',
      detail: 'You can now login',
      life: 5000,
      closable: true,
    });
  }

  private showRegisterErrors({ error: { errors } }: HttpErrorResponse): void {
    this.messageService.add({
      key: 'toast',
      severity: 'error',
      summary: 'Registration failed',
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
