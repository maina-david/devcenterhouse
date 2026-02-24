import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  readonly mobileOpen = signal(false);
  readonly userMenuOpen = signal(false);

  toggleMobile() {
    this.mobileOpen.update((v) => !v);
  }

  toggleUserMenu() {
    this.userMenuOpen.update((v) => !v);
  }

  logout() {
    this.authService.logout();
    this.userMenuOpen.set(false);
  }
}
