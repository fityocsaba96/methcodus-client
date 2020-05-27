import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_NAME } from '../../../constants';

@Component({
  selector: 'app-user-solutions',
  templateUrl: 'user-solutions.component.html',
})
export class UserSolutionsComponent implements OnInit {
  constructor(private readonly title: Title) {}

  public ngOnInit() {
    this.title.setTitle(`My Solutions | ${APP_NAME}`);
  }
}
