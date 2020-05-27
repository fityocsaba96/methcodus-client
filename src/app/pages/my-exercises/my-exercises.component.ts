import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_NAME } from '../../../constants';

@Component({
  selector: 'app-my-exercises',
  templateUrl: 'my-exercises.component.html',
})
export class MyExercisesComponent implements OnInit {
  constructor(private readonly title: Title) {}

  public ngOnInit() {
    this.title.setTitle(`My Exercises | ${APP_NAME}`);
  }
}
