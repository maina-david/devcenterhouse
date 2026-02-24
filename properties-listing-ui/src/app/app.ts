import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(public readonly router: Router) {}

  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  get isAuthRoute(): boolean {
    return this.router.url.startsWith('/auth/');
  }
}
