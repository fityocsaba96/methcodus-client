import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutingGuard } from './routing.guard';
import { WelcomeComponent } from '../../pages/welcome/welcome.component';
import { RegisterComponent } from '../../pages/register/register.component';
import { LoginComponent } from '../../pages/login/login.component';
import { MySettingsComponent } from '../../pages/my-settings/my-settings.component';
import { MySolutionsComponent } from '../../pages/my-solutions/my-solutions.component';
import { MyExercisesComponent } from '../../pages/my-exercises/my-exercises.component';
import { AddExerciseComponent } from '../../pages/add-exercise/add-exercise.component';
import { ExercisesComponent } from '../../pages/exercises/exercises.component';
import { ViewExerciseComponent } from '../../pages/view-exercise/view-exercise.component';
import { SolveExerciseComponent } from '../../pages/solve-exercise/solve-exercise.component';

const routes: Routes = [
  { path: '', component: WelcomeComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: false } },
  { path: 'user/register', component: RegisterComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: false } },
  { path: 'user/login', component: LoginComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: false } },
  { path: 'user/settings', component: MySettingsComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: true } },
  { path: 'user/solutions', component: MySolutionsComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: true } },
  { path: 'user/exercises', component: MyExercisesComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: true } },
  { path: 'exercises/add', component: AddExerciseComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: true } },
  { path: 'exercises', component: ExercisesComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: true } },
  { path: 'exercises/:id', component: ViewExerciseComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: true } },
  { path: 'exercises/:id/solve', component: SolveExerciseComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: true } },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class RoutingModule {}
