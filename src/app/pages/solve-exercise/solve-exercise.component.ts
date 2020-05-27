import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_NAME } from '../../../constants';

@Component({
  selector: 'app-solve-exercise',
  templateUrl: 'solve-exercise.component.html',
})
export class SolveExerciseComponent implements OnInit {
  constructor(private readonly title: Title) {}

  public ngOnInit() {
    this.title.setTitle(`Solve Exercise | ${APP_NAME}`);
  }
}
