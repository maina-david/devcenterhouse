import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.component.html',
})
export class AboutComponent {
  readonly team = [
    { name: 'Aoife Murphy', role: 'CEO & Co-Founder', img: 'https://picsum.photos/seed/team1/200/200' },
    { name: "Ciarán O'Brien", role: 'CTO', img: 'https://picsum.photos/seed/team2/200/200' },
    { name: 'Sinead Kelly', role: 'Head of Product', img: 'https://picsum.photos/seed/team3/200/200' },
  ];
}
