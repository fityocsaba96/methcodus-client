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
import { MySettingsComponent } from './pages/my-settings/my-settings.component';
import { MySolutionsComponent } from './pages/my-solutions/my-solutions.component';
import { MyExercisesComponent } from './pages/my-exercises/my-exercises.component';
import { AddExerciseComponent } from './pages/add-exercise/add-exercise.component';
import { ExercisesComponent } from './pages/exercises/exercises.component';
import { ViewExerciseComponent } from './pages/view-exercise/view-exercise.component';
import { SolveExerciseComponent } from './pages/solve-exercise/solve-exercise.component';
import { RoutingGuard } from './modules/routing/routing.guard';
import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { AccordionModule } from 'primeng/accordion';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  declarations: [
    AppComponent,
    CodeEditorComponent,
    WelcomeComponent,
    RegisterComponent,
    LoginComponent,
    MySettingsComponent,
    MySolutionsComponent,
    MyExercisesComponent,
    AddExerciseComponent,
    ExercisesComponent,
    ViewExerciseComponent,
    SolveExerciseComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RoutingModule,
    FormsModule,
    SocketIoModule.forRoot({ url: process.env.SERVER_URI + '/pair-programming', options: { autoConnect: false } }),
    HttpClientModule,
    MenubarModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    MessagesModule,
    MessageModule,
    AccordionModule,
    InputTextareaModule,
    TableModule,
    PanelModule,
    TooltipModule,
    DialogModule,
    DropdownModule,
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
