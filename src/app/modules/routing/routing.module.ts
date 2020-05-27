import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutingGuard } from './routing.guard';
import { WelcomeComponent } from '../../pages/welcome/welcome.component';
import { RegisterComponent } from '../../pages/register/register.component';
import { LoginComponent } from '../../pages/login/login.component';
import { UserSettingsComponent } from '../../pages/user-settings/user-settings.component';
import { UserSolutionsComponent } from '../../pages/user-solutions/user-solutions.component';
import { UserExercisesComponent } from '../../pages/user-exercises/user-exercises.component';
import { AddExerciseComponent } from '../../pages/add-exercise/add-exercise.component';
import { ExercisesComponent } from '../../pages/exercises/exercises.component';
import { ExerciseComponent } from '../../pages/exercise/exercise.component';
import { SolveExerciseComponent } from '../../pages/solve-exercise/solve-exercise.component';

const routes: Routes = [
  { path: '', component: WelcomeComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: false } },
  { path: 'user/register', component: RegisterComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: false } },
  { path: 'user/login', component: LoginComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: false } },
  { path: 'user/settings', component: UserSettingsComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: true } },
  { path: 'user/solutions', component: UserSolutionsComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: true } },
  { path: 'user/exercises', component: UserExercisesComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: true } },
  { path: 'exercises/add', component: AddExerciseComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: true } },
  { path: 'exercises', component: ExercisesComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: true } },
  { path: 'exercises/:id', component: ExerciseComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: true } },
  { path: 'exercises/:id/solve', component: SolveExerciseComponent, canActivate: [RoutingGuard], data: { allowedLoggedInState: true } },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class RoutingModule {}
