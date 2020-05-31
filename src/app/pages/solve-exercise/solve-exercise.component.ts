import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_NAME } from '../../../constants';
import { ActivatedRoute, Router } from '@angular/router';
import { ExerciseService } from '../../services/exercise.service';
import { GetExerciseResponse } from '../../interfaces/responses/exercise.response';
import { CodeEditorActionEvent, CodeEditorEditMode } from '../../components/code-editor/code-editor.component.interface';
import { TestResults, TestOrCreateSolutionResponse } from '../../interfaces/responses/solution.response';
import { map, set, lensProp, all, propEq, equals, difference } from 'ramda';
import { CodeEditorComponent } from '../../components/code-editor/code-editor.component';
import { SolutionService } from '../../services/solution.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { transformLanguage, transformMethod } from '../../lib/transform-exercise-properties';
import { PairProgrammingService } from '../../services/pair-programming.service';
import { ErrorResponse } from '../../interfaces/responses/error.response';
import { AddPairProgrammingRequestResponse } from '../../interfaces/responses/pair-programming.response';
import { AuthService } from '../../services/auth.service';
import { PairEditedCodeDto } from '../../interfaces/dtos/pair-programming.dto';
import { PairProgrammingRequestService } from '../../services/pair-programming-request.service';
import { TestOrCreateSolutionDto } from '../../interfaces/dtos/solution.dto';

@Component({
  selector: 'app-solve-exercise',
  templateUrl: 'solve-exercise.component.html',
  styleUrls: ['solve-exercise.component.css'],
})
export class SolveExerciseComponent implements OnInit, OnDestroy {
  @ViewChild('solutionCodeEditor')
  private solutionCodeEditor: CodeEditorComponent;
  @ViewChild('testCodeEditor')
  private testCodeEditor?: CodeEditorComponent;
  @ViewChild('functionCallCode')
  private functionCallCodeInput: ElementRef<HTMLInputElement>;

  private exerciseId: string;
  private pairId?: string;
  private requester?: boolean;

  public tddStage?: string;
  public nextPlayer?: string;
  public pairUserName?: string;
  public method: string;
  public language: string;
  public transformedMethod: string;
  public transformedLanguage: string;

  public sendPairProgrammingRequestButtonLabel = 'Send';
  public testButtonLabel = 'Test';
  public submitButtonLabel = 'Submit';
  public sendPairProgrammingRequestButtonDisabled = false;
  public testButtonDisabled = true;
  public submitButtonDisabled = true;
  public functionCallCodeInputDisabled = true;
  public solutionCodeEditorEditMode: CodeEditorEditMode = CodeEditorEditMode.Inactive;
  public testCodeEditorEditMode: CodeEditorEditMode = CodeEditorEditMode.Inactive;
  public functionCallCode: string;
  public displaySendPairProgrammingRequestDialog = false;
  public pairConnected = false;

  public tddOrPingPong: boolean;
  public pairProgrammingOrPingPong: boolean;

  public readonly testResultsColumns = [{ field: 'name' }, { field: 'status' }];
  public builtInTestResults: TestResults['results'];
  public ownTestResults?: TestResults['results'];
  public builtInLastSuccessfulTestResults: TestResults['results'];
  public ownLastSuccessfulTestResults?: TestResults['results'];
  public exerciseDetails: GetExerciseResponse;

  constructor(
    private readonly title: Title,
    private readonly activatedRoute: ActivatedRoute,
    private readonly exerciseService: ExerciseService,
    private readonly solutionService: SolutionService,
    private readonly messageService: MessageService,
    private readonly pairProgrammingService: PairProgrammingService,
    private readonly pairProgrammingRequestService: PairProgrammingRequestService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  public ngOnInit(): void {
    this.title.setTitle(`Solve Exercise | ${APP_NAME}`);
    this.setExerciseParameters();
    this.exerciseService
      .get(this.exerciseId, 'true')
      .subscribe({ next: this.startSolving.bind(this), error: () => this.router.navigateByUrl('/exercises') });
  }

  public ngOnDestroy(): void {
    this.disconnectWebSocket();
  }

  @HostListener('window:beforeunload')
  public disconnectWebSocket() {
    if (this.pairProgrammingOrPingPong) {
      this.pairProgrammingService.disconnect();
    }
  }

  public test(): void {
    this.testOrSubmit(true);
  }

  public submit(): void {
    this.testOrSubmit(false);
  }

  private testOrSubmit(testOnly: boolean): void {
    const testSolutionDto: TestOrCreateSolutionDto = {
      exerciseId: this.exerciseId,
      functionCallCode: this.functionCallCode,
      programmingLanguage: this.language,
      softwareDevelopmentMethod: this.method,
      solutionCode: this.solutionCodeEditor.value,
    };
    if (this.pairProgrammingOrPingPong) {
      this.pairProgrammingService.sendForwardToPairMessage({ action: testOnly ? 'pair-started-testing' : 'pair-started-submit' });
      testSolutionDto.pairUserId = this.pairId;
    }
    if (this.tddOrPingPong) {
      testSolutionDto.testCode = this.testCodeEditor.value;
    }
    this.submitButtonDisabled = true;
    this.testButtonDisabled = true;
    if (testOnly) {
      this.testButtonLabel = 'Testing...';
    } else {
      this.submitButtonLabel = 'Submitting...';
    }
    this.solutionService.testOrCreate(String(testOnly), testSolutionDto).subscribe({
      next: response => {
        if (response === null) {
          if (this.pairProgrammingOrPingPong) {
            this.pairProgrammingService.sendForwardToPairMessage({
              action: 'pair-ended-submit',
              data: response,
              status: 204,
            });
          }
          this.handleSubmitted();
        } else {
          if (this.pairProgrammingOrPingPong) {
            this.pairProgrammingService.sendForwardToPairMessage({
              action: testOnly ? 'pair-ended-testing' : 'pair-ended-submit',
              data: response,
              status: 201,
            });
          }
          this.handleTestOrSubmitSuccess(response as TestOrCreateSolutionResponse, testOnly);
        }
      },
      error: ({ error: { errors } }: HttpErrorResponse) => {
        if (this.pairProgrammingOrPingPong) {
          this.pairProgrammingService.sendForwardToPairMessage({
            action: testOnly ? 'pair-ended-testing' : 'pair-ended-submit',
            data: errors,
            status: 400,
          });
        }
        this.handleTestOrSubmitError(errors, testOnly);
      },
    });
  }

  private handleSubmitted(): void {
    this.submitButtonLabel = 'Submit';
    this.functionCallCodeInputDisabled = true;
    this.solutionCodeEditorEditMode = CodeEditorEditMode.Inactive;
    this.testCodeEditorEditMode = CodeEditorEditMode.Inactive;
    this.showToast('success', 'Solution submitted successfully');
    this.showMessages(['Congratulations! You have successfully solved this exercise, your solution is now submitted!'], 'error', 'success');
  }

  private handleTestOrSubmitSuccess(response: TestOrCreateSolutionResponse, testOnly: boolean): void {
    if (response.builtInTestResults.results !== undefined) {
      this.builtInTestResults = this.transformTestResults(response.builtInTestResults.results);
    }
    if (response.ownTestResults && response.ownTestResults.results !== undefined) {
      this.ownTestResults = response.ownTestResults.results;
    }
    if (response.builtInTestResults.results !== undefined && (!response.ownTestResults || response.ownTestResults.results !== undefined)) {
      if (testOnly) {
        this.showToast('success', 'Solution tested successfully', 'Check the test results for details');
        this.showMessages([]);
        if (this.tddOrPingPong) {
          switch (this.tddStage) {
            case 'TEST':
              const ownTestResultsDifference = difference(this.ownTestResults, this.ownLastSuccessfulTestResults);
              const newOwnTestIsFailing =
                this.ownTestResults.length === this.ownLastSuccessfulTestResults.length + 1 &&
                ownTestResultsDifference.length === 1 &&
                ownTestResultsDifference[0].status === 'fail';
              if (newOwnTestIsFailing) {
                this.tddStage = 'CODE';
                if (this.method === 'ping-pong') {
                  this.nextPlayer = this.nextPlayer === 'your' ? this.pairUserName + `'s` : 'your';
                  this.showToast('info', `Now comes the CODE stage and now the control is in ${this.nextPlayer} hands`);
                  if (this.nextPlayer === 'your') {
                    this.functionCallCodeInputDisabled = false;
                    this.solutionCodeEditorEditMode = CodeEditorEditMode.Normal;
                  } else {
                    this.functionCallCodeInputDisabled = true;
                    this.testCodeEditorEditMode = CodeEditorEditMode.Inactive;
                  }
                } else {
                  this.showToast('info', 'Now comes the CODE stage');
                  this.solutionCodeEditorEditMode = CodeEditorEditMode.Normal;
                  this.testCodeEditorEditMode = CodeEditorEditMode.Inactive;
                }
                this.builtInLastSuccessfulTestResults = this.builtInTestResults;
                this.ownLastSuccessfulTestResults = this.ownTestResults;
              } else {
                this.showToast(
                  'info',
                  'Cannot continue to CODE stage',
                  'You have not added a new test or have added more than one new tests or your new test is not failing or you have modified previous tests, please continue to work on it',
                );
              }
              break;
            case 'CODE':
              if (this.isTestsPassed(response.ownTestResults)) {
                this.tddStage = 'REFACTOR';
                this.showToast('info', 'Now comes the REFACTOR stage');
                if (this.method === 'tdd' || this.nextPlayer === 'your') {
                  this.testCodeEditorEditMode = CodeEditorEditMode.Normal;
                }
                this.builtInLastSuccessfulTestResults = this.builtInTestResults;
                this.ownLastSuccessfulTestResults = this.ownTestResults;
              } else {
                this.showToast(
                  'info',
                  'Cannot continue to REFACTOR stage',
                  'Some of your tests have failed, please continue to work on it',
                );
              }
              break;
            case 'REFACTOR':
              if (this.isTestsPassed(response.ownTestResults) && equals(this.builtInTestResults, this.builtInLastSuccessfulTestResults)) {
                this.tddStage = 'TEST';
                this.showToast('info', 'Now comes the TEST stage');
                if (this.method === 'tdd' || this.nextPlayer === 'your') {
                  this.solutionCodeEditorEditMode = CodeEditorEditMode.Inactive;
                }
                this.builtInLastSuccessfulTestResults = this.builtInTestResults;
                this.ownLastSuccessfulTestResults = this.ownTestResults;
              } else {
                this.showToast(
                  'info',
                  'Cannot continue to TEST stage',
                  'Status of some built in or your own tests have changed while refactoring, please continue to work on it',
                );
              }
              break;
          }
        }
        if (this.isAllTestsPassed(response) && (this.method !== 'ping-pong' || this.nextPlayer === 'your')) {
          this.showToast('info', 'All tests passed', 'You can now submit your solution');
          this.submitButtonDisabled = false;
        } else {
          this.submitButtonDisabled = true;
        }
      } else {
        this.showToast('error', 'Submitting solution failed', 'Check the errors for details');
        this.showMessages(['You have modified the code since the last testing and now not all tests pass!']);
      }
    } else {
      const errors = [];
      if (response.builtInTestResults.results === undefined) {
        this.builtInTestResults = this.transformTestResults(map(set(lensProp('status'), 'skip'), this.builtInTestResults));
        errors.push(response.builtInTestResults.error);
      }
      if (response.ownTestResults && response.ownTestResults.results === undefined) {
        this.ownTestResults = map(set(lensProp('status'), 'skip'), this.ownTestResults);
        errors.push(response.ownTestResults.error);
      }
      if (response.builtInTestResults.results === undefined || (response.ownTestResults && response.ownTestResults.results === undefined)) {
        this.showToast('error', `${testOnly ? 'Testing' : 'Submitting'} solution failed`, 'Check the errors for details');
        this.showMessages(errors);
      }
    }
    if (this.method !== 'ping-pong' || this.nextPlayer === 'your') {
      this.testButtonDisabled = false;
    }
    if (testOnly) {
      this.testButtonLabel = 'Test';
    } else {
      this.submitButtonLabel = 'Submit';
    }
  }

  private handleTestOrSubmitError(errors: string[], testOnly: boolean): void {
    this.showToast('error', `${testOnly ? 'Testing' : 'Submitting'} solution failed`, 'Check the errors for details');
    this.showMessages(errors);
    if (this.method !== 'ping-pong' || this.nextPlayer === 'your') {
      this.testButtonDisabled = false;
    }
    if (testOnly) {
      this.testButtonLabel = 'Test';
    } else {
      this.submitButtonLabel = 'Submit';
    }
  }

  private isAllTestsPassed(response: TestOrCreateSolutionResponse): boolean {
    return (
      this.isTestsPassed(response.builtInTestResults) &&
      (response.ownTestResults === undefined || this.isTestsPassed(response.ownTestResults))
    );
  }

  private isTestsPassed(testResults: TestResults): boolean {
    return testResults.error === undefined && all(propEq('status', 'pass'), testResults.results);
  }

  public solutionCodeEditorAction(event: CodeEditorActionEvent): void {
    if (this.pairProgrammingOrPingPong) {
      if (this.method === 'pair-programming') {
        event.cancel();
      }
      this.pairProgrammingService.sendPairEditedCodeMessage({ action: event.action, codeEditorId: 0 });
    }
  }

  public testCodeEditorAction(event: CodeEditorActionEvent): void {
    if (this.method === 'ping-pong') {
      this.pairProgrammingService.sendPairEditedCodeMessage({ action: event.action, codeEditorId: 1 });
    }
  }

  public insertFunctionCallCodeHelperAndSendMessageToPair(): void {
    if (this.pairProgrammingOrPingPong) {
      this.pairProgrammingService.sendForwardToPairMessage({
        action: 'pair-edited-function-call-code',
        data: { functionCallCode: this.functionCallCodeInput.nativeElement.value },
      });
    }
    this.insertFunctionCallCodeHelper();
  }

  private insertFunctionCallCodeHelper(): void {
    const input = this.functionCallCodeInput.nativeElement;
    const helperText = '(parameters)';
    if (input.value.length === 1) {
      this.functionCallCode = input.value;
      input.value += helperText;
      input.selectionEnd = 1;
    } else if (input.value === helperText) {
      this.functionCallCode = input.value = '';
    } else if (!input.value.endsWith(helperText)) {
      input.value = this.functionCallCode + helperText;
      input.selectionEnd = this.functionCallCode.length;
    } else {
      this.functionCallCode = input.value.substring(0, input.value.length - helperText.length);
    }
  }

  public async sendPairProgrammingRequest(): Promise<void> {
    this.sendPairProgrammingRequestButtonDisabled = true;
    this.sendPairProgrammingRequestButtonLabel = 'Sending...';
    const response = await this.pairProgrammingService.sendAddPairProgrammingRequestMessage({
      programmingLanguage: this.language,
      softwareDevelopmentMethod: this.method,
      exerciseId: this.exerciseId,
      pairUserName: this.pairUserName,
    });
    if ((response as ErrorResponse).errors !== undefined) {
      this.showToast('error', 'Sending programming request failed', 'Check the errors for details');
      this.showMessages((response as ErrorResponse).errors, 'sendPairProgrammingRequestError');
      this.sendPairProgrammingRequestButtonDisabled = false;
      this.sendPairProgrammingRequestButtonLabel = 'Send';
    } else {
      this.pairId = (response as AddPairProgrammingRequestResponse)._id;
      this.showMessages(['Waiting for pair to connect...'], 'sendPairProgrammingRequestError', 'info');
      this.showToast('success', 'Programming request has been sent successfully', 'Now waiting for pair to connect');
      this.sendPairProgrammingRequestButtonLabel = 'Send';
    }
  }

  private showToast(severity: string, summary: string, detail?: string): void {
    this.messageService.add({ key: 'toast', severity, summary, detail, life: 5000 });
  }

  private showMessages(details: string[], key: string = 'error', severity: string = 'error'): void {
    this.messageService.clear(key);
    this.messageService.addAll(map(detail => ({ key, severity, detail }), details));
  }

  private async startSolving(getExerciseResponse: GetExerciseResponse): Promise<void> {
    this.showExerciseDetails(getExerciseResponse);
    if (this.pairProgrammingOrPingPong) {
      this.pairProgrammingService.connect();
      await this.pairProgrammingService.onConnect();
      await this.pairProgrammingService.sendAuthenticateMessage('Bearer ' + this.authService.jwtToken);
      if (this.requester) {
        this.displaySendPairProgrammingRequestDialog = true;
      } else {
        this.pairProgrammingService.sendPairConnectedMessage();
      }
      this.pairProgrammingService.onPairEditedCode().subscribe({
        next: (pairEditedCodeDto: PairEditedCodeDto) => {
          switch (pairEditedCodeDto.codeEditorId) {
            case 0:
              this.solutionCodeEditor.executeAction(pairEditedCodeDto.action);
              break;
            case 1:
              this.testCodeEditor.executeAction(pairEditedCodeDto.action);
              break;
          }
        },
      });
      this.pairProgrammingService.onForwardToPair().subscribe({
        next: (forwardToPairDto: any) => {
          switch (forwardToPairDto.action) {
            case 'pair-edited-function-call-code':
              this.functionCallCodeInput.nativeElement.value = forwardToPairDto.data.functionCallCode;
              this.insertFunctionCallCodeHelper();
              break;
            case 'pair-started-testing':
              this.testButtonDisabled = true;
              this.submitButtonDisabled = true;
              this.testButtonLabel = 'Testing...';
              break;
            case 'pair-ended-testing':
              const testingResponse = forwardToPairDto.data as TestOrCreateSolutionResponse | string[];
              switch (forwardToPairDto.status) {
                case 201:
                  this.handleTestOrSubmitSuccess(testingResponse as TestOrCreateSolutionResponse, true);
                  break;
                case 400:
                  this.handleTestOrSubmitError(testingResponse as string[], true);
                  break;
              }
              break;
            case 'pair-started-submit':
              this.testButtonDisabled = true;
              this.submitButtonDisabled = true;
              this.submitButtonLabel = 'Submitting...';
              break;
            case 'pair-ended-submit':
              const submitResponse = forwardToPairDto.data as void | TestOrCreateSolutionResponse | string[];
              switch (forwardToPairDto.status) {
                case 201:
                  this.handleTestOrSubmitSuccess(testingResponse as TestOrCreateSolutionResponse, false);
                  break;
                case 204:
                  this.handleSubmitted();
                  break;
                case 400:
                  this.handleTestOrSubmitError(testingResponse as string[], false);
                  break;
              }
              break;
          }
        },
      });
      this.pairProgrammingService.onPairDisconnected().then(() => {
        this.solutionCodeEditorEditMode = this.testCodeEditorEditMode = CodeEditorEditMode.Inactive;
        this.testButtonDisabled = this.submitButtonDisabled = this.functionCallCodeInputDisabled = true;
        this.showMessages(['Pair is disconnected!'], 'error', 'info');
        this.showToast('info', 'Pair has disconnected');
      });
      await this.pairProgrammingService.onPairConnected();
      this.pairConnected = true;
      this.showToast('info', 'Pair has connected');
      if (this.requester) {
        this.displaySendPairProgrammingRequestDialog = false;
      } else {
        this.pairProgrammingRequestService.checkPairProgrammingRequest.next();
      }
      if (this.method === 'pair-programming') {
        this.solutionCodeEditorEditMode = CodeEditorEditMode.Normal;
        this.testButtonDisabled = false;
        this.functionCallCodeInputDisabled = false;
      } else {
        this.tddStage = 'TEST';
        this.ownTestResults = [];
        this.ownLastSuccessfulTestResults = [];
        if (this.requester) {
          this.testCodeEditorEditMode = CodeEditorEditMode.Normal;
          this.testButtonDisabled = false;
          this.functionCallCodeInputDisabled = false;
          this.nextPlayer = 'your';
        } else {
          this.nextPlayer = this.pairUserName + `'s`;
        }
      }
    } else if (this.method === 'tdd') {
      this.tddStage = 'TEST';
      this.ownTestResults = [];
      this.ownLastSuccessfulTestResults = [];
      this.testCodeEditorEditMode = CodeEditorEditMode.Normal;
      this.testButtonDisabled = false;
      this.functionCallCodeInputDisabled = false;
    } else if (this.method === 'none') {
      this.solutionCodeEditorEditMode = CodeEditorEditMode.Normal;
      this.testButtonDisabled = false;
      this.functionCallCodeInputDisabled = false;
    }
  }

  private showExerciseDetails(getExerciseResponse: GetExerciseResponse): void {
    this.exerciseDetails = getExerciseResponse;
    this.builtInTestResults = this.transformTestResults(
      map(testCase => ({ name: testCase.description, status: 'skip' }), getExerciseResponse.testCases),
    );
    if (this.tddOrPingPong) {
      this.builtInLastSuccessfulTestResults = this.builtInTestResults;
    }
  }

  private transformTestResults(testResults: TestResults['results']): TestResults['results'] {
    if (this.tddOrPingPong) {
      return map(
        testResult => ({ name: testResult.status === 'pass' ? testResult.name : '(hidden until passed)', status: testResult.status }),
        testResults,
      );
    } else {
      return testResults;
    }
  }

  private setExerciseParameters(): void {
    this.exerciseId = this.activatedRoute.snapshot.params.id;
    const queryParams = this.activatedRoute.snapshot.queryParams;
    this.language = queryParams.language;
    this.transformedLanguage = transformLanguage(this.language);
    this.method = queryParams.method;
    this.transformedMethod = transformMethod(this.method);
    this.tddOrPingPong = this.method === 'tdd' || this.method === 'ping-pong';
    this.pairProgrammingOrPingPong = this.method === 'pair-programming' || this.method === 'ping-pong';
    if (this.pairProgrammingOrPingPong) {
      if (queryParams.pairId === undefined) {
        this.requester = true;
      } else {
        this.requester = false;
        this.pairId = queryParams.pairId;
        this.pairUserName = queryParams.pairUserName;
      }
    }
  }
}
