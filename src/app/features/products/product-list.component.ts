import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Product, isLowStock } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { IconComponent } from '../../shared/ui/icon.component';
import { CategoryModalComponent } from './category-modal.component';
import { ProductFormModalComponent } from './product-form-modal.component';

interface Toast {
  type: 'success' | 'error';
  text: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [DecimalPipe, FormsModule, IconComponent, ProductFormModalComponent, CategoryModalComponent],
  template: `
    <section class="page">
      @if (svc.lowStockProducts().length) {
        <div class="alert-banner" role="alert">
          <app-icon name="alert" [size]="22" />
          <span>
            <strong>{{ svc.lowStockProducts().length }} produit(s) en alerte de rupture</strong>
            (stock ≤ 5) : {{ alertNames() }}
          </span>
          <button type="button" class="link-btn" (click)="onlyAlerts.set(!onlyAlerts())">
            {{ onlyAlerts() ? 'Tout afficher' : 'Filtrer' }}
          </button>
        </div>
      }

      <div class="toolbar">
        <div class="search">
          <app-icon name="search" [size]="18" />
          <input type="search" placeholder="Rechercher un produit…" [ngModel]="search()" (ngModelChange)="search.set($event)" aria-label="Rechercher un produit" />
        </div>

        <select class="control filter" [ngModel]="categoryFilter()" (ngModelChange)="categoryFilter.set($event)" aria-label="Filtrer par catégorie">
          <option [ngValue]="0">Toutes les catégories</option>
          @for (c of svc.categories(); track c.id) {
            <option [ngValue]="c.id">{{ c.name }}</option>
          }
        </select>

        <label class="check">
          <input type="checkbox" [ngModel]="onlyAlerts()" (ngModelChange)="onlyAlerts.set($event)" />
          Alertes uniquement
        </label>

        <span class="spacer"></span>

        <button type="button" class="btn btn-outline" (click)="categoriesOpen.set(true)">
          <app-icon name="tag" [size]="17" /> Catégories
        </button>
        <button type="button" class="btn btn-primary" (click)="openCreate()">
          <app-icon name="plus" [size]="17" /> Nouveau produit
        </button>
      </div>

      <div class="card table-card">
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Catégorie</th>
                <th class="num">Prix</th>
                <th>Stock (mise à jour rapide)</th>
                <th>Actif</th>
                <th class="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of filtered(); track p.id) {
                <tr [class.inactive]="!p.isActive">
                  <td>
                    <div class="prod-cell">
                      <span class="thumb">
                        @if (p.imageUrl) {
                          <img [src]="p.imageUrl" [alt]="p.name" />
                        } @else {
                          <app-icon name="box" [size]="22" />
                        }
                      </span>
                      <span class="prod-text">
                        <strong>{{ p.name }}</strong>
                        <small>{{ p.description }}</small>
                      </span>
                    </div>
                  </td>
                  <td>{{ svc.categoryName(p.categoryId) }}</td>
                  <td class="num">{{ p.price | number: '1.0-2' }} DT</td>
                  <td>
                    <div class="stock-cell" [class.low]="low(p)">
                      <button type="button" class="step" (click)="changeStock(p, -1)" [disabled]="p.stock <= 0" aria-label="Retirer 1">
                        <app-icon name="minus" [size]="14" />
                      </button>
                      <input #stockInput type="number" min="0" step="1" [value]="p.stock"
                             (change)="setStock(p, stockInput)" (keydown.enter)="stockInput.blur()"
                             [attr.aria-label]="'Stock de ' + p.name" />
                      <button type="button" class="step" (click)="changeStock(p, 1)" aria-label="Ajouter 1">
                        <app-icon name="plus" [size]="14" />
                      </button>
                      @if (low(p)) {
                        <span class="badge badge-red"><app-icon name="alert" [size]="14" /> Alerte</span>
                      }
                    </div>
                  </td>
                  <td>
                    <button type="button" class="switch" [class.on]="p.isActive" role="switch"
                            [attr.aria-checked]="p.isActive" [attr.aria-label]="'Activer ' + p.name"
                            (click)="svc.toggleActive(p.id)">
                      <span></span>
                    </button>
                  </td>
                  <td class="actions-col">
                    <div class="actions">
                      <button type="button" class="btn btn-outline btn-sm" (click)="openEdit(p)">
                        <app-icon name="pencil" [size]="15" /> Modifier
                      </button>
                      <button type="button" class="icon-btn danger" (click)="toDelete.set(p)" [attr.aria-label]="'Supprimer ' + p.name">
                        <app-icon name="trash" [size]="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="empty">Aucun produit ne correspond à votre recherche.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>

    @if (formOpen()) {
      <app-product-form-modal [product]="editing()" (saved)="onSaved($event)" (closed)="closeForm()" />
    }

    @if (categoriesOpen()) {
      <app-category-modal (closed)="categoriesOpen.set(false)" />
    }

    @if (toDelete(); as product) {
      <div class="modal-backdrop" (click)="toDelete.set(null)">
        <div class="modal confirm" role="alertdialog" aria-modal="true" (click)="$event.stopPropagation()">
          <div class="modal-header"><h2>Supprimer le produit ?</h2></div>
          <p>« {{ product.name }} » sera définitivement retiré du catalogue.</p>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" (click)="toDelete.set(null)">Annuler</button>
            <button type="button" class="btn btn-danger" (click)="confirmDelete(product)">Supprimer</button>
          </div>
        </div>
      </div>
    }

    @if (toast(); as t) {
      <div class="toast" [class.error]="t.type === 'error'" role="status">{{ t.text }}</div>
    }
  `,
  styles: [`
    :host { display: block; }
    .alert-banner {
      display: flex; align-items: center; gap: 12px; padding: 14px 20px; margin-bottom: 18px;
      border-radius: 16px; background: var(--red-bg); color: var(--red); font-size: 14.5px;
    }
    .alert-banner span { flex: 1; }

    .toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; }
    .spacer { flex: 1; }
    .search {
      display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 14px; min-width: 260px;
      background: var(--surface); border: 1px solid var(--border-strong); border-radius: 999px; color: var(--muted);
    }
    .search input { border: 0; outline: 0; background: none; flex: 1; font-family: inherit; font-size: 14.5px; color: var(--text); }
    .filter { width: auto; min-width: 200px; border-radius: 999px; }
    .check { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: var(--muted); cursor: pointer; }

    .table-card { padding: 8px 8px 4px; }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 880px; }
    th {
      text-align: left; font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.4px;
      color: var(--muted); font-weight: 700; padding: 14px 16px; border-bottom: 1px solid var(--border);
    }
    td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    tr:last-child td { border-bottom: 0; }
    tr.inactive td { opacity: 0.55; }
    tr.inactive td:last-child, tr.inactive td:nth-child(5) { opacity: 1; }
    .num { text-align: right; white-space: nowrap; font-weight: 600; }
    .actions-col { text-align: right; }

    .prod-cell { display: flex; align-items: center; gap: 14px; }
    .thumb {
      width: 48px; height: 48px; border-radius: 12px; background: var(--surface-2); color: var(--muted);
      display: inline-flex; align-items: center; justify-content: center; overflow: hidden; flex: none;
    }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .prod-text { display: flex; flex-direction: column; min-width: 0; }
    .prod-text small { color: var(--muted); font-size: 12.5px; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .stock-cell { display: flex; align-items: center; gap: 8px; }
    .stock-cell input {
      width: 64px; height: 36px; text-align: center; border-radius: 10px; font-weight: 700; font-size: 14.5px;
      border: 1px solid var(--border-strong); background: var(--surface); color: var(--green); font-family: inherit;
    }
    .stock-cell.low input { color: var(--red); border-color: var(--red); }
    .step {
      width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--border-strong);
      background: var(--surface); color: var(--text); cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .step:hover:not(:disabled) { background: var(--surface-2); }
    .step:disabled { opacity: 0.4; cursor: not-allowed; }

    .actions { display: inline-flex; align-items: center; gap: 10px; }
    .empty { text-align: center; color: var(--muted); padding: 40px 16px; }

    .confirm p { color: var(--muted); }
    .confirm { width: min(440px, 100%); }
    .confirm .modal-header { margin-bottom: 10px; }

    .toast {
      position: fixed; right: 28px; bottom: 28px; z-index: 200; padding: 14px 20px; border-radius: 14px;
      background: #15803d; color: #fff; font-weight: 600; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    }
    .toast.error { background: #c0261b; }
  `],
})
export class ProductListComponent {
  readonly svc = inject(ProductService);
  private readonly route = inject(ActivatedRoute);

  readonly search = signal('');
  readonly categoryFilter = signal(0);
  readonly onlyAlerts = signal(false);

  readonly formOpen = signal(false);
  readonly editing = signal<Product | null>(null);
  readonly categoriesOpen = signal(false);
  readonly toDelete = signal<Product | null>(null);
  readonly toast = signal<Toast | null>(null);

  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const category = this.categoryFilter();
    const alertsOnly = this.onlyAlerts();
    return this.svc.products().filter(
      (p) =>
        (!term || p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)) &&
        (!category || p.categoryId === category) &&
        (!alertsOnly || isLowStock(p)),
    );
  });

  readonly alertNames = computed(() => this.svc.lowStockProducts().map((p) => p.name).join(', '));

  constructor() {
    // Ouverture directe de la modale depuis le bouton « Modifier » du tableau de bord.
    const editId = Number(this.route.snapshot.queryParamMap.get('edit'));
    if (editId) {
      const product = this.svc.getById(editId);
      if (product) this.openEdit(product);
    }
  }

  low(p: Product): boolean {
    return isLowStock(p);
  }

  openCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  openEdit(p: Product): void {
    this.editing.set(p);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editing.set(null);
  }

  onSaved(message: string): void {
    this.closeForm();
    this.notify('success', message);
  }

  changeStock(p: Product, delta: number): void {
    const result = this.svc.adjustStock(p.id, delta);
    if (!result.ok) this.notify('error', result.error);
  }

  setStock(p: Product, input: HTMLInputElement): void {
    const value = input.value.trim() === '' ? NaN : Number(input.value);
    const result = this.svc.setStock(p.id, value);
    if (!result.ok) {
      input.value = String(p.stock);
      this.notify('error', result.error);
    }
  }

  confirmDelete(p: Product): void {
    const result = this.svc.remove(p.id);
    this.toDelete.set(null);
    this.notify(result.ok ? 'success' : 'error', result.ok ? `Produit « ${p.name} » supprimé.` : result.error);
  }

  private notify(type: Toast['type'], text: string): void {
    clearTimeout(this.toastTimer);
    this.toast.set({ type, text });
    this.toastTimer = setTimeout(() => this.toast.set(null), 3200);
  }
}
