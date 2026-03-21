import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KycService } from '../services/kyc';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss',
})
export class DashboardHomeComponent implements OnInit {
  private kycService = inject(KycService);
  public authService = inject(AuthService);
  
  kycStatus: any = null;
  user: any = null;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
    this.checkKycStatus();
  }

  checkKycStatus() {
    this.kycService.getStatus().subscribe({
      next: (status) => {
        this.kycStatus = status;
      },
      error: () => {
        this.kycStatus = null;
      }
    });
  }
}
