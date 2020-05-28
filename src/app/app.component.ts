import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessageService],
})
export class AppComponent implements OnInit {
  public menuItems: MenuItem[] = [
    {
      label: 'My account',
      items: [
        { label: 'My solutions', routerLink: 'user/solutions' },
        { label: 'My exercises', routerLink: 'user/exercises' },
        { label: 'My settings', routerLink: 'user/settings' },
        { separator: true },
        { label: 'Logout', command: this.onLogoutClick.bind(this) },
      ],
    },
  ];

  public loggedIn: boolean;

  constructor(private readonly router: Router, private readonly authService: AuthService) {}

  public ngOnInit(): void {
    this.loggedIn = this.authService.isLoggedIn();
    this.authService.loggedInChange.subscribe(loggedIn => (this.loggedIn = loggedIn));
  }

  private onLogoutClick(): void {
    this.authService.logout();
    this.router.navigateByUrl('/user/login');
  }
}
