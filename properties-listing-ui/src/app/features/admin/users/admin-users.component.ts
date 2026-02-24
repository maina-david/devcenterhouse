import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  users = signal<User[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.http.get<User[]>(this.apiUrl).subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
    });
  }

  updateRole(userId: number, role: string) {
    this.http.patch(`${this.apiUrl}/${userId}/role`, { role }).subscribe({
      next: () => {
        this.users.update((list) =>
          list.map((u) => (u.id === userId ? { ...u, role: role as 'user' | 'admin' } : u)),
        );
      },
    });
  }
}
