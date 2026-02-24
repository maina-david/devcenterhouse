import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SavedPropertiesService } from '../../../core/services/saved-properties.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly savedService = inject(SavedPropertiesService);
  private readonly router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit() {
    if (!this.firstName || !this.lastName || !this.email || !this.password) return;
    this.loading.set(true);
    this.error.set(null);

    this.authService.register(this.firstName, this.lastName, this.email, this.password).subscribe({
      next: () => {
        this.savedService.loadSavedIds();
        this.router.navigate(['/properties']);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Registration failed. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
