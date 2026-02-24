import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  form = { name: '', email: '', subject: '', message: '' };
  submitted = signal(false);

  onSubmit() {
    console.log('Contact form:', this.form);
    this.submitted.set(true);
    this.form = { name: '', email: '', subject: '', message: '' };
    setTimeout(() => this.submitted.set(false), 5000);
  }
}
