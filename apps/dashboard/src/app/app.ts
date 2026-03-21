import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { API_URL } from './app.config';

@Component({
  imports: [CommonModule, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  
  title = '🏦 NeoBank Dashboard';
  serverStatus = 'Connecting...';

  constructor() {
    this.checkHealth();
  }

  checkHealth() {
    this.http.get<any>(`${this.apiUrl}/health`).subscribe({
      next: (res) => {
        this.serverStatus = `Connected to Gateway (Status: ${res.status})`;
      },
      error: () => {
        this.serverStatus = '🔴 Gateway Offline';
      }
    });
  }
}
