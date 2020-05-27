import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_NAME } from '../../../constants';

@Component({
  selector: 'app-register',
  templateUrl: 'register.component.html',
})
export class RegisterComponent implements OnInit {
  constructor(private readonly title: Title) {}

  public ngOnInit() {
    this.title.setTitle(`Register | ${APP_NAME}`);
  }
}
