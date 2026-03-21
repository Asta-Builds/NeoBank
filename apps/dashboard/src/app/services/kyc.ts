import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../app.config';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class KycService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private authService = inject(AuthService);

  constructor() {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  submitKyc(): Observable<any> {
    return this.http.post(`${this.apiUrl}/v1/kyc/submit`, {}, { headers: this.getHeaders() });
  }

  getStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/v1/kyc/status`, { headers: this.getHeaders() });
  }
}
