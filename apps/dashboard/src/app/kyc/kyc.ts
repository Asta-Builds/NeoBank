import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { KycService } from '../services/kyc';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './kyc.html',
  styleUrl: './kyc.scss',
})
export class KycComponent implements OnInit {
  private kycService = inject(KycService);
  private authService = inject(AuthService);
  private router = inject(Router);

  status: any = null;
  loading = false;
  submitting = false;
  error: string | null = null;

  ngOnInit() {
    this.checkStatus();
  }

  checkStatus() {
    this.loading = true;
    this.kycService.getStatus().subscribe({
      next: (res) => {
        this.status = res;
        this.loading = false;
        if (res && res.status === 'APPROVED') {
          // If already approved, maybe redirect to dashboard after a delay
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onSubmitKyc() {
    this.submitting = true;
    this.error = null;
    this.kycService.submitKyc().subscribe({
      next: (res) => {
        this.status = res;
        this.submitting = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la soumission du KYC.';
        this.submitting = false;
      },
    });
  }
}
