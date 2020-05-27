import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_NAME } from '../../../constants';

@Component({
  selector: 'app-add-exercise',
  templateUrl: 'add-exercise.component.html',
})
export class AddExerciseComponent implements OnInit {
  constructor(private readonly title: Title) {}

  public ngOnInit() {
    this.title.setTitle(`Add Exercise | ${APP_NAME}`);
  }
}
