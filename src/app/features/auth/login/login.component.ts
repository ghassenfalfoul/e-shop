import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/ui/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  template: `
    <div class="login-page">
      <section class="login-card card">
        <div class="logo">
          <span class="logo-badge"><app-icon name="logo" [size]="30" [strokeWidth]="2.6" /></span>
          <h1>MonShop</h1>
          <p>Espace d’administration</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          @if (error()) {
            <div class="form-error" role="alert">{{ error() }}</div>
          }

          <div class="field">
            <label for="email">Adresse e-mail</label>
            <input
              id="email" class="control" type="email" formControlName="email"
              autocomplete="username" placeholder="admin@monshop.tn"
              [class.invalid]="form.controls.email.touched && form.controls.email.invalid"
            />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <span class="field-error">Saisissez une adresse e-mail valide.</span>
            }
          </div>

          <div class="field">
            <label for="password">Mot de passe</label>
            <input
              id="password" class="control" type="password" formControlName="password"
              autocomplete="current-password" placeholder="••••••••"
              [class.invalid]="form.controls.password.touched && form.controls.password.invalid"
            />
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <span class="field-error">Le mot de passe est obligatoire (4 caractères minimum).</span>
            }
          </div>

          <button class="btn btn-primary submit" type="submit" [disabled]="loading()">
            {{ loading() ? 'Connexion…' : 'Se connecter' }}
          </button>
        </form>

        <div class="hint">
          <strong>Compte de démonstration</strong>
          <span>admin&#64;monshop.tn / admin123</span>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px;
      background: linear-gradient(135deg, #781636 0%, #4d0e24 100%);
    }
    .login-card { width: min(430px, 100%); padding: 36px 34px; background: var(--surface); }
    .logo { text-align: center; margin-bottom: 26px; }
    .logo-badge {
      width: 60px; height: 60px; border-radius: 18px; background: var(--brand); color: #fff;
      display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;
    }
    .logo h1 { font-size: 28px; font-weight: 800; }
    .logo p { color: var(--muted); margin-top: 2px; }
    form { display: flex; flex-direction: column; gap: 16px; }
    .submit { height: 46px; margin-top: 4px; }
    .hint {
      margin-top: 22px; padding: 12px 14px; border-radius: 12px; background: var(--surface-2);
      display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: var(--muted);
    }
    .hint strong { color: var(--text); }
  `],
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    if (this.auth.isAuthenticated() && this.auth.isAdmin()) {
      this.router.navigateByUrl('/dashboard');
      return;
    }
    if (this.route.snapshot.queryParamMap.get('reason') === 'forbidden') {
      this.error.set('Accès réservé aux administrateurs.');
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const safeUrl = returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('/login') ? returnUrl : '/dashboard';
        this.router.navigateByUrl(safeUrl);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
