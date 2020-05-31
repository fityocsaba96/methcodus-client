import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_NAME } from '../../../constants';
import { CreateExerciseDto } from '../../interfaces/dtos/exercise.dto';
import { MessageService, Message } from 'primeng/api';
import { ExerciseService } from '../../services/exercise.service';
import { HttpErrorResponse } from '@angular/common/http';
import { map } from 'ramda';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-exercise',
  templateUrl: 'add-exercise.component.html',
})
export class AddExerciseComponent implements OnInit {
  public createExerciseDto: Partial<CreateExerciseDto> = {};
  public testCases: string;
  public addExerciseFailedMessage: Message = {
    key: 'toast',
    severity: 'error',
    summary: 'Exercise creation failed',
    detail: 'Check the errors for details',
    life: 5000,
  };

  constructor(
    private readonly title: Title,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly exerciseService: ExerciseService,
  ) {}

  public ngOnInit() {
    this.title.setTitle(`Add Exercise | ${APP_NAME}`);
  }

  public addExercise(): void {
    if (this.parseTestCases()) {
      this.exerciseService.create(this.createExerciseDto as CreateExerciseDto).subscribe({
        next: this.showExerciseAddedMessage.bind(this),
        error: this.showAddExerciseErrors.bind(this),
      });
    }
  }

  private parseTestCases(): boolean {
    try {
      this.createExerciseDto.testCases = JSON.parse(this.testCases);
      return true;
    } catch {
      this.messageService.add(this.addExerciseFailedMessage);
      this.messageService.clear('error');
      this.messageService.add({
        key: 'error',
        severity: 'error',
        detail: 'Test cases must be a valid JSON object!',
      });
      return false;
    }
  }

  private showExerciseAddedMessage(): void {
    this.router.navigateByUrl('/exercises');
    this.messageService.add({ key: 'toast', severity: 'success', summary: 'Exercise added successfully', life: 5000, closable: true });
  }

  private showAddExerciseErrors({ error: { errors } }: HttpErrorResponse): void {
    this.messageService.add(this.addExerciseFailedMessage);
    this.messageService.clear('error');
    this.messageService.addAll(
      map(
        error => ({
          key: 'error',
          severity: 'error',
          detail: error,
        }),
        errors,
      ),
    );
  }
}
