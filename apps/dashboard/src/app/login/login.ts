import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginData = {
    email: '',
    password: '',
  };

  error: string | null = null;
  success: string | null = null;
  loading = false;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['registered']) {
        this.success = 'Inscription réussie ! Vous pouvez maintenant vous connecter.';
      }
    });
  }

  onSubmit() {
    this.loading = true;
    this.error = null;
    this.success = null;
    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Identifiants invalides ou erreur serveur.';
        this.loading = false;
      },
    });
  }
}
