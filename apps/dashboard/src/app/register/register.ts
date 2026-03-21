import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  registerData = {
    email: '',
    phone: '',
    password: '',
  };

  error: string | null = null;
  loading = false;

  onSubmit() {
    this.loading = true;
    this.error = null;
    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.router.navigate(['/login'], { queryParams: { registered: true } });
      },
      error: (err) => {
        this.error = err.error?.message || 'Une erreur est survenue lors de l\'inscription.';
        this.loading = false;
      },
    });
  }
}
