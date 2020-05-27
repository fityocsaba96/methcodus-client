import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUserDto, UpdateUserDto } from '../interfaces/dtos/user.dto';

@Injectable()
export class UserService {
  private prefix = '/users';

  constructor(private readonly httpClient: HttpClient) {}

  public create(createUserDto: CreateUserDto, options?: object): Observable<void> {
    return this.httpClient.post<void>(this.prefix, createUserDto, options);
  }

  public updateMine(updateUserDto: UpdateUserDto, options?: object): Observable<void> {
    return this.httpClient.put<void>(this.prefix + '/me', updateUserDto, options);
  }
}
