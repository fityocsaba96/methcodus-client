import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoutingModule } from './modules/routing/routing.module';
import { AppComponent } from './app.component';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';
import { SocketIoModule } from 'ngx-socket-io';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APIInterceptor } from './interceptors/api.interceptor';
import { AuthService } from './services/auth.service';
import { ExerciseService } from './services/exercise.service';
import { PairProgrammingRequestService } from './services/pair-programming-request.service';
import { PairProgrammingService } from './services/pair-programming.service';
import { SolutionService } from './services/solution.service';
import { UserService } from './services/user.service';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { UserSettingsComponent } from './pages/user-settings/user-settings.component';
import { UserSolutionsComponent } from './pages/user-solutions/user-solutions.component';
import { UserExercisesComponent } from './pages/user-exercises/user-exercises.component';
import { AddExerciseComponent } from './pages/add-exercise/add-exercise.component';
import { ExercisesComponent } from './pages/exercises/exercises.component';
import { ExerciseComponent } from './pages/exercise/exercise.component';
import { SolveExerciseComponent } from './pages/solve-exercise/solve-exercise.component';
import { RoutingGuard } from './modules/routing/routing.guard';

@NgModule({
  declarations: [
    AppComponent,
    CodeEditorComponent,
    WelcomeComponent,
    RegisterComponent,
    LoginComponent,
    UserSettingsComponent,
    UserSolutionsComponent,
    UserExercisesComponent,
    AddExerciseComponent,
    ExercisesComponent,
    ExerciseComponent,
    SolveExerciseComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RoutingModule,
    FormsModule,
    SocketIoModule.forRoot({ url: process.env.SERVER_URI + '/pair-programming', options: { autoConnect: false } }),
    HttpClientModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: APIInterceptor,
      multi: true,
    },
    AuthService,
    ExerciseService,
    PairProgrammingRequestService,
    PairProgrammingService,
    SolutionService,
    UserService,
    RoutingGuard,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
