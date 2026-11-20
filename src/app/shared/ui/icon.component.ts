import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'logo' | 'home' | 'box' | 'bag' | 'users' | 'pencil' | 'check-circle' | 'alert'
  | 'moon' | 'sun' | 'chevron-down' | 'plus' | 'minus' | 'x' | 'trash' | 'search'
  | 'logout' | 'tag' | 'check';

@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display:inline-flex;line-height:0;flex:none' },
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.stroke-width]="strokeWidth()"
    >
      @switch (name()) {
        @case ('logo') { <path d="M5 11v7" /><path d="M12 5v13" /><path d="M19 9v9" /> }
        @case ('home') { <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /> }
        @case ('box') { <path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v8" /> }
        @case ('bag') { <path d="M6 8h12l1 12H5z" /><path d="M9 8V7a3 3 0 0 1 6 0v1" /> }
        @case ('users') { <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4" /><path d="M18 14.4c2 .7 3.5 2.5 3.5 5.6" /> }
        @case ('pencil') { <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" /><path d="m14.5 7.5 3 3" /> }
        @case ('check-circle') { <circle cx="12" cy="12" r="9" /><path d="m8 12.5 2.8 2.8L16 9.5" /> }
        @case ('alert') { <path d="M12 3.5 22 20H2z" /><path d="M12 10v4.5" /><path d="M12 17.3v.1" /> }
        @case ('moon') { <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /> }
        @case ('sun') { <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /> }
        @case ('chevron-down') { <path d="m6 9 6 6 6-6" /> }
        @case ('plus') { <path d="M12 5v14M5 12h14" /> }
        @case ('minus') { <path d="M5 12h14" /> }
        @case ('x') { <path d="M6 6l12 12M18 6 6 18" /> }
        @case ('trash') { <path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="m6 7 1 13h10l1-13" /><path d="M10 11v6M14 11v6" /> }
        @case ('search') { <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /> }
        @case ('logout') { <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" /><path d="m16 8 4 4-4 4" /><path d="M20 12H9" /> }
        @case ('tag') { <path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1" /> }
        @case ('check') { <path d="m5 12.5 4.5 4.5L19 7.5" /> }
      }
    </svg>
  `,
})
export class IconComponent {
  readonly name = input<IconName>('box');
  readonly size = input<number>(20);
  readonly strokeWidth = input<number>(2);
}
