import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateExerciseDto } from '../interfaces/dtos/exercise.dto';
import { GetMyExercisesResponse, GetExercisesResponse, GetExerciseResponse } from '../interfaces/responses/exercise.response';

@Injectable()
export class ExerciseService {
  private prefix = '/exercises';

  constructor(private readonly httpClient: HttpClient) {}

  public getMine(options?: object): Observable<GetMyExercisesResponse> {
    return this.httpClient.get<GetMyExercisesResponse>(this.prefix + '/me', options);
  }

  public getAll(options?: object): Observable<GetExercisesResponse> {
    return this.httpClient.get<GetExercisesResponse>(this.prefix, options);
  }

  public get(_id: string, includeTestCases: string, options?: object): Observable<GetExerciseResponse> {
    return this.httpClient.get<GetExerciseResponse>(this.prefix + '/' + _id, {
      ...options,
      params: { ...(options as any)?.params, includeTestCases },
    });
  }

  public create(createExerciseDto: CreateExerciseDto, options?: object): Observable<void> {
    return this.httpClient.post<void>(this.prefix, createExerciseDto, options);
  }
}
