import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_NAME } from '../../../constants';

@Component({
  selector: 'app-user-exercises',
  templateUrl: 'user-exercises.component.html',
})
export class UserExercisesComponent implements OnInit {
  constructor(private readonly title: Title) {}

  public ngOnInit() {
    this.title.setTitle(`My Exercises | ${APP_NAME}`);
  }
}
