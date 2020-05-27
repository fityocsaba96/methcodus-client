import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_NAME } from '../../../constants';

@Component({
  selector: 'app-my-settings',
  templateUrl: 'my-settings.component.html',
})
export class MySettingsComponent implements OnInit {
  constructor(private readonly title: Title) {}

  public ngOnInit() {
    this.title.setTitle(`My Settings | ${APP_NAME}`);
  }
}
