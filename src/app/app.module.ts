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
import { SolutionService } from './services/solution.service';
import { UserService } from './services/user.service';

@NgModule({
  declarations: [AppComponent, CodeEditorComponent],
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
    SolutionService,
    UserService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
