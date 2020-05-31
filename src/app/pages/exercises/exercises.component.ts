import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_NAME } from '../../../constants';
import { ExerciseService } from '../../services/exercise.service';
import { GetMyExercisesResponse } from '../../interfaces/responses/exercise.response';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { prop } from 'ramda';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

type ExerciseConfig = { name: string; value: string };

@Component({
  selector: 'app-exercises',
  templateUrl: 'exercises.component.html',
  styleUrls: ['exercises.component.css'],
})
export class ExercisesComponent implements OnInit {
  public exercises: GetMyExercisesResponse;
  public descriptions: { [_id: string]: string } = {};

  public languages: ExerciseConfig[] = [
    { name: 'JavaScript', value: 'javascript' },
    { name: 'Java', value: 'java' },
  ];
  public methods: ExerciseConfig[] = [
    { name: 'none', value: 'none' },
    { name: 'test driven development', value: 'tdd' },
    { name: 'pair programming', value: 'pair-programming' },
    { name: 'ping pong method', value: 'ping-pong' },
  ];
  public selectedLanguage: ExerciseConfig;
  public selectedMethod: ExerciseConfig;

  constructor(
    private readonly title: Title,
    private readonly router: Router,
    private readonly exerciseService: ExerciseService,
    private readonly messageService: MessageService,
  ) {}

  public ngOnInit() {
    this.title.setTitle(`Exercises | ${APP_NAME}`);
    this.exerciseService.getAll().subscribe({ next: response => (this.exercises = response.reverse()) });
  }

  public loadExerciseDescription(_id: string): Observable<string> {
    return this.exerciseService.get(_id, 'false').pipe(
      tap(response => (this.descriptions[_id] = response.description)),
      map(prop('description')),
    );
  }

  public navigateToSolveExercise(_id: string): void {
    if (this.selectedLanguage === undefined || this.selectedMethod === undefined) {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: 'Please fill in the options to begin solving the exercise',
        life: 5000,
      });
    } else {
      this.router.navigate([`/exercises/${_id}/solve`], {
        queryParams: { language: this.selectedLanguage.value, method: this.selectedMethod.value },
      });
    }
  }
}
