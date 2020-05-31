import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { PairProgrammingRequestService } from './services/pair-programming-request.service';
import { GetMyPairProgrammingRequestResponse } from './interfaces/responses/pair-programming-request.response';
import { values } from 'ramda';
import { transformLanguage, transformMethod } from './lib/transform-exercise-properties';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessageService],
})
export class AppComponent implements OnInit {
  private menu: { [name: string]: MenuItem } = {
    pairProgrammingRequest: { styleClass: 'pair-programming-request', visible: false },
    separator: { separator: true, visible: false },
    myAccount: {
      label: 'My account',
      items: [{ label: 'Logout', command: this.onLogoutClick.bind(this) }],
    },
  };

  public menuItems: MenuItem[] = values(this.menu);

  public loggedIn: boolean;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly pairProgrammingRequestService: PairProgrammingRequestService,
  ) {}

  public ngOnInit(): void {
    this.loggedIn = this.authService.isLoggedIn();
    this.authService.loggedInChange.subscribe(loggedIn => (this.loggedIn = loggedIn));
    this.pairProgrammingRequestService.checkPairProgrammingRequest.subscribe(this.checkPairProgrammingRequest.bind(this));
    if (this.loggedIn) {
      this.checkPairProgrammingRequest();
    }
  }

  public checkPairProgrammingRequest(): void {
    this.pairProgrammingRequestService.getMine().subscribe(this.handlePairProgrammingRequest.bind(this));
  }

  private handlePairProgrammingRequest(response: GetMyPairProgrammingRequestResponse | void): void {
    if (response !== null) {
      this.showPairProgrammingRequest(response as GetMyPairProgrammingRequestResponse);
    } else {
      this.hidePairProgrammingRequest();
    }
  }

  private showPairProgrammingRequest(response: GetMyPairProgrammingRequestResponse): void {
    this.menu.pairProgrammingRequest.label = this.generatePairProgrammingRequestLabel(response);
    this.menu.pairProgrammingRequest.routerLink = `exercises/${response.exerciseId}/solve`;
    this.menu.pairProgrammingRequest.queryParams = {
      language: response.programmingLanguage,
      method: response.softwareDevelopmentMethod,
      pairId: response.pairUser._id,
      pairUserName: response.pairUser.userName,
    };
    this.menu.pairProgrammingRequest.visible = true;
    this.menu.separator.visible = true;
  }

  private hidePairProgrammingRequest(): void {
    this.menu.pairProgrammingRequest.visible = false;
    this.menu.separator.visible = false;
  }

  private generatePairProgrammingRequestLabel(response: GetMyPairProgrammingRequestResponse): string {
    const language = transformLanguage(response.programmingLanguage);
    const method = transformMethod(response.softwareDevelopmentMethod);
    return `${response.pairUser.userName} sent you a programming request! (${language} with ${method})`;
  }

  private onLogoutClick(): void {
    this.authService.logout();
    this.router.navigateByUrl('/user/login');
  }
}
