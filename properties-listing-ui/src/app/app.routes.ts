import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'properties',
    loadComponent: () =>
      import('./features/properties/pages/property-listing/property-listing.component').then(
        (m) => m.PropertyListingComponent,
      ),
  },
  {
    path: 'properties/:id',
    loadComponent: () =>
      import('./features/properties/pages/property-detail/property-detail.component').then(
        (m) => m.PropertyDetailComponent,
      ),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/user/dashboard/user-dashboard.component').then(
        (m) => m.UserDashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent,
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/properties',
    loadComponent: () =>
      import('./features/admin/properties/admin-properties.component').then(
        (m) => m.AdminPropertiesComponent,
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/properties/new',
    loadComponent: () =>
      import('./features/admin/property-form/property-form.component').then(
        (m) => m.PropertyFormComponent,
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/properties/:id/edit',
    loadComponent: () =>
      import('./features/admin/property-form/property-form.component').then(
        (m) => m.PropertyFormComponent,
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./features/admin/users/admin-users.component').then(
        (m) => m.AdminUsersComponent,
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
