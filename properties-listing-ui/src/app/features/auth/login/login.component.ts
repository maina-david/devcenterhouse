import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SavedPropertiesService } from '../../../core/services/saved-properties.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly savedService = inject(SavedPropertiesService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.savedService.loadSavedIds();
        this.router.navigate(['/properties']);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Invalid email or password');
        this.loading.set(false);
      },
    });
  }
}
