import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetMyPairProgrammingRequestResponse } from '../interfaces/responses/pair-programming-request.response';

@Injectable()
export class PairProgrammingRequestService {
  private prefix = '/pair-programming-requests';

  constructor(private readonly httpClient: HttpClient) {}

  public getMine(options?: object): Observable<GetMyPairProgrammingRequestResponse | void> {
    return this.httpClient.get<GetMyPairProgrammingRequestResponse | void>(this.prefix + '/me', options);
  }
}
