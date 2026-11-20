import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon.component';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="card box">
      <app-icon name="box" [size]="40" />
      <h2>{{ feature }}</h2>
      <p>Ce module sera livré dans un prochain sprint (hors périmètre Sprints 1 &amp; 2).</p>
    </div>
  `,
  styles: [`
    .box { padding: 60px 24px; text-align: center; color: var(--muted); display: flex; flex-direction: column; align-items: center; gap: 10px; }
    h2 { color: var(--text); font-size: 22px; }
  `],
})
export class PlaceholderComponent {
  readonly feature = (inject(ActivatedRoute).snapshot.data['feature'] as string | undefined) ?? 'Module';
}
