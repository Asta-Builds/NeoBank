import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  InjectionToken,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';

export const API_URL = new InjectionToken<string>('API_URL');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(),
    {
      provide: API_URL,
      useValue: 'http://localhost:8080/api', // API Gateway URL
    },
  ],
};
