import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4">
      <div class="text-center">
        <p class="text-8xl font-extrabold mb-4" style="color: #EE0088">404</p>
        <h1 class="text-2xl font-bold text-gray-900 mb-3">Page not found</h1>
        <p class="text-gray-500 mb-8">Sorry, we couldn't find the page you're looking for.</p>
        <a routerLink="/"
          class="inline-block px-6 py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
          style="background-color: #EE0088">
          Back to Home
        </a>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
