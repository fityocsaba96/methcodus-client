import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { AddPairProgrammingRequestDto, PairEditedCodeDto } from '../interfaces/dtos/pair-programming.dto';
import { ErrorResponse } from '../interfaces/responses/error.response';
import { AddPairProgrammingRequestResponse } from '../interfaces/responses/pair-programming.response';
import { Observable } from 'rxjs';

@Injectable()
export class PairProgrammingService {
  constructor(private readonly socket: Socket) {}

  public connect(): void {
    this.socket.connect();
  }

  public disconnect(): void {
    this.socket.disconnect();
  }

  public sendAuthenticateMessage(jwtToken: string): Promise<boolean> {
    return new Promise(resolve => this.socket.emit('authenticate', jwtToken, resolve));
  }

  public sendAddPairProgrammingRequestMessage(
    addPairProgrammingRequestDto: AddPairProgrammingRequestDto,
  ): Promise<AddPairProgrammingRequestResponse | ErrorResponse> {
    return new Promise(resolve => this.socket.emit('add-pair-programming-request', addPairProgrammingRequestDto, resolve));
  }

  public sendPairConnectedMessage(): void {
    this.socket.emit('pair-connected');
  }

  public sendPairEditedCodeMessage(pairEditedCodeDto: PairEditedCodeDto): void {
    this.socket.emit('pair-edited-code', pairEditedCodeDto);
  }

  public sendForwardToPairMessage(forwardToPairDto: any): void {
    this.socket.emit('forward-to-pair', forwardToPairDto);
  }

  public onConnect(): Promise<void> {
    return this.socket.fromOneTimeEvent('connect');
  }

  public onPairConnected(): Promise<void> {
    return this.socket.fromOneTimeEvent('pair-connected');
  }

  public onPairDisconnected(): Promise<void> {
    return this.socket.fromOneTimeEvent('pair-disconnected');
  }

  public onPairEditedCode(): Observable<PairEditedCodeDto> {
    return this.socket.fromEvent('pair-edited-code');
  }

  public onForwardToPair(): Observable<any> {
    return this.socket.fromEvent('forward-to-pair');
  }
}
