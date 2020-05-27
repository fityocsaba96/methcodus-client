import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_NAME } from '../../../constants';

@Component({
  selector: 'app-user-settings',
  templateUrl: 'user-settings.component.html',
})
export class UserSettingsComponent implements OnInit {
  constructor(private readonly title: Title) {}

  public ngOnInit() {
    this.title.setTitle(`My Settings | ${APP_NAME}`);
  }
}
