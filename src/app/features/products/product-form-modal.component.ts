import { Component, HostListener, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product, ProductInput } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { IconComponent } from '../../shared/ui/icon.component';

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  template: `
    <div class="modal-backdrop" (click)="closed.emit()">
      <div class="modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ product() ? 'Modifier le produit' : 'Nouveau produit' }}</h2>
          <button type="button" class="icon-btn" (click)="closed.emit()" aria-label="Fermer">
            <app-icon name="x" [size]="18" />
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="save()" novalidate class="form">
          @if (error()) {
            <div class="form-error" role="alert">{{ error() }}</div>
          }

          <div class="field">
            <label for="pf-name">Nom du produit *</label>
            <input id="pf-name" class="control" formControlName="name" maxlength="150"
                   [class.invalid]="f.name.touched && f.name.invalid" />
            @if (f.name.touched && f.name.invalid) {
              <span class="field-error">Le nom du produit est obligatoire.</span>
            }
          </div>

          <div class="field">
            <label for="pf-desc">Description</label>
            <textarea id="pf-desc" class="control" formControlName="description" maxlength="1000"></textarea>
          </div>

          <div class="row">
            <div class="field">
              <label for="pf-price">Prix (DT) *</label>
              <input id="pf-price" class="control" type="number" step="0.01" formControlName="price"
                     [class.invalid]="f.price.touched && f.price.invalid" />
              @if (f.price.touched && f.price.errors) {
                <span class="field-error">
                  {{ f.price.errors['required'] ? 'Le prix est obligatoire.' : 'RG04 : le prix doit être supérieur à 0 DT.' }}
                </span>
              }
            </div>

            <div class="field">
              <label for="pf-stock">Stock *</label>
              <input id="pf-stock" class="control" type="number" step="1" formControlName="stock"
                     [class.invalid]="f.stock.touched && f.stock.invalid" />
              @if (f.stock.touched && f.stock.errors) {
                <span class="field-error">
                  {{ f.stock.errors['required'] ? 'Le stock est obligatoire.' : 'RG05 : le stock doit être un entier supérieur ou égal à 0.' }}
                </span>
              }
            </div>
          </div>

          <div class="field">
            <label for="pf-cat">Catégorie *</label>
            <select id="pf-cat" class="control" formControlName="categoryId"
                    [class.invalid]="f.categoryId.touched && f.categoryId.invalid">
              <option [ngValue]="0" disabled>Choisir une catégorie…</option>
              @for (c of svc.categories(); track c.id) {
                <option [ngValue]="c.id">{{ c.name }}</option>
              }
            </select>
            @if (f.categoryId.touched && f.categoryId.invalid) {
              <span class="field-error">Sélectionnez une catégorie.</span>
            }
          </div>

          <div class="field">
            <label for="pf-img">URL de l’image</label>
            <input id="pf-img" class="control" formControlName="imageUrl" placeholder="https://…" />
          </div>

          <label class="active-row">
            <button type="button" class="switch" [class.on]="f.isActive.value" role="switch"
                    [attr.aria-checked]="f.isActive.value" (click)="f.isActive.setValue(!f.isActive.value)">
              <span></span>
            </button>
            <span>Produit actif (visible dans la boutique)</span>
          </label>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" (click)="closed.emit()">Annuler</button>
            <button type="submit" class="btn btn-primary">{{ product() ? 'Enregistrer' : 'Créer le produit' }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form { display: flex; flex-direction: column; gap: 16px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .active-row { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; }
    .modal-footer { margin-top: 8px; }
  `],
})
export class ProductFormModalComponent implements OnInit {
  readonly svc = inject(ProductService);
  private readonly fb = inject(FormBuilder);

  readonly product = input<Product | null>(null);
  readonly saved = output<string>();
  readonly closed = output<void>();

  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    imageUrl: [''],
    isActive: [true],
    categoryId: [0, [Validators.min(1)]],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const p = this.product();
    if (p) {
      this.form.patchValue({
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        imageUrl: p.imageUrl ?? '',
        isActive: p.isActive,
        categoryId: p.categoryId,
      });
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }

  save(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const input: ProductInput = {
      name: v.name.trim(),
      description: v.description.trim(),
      price: Number(v.price),
      stock: Number(v.stock),
      imageUrl: v.imageUrl.trim() || undefined,
      isActive: v.isActive,
      categoryId: Number(v.categoryId),
    };

    const current = this.product();
    const result = current ? this.svc.update(current.id, input) : this.svc.create(input);
    if (!result.ok) {
      this.error.set(result.error);
      return;
    }
    this.saved.emit(current ? `Produit « ${input.name} » modifié.` : `Produit « ${input.name} » créé.`);
  }
}
