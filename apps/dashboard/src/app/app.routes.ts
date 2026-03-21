import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { KycComponent } from './kyc/kyc';

export const appRoutes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'kyc', component: KycComponent },
  { path: 'dashboard', component: DashboardHomeComponent },
  { path: '**', redirectTo: '' }
];
