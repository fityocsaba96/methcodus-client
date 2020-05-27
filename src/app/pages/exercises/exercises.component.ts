import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_NAME } from '../../../constants';

@Component({
  selector: 'app-exercises',
  templateUrl: 'exercises.component.html',
})
export class ExercisesComponent implements OnInit {
  constructor(private readonly title: Title) {}

  public ngOnInit() {
    this.title.setTitle(`Exercises | ${APP_NAME}`);
  }
}
