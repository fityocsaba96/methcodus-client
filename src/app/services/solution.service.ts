import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestOrCreateSolutionDto } from '../interfaces/dtos/solution.dto';
import { GetMySolutionsResponse, TestOrCreateSolutionResponse } from '../interfaces/responses/solution.response';

@Injectable()
export class SolutionService {
  private prefix = '/solutions';

  constructor(private readonly httpClient: HttpClient) {}

  public getMine(options?: object): Observable<GetMySolutionsResponse> {
    return this.httpClient.get<GetMySolutionsResponse>(this.prefix + '/me', options);
  }

  public testOrCreate(
    testOnly: string,
    testOrCreateSolutionDto: TestOrCreateSolutionDto,
    options?: object,
  ): Observable<TestOrCreateSolutionResponse | void> {
    return this.httpClient.post<TestOrCreateSolutionResponse | void>(this.prefix, testOrCreateSolutionDto, {
      ...options,
      params: { ...(options as any)?.params, testOnly },
    });
  }
}
