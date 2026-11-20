import { Injectable, effect, signal } from '@angular/core';

const THEME_KEY = 'monshop_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(this.read());

  constructor() {
    effect(() => {
      const dark = this.isDark();
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      try {
        localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
      } catch {
        /* stockage indisponible */
      }
    });
  }

  toggle(): void {
    this.isDark.update((v) => !v);
  }

  private read(): boolean {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  }
}
