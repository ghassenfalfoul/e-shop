import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, delay, of, tap, throwError } from 'rxjs';
import { User } from '../models/user.model';

const TOKEN_KEY = 'monshop_token';
const USER_KEY = 'monshop_user';

interface MockAccount {
  password: string;
  user: User;
}

/** Comptes simulés (le backend réel sera branché plus tard). */
const MOCK_ACCOUNTS: MockAccount[] = [
  {
    password: 'admin123',
    user: { id: 1, fullName: 'Ghassen Falfoul', email: 'admin@monshop.tn', role: 'ADMIN' },
  },
  {
    password: 'client123',
    user: { id: 2, fullName: 'Ahmed Ben Ali', email: 'client@monshop.tn', role: 'CLIENT' },
  },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  private readonly _user = signal<User | null>(this.restoreUser());
  private readonly _token = signal<string | null>(this.read(TOKEN_KEY));

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token() && !!this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly initials = computed(() => {
    const name = this._user()?.fullName ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  });

  /** Authentification simulée. Seul un ADMIN peut accéder au back-office. */
  login(email: string, password: string): Observable<User> {
    const account = MOCK_ACCOUNTS.find(
      (a) => a.user.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
    );
    if (!account) {
      return throwError(() => new Error('Email ou mot de passe incorrect.'));
    }
    if (account.user.role !== 'ADMIN') {
      return throwError(() => new Error('Accès réservé aux administrateurs.'));
    }
    return of(account.user).pipe(
      delay(400),
      tap((user) => {
        const token = 'mock-jwt-' + btoa(`${user.email}:${Date.now()}`);
        this._token.set(token);
        this._user.set(user);
        this.write(TOKEN_KEY, token);
        this.write(USER_KEY, JSON.stringify(user));
      }),
    );
  }

  logout(redirect = true): void {
    this._token.set(null);
    this._user.set(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      /* stockage indisponible */
    }
    if (redirect) {
      this.router.navigate(['/login']);
    }
  }

  private restoreUser(): User | null {
    const raw = this.read(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* stockage indisponible */
    }
  }
}
