import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { IconComponent, IconName } from '../../shared/ui/icon.component';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);

  readonly nav: NavItem[] = [
    { path: '/dashboard', label: 'Tableau de bord', icon: 'home' },
    { path: '/products', label: 'Produits', icon: 'box' },
    { path: '/orders', label: 'Commandes', icon: 'bag' },
    { path: '/clients', label: 'Clients', icon: 'users' },
  ];

  readonly menuOpen = signal(false);

  private readonly routeData = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.currentRouteData()),
    ),
    { initialValue: this.currentRouteData() },
  );

  readonly title = computed(() => (this.routeData()['title'] as string | undefined) ?? 'MonShop');
  readonly subtitle = computed(() => (this.routeData()['subtitle'] as string | undefined) ?? '');

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.update((open) => !open);
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }

  private currentRouteData(): Record<string, unknown> {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.data;
  }
}
