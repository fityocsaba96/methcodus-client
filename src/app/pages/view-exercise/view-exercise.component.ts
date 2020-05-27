import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_NAME } from '../../../constants';

@Component({
  selector: 'app-view-exercise',
  templateUrl: 'view-exercise.component.html',
})
export class ViewExerciseComponent implements OnInit {
  constructor(private readonly title: Title) {}

  public ngOnInit() {
    this.title.setTitle(`View Exercise | ${APP_NAME}`);
  }
}
