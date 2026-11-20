import { Injectable, computed, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Category, Product, ProductInput, isLowStock } from '../models/product.model';

export type Failure = { ok: false; error: string };
export type Result<T> = { ok: true; data: T } | Failure;

const success = <T>(data: T): Result<T> => ({ ok: true, data });
const failure = (error: string): Failure => ({ ok: false, error });

export interface StockSuggestion {
  product: Product;
  views: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly _categories = signal<Category[]>([
    { id: 1, name: 'Smartphones' },
    { id: 2, name: 'Ordinateurs' },
    { id: 3, name: 'Accessoires' },
    { id: 4, name: 'Audio' },
    { id: 5, name: 'Montres connectées' },
  ]);

  private readonly _products = signal<Product[]>([
    { id: 1, name: 'Casque sans fil', description: 'Casque Bluetooth à réduction de bruit', price: 189, stock: 34, isActive: true, categoryId: 4 },
    { id: 2, name: 'Sac à dos urbain', description: 'Sac à dos 25L résistant à l’eau', price: 95, stock: 3, isActive: true, categoryId: 3 },
    { id: 3, name: 'Montre connectée', description: 'Montre connectée avec suivi d’activité', price: 249, stock: 18, isActive: true, categoryId: 5 },
    { id: 4, name: 'Samsung Galaxy S24', description: 'Smartphone Samsung 256 Go', price: 2500, stock: 10, isActive: true, categoryId: 1 },
    { id: 5, name: 'HP Pavilion', description: 'Ordinateur portable HP 15 pouces', price: 2800, stock: 5, isActive: true, categoryId: 2 },
    { id: 6, name: 'AirPods Pro', description: 'Écouteurs sans fil Apple', price: 650, stock: 15, isActive: true, categoryId: 4 },
  ]);

  /** Nombre de clients ayant consulté le produit cette semaine (donnée simulée). */
  private readonly weeklyViews: Record<number, number> = { 2: 38, 5: 12 };

  readonly categories = this._categories.asReadonly();
  readonly products = this._products.asReadonly();
  readonly products$ = toObservable(this._products);

  readonly lowStockProducts = computed(() =>
    this._products().filter((p) => p.isActive && isLowStock(p)),
  );

  /** Suggestion IA : produit en alerte le plus consulté. */
  readonly suggestion = computed<StockSuggestion | null>(() => {
    const candidates = this.lowStockProducts();
    if (!candidates.length) return null;
    const ranked = candidates
      .map((product) => ({ product, views: this.weeklyViews[product.id] ?? 0 }))
      .sort((a, b) => b.views - a.views || a.product.stock - b.product.stock);
    return ranked[0];
  });

  // ---------- Produits ----------
  getById(id: number): Product | undefined {
    return this._products().find((p) => p.id === id);
  }

  create(input: ProductInput): Result<Product> {
    const error = this.validate(input);
    if (error) return failure(error);
    const id = this._products().reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const product: Product = { ...input, name: input.name.trim(), id };
    this._products.update((list) => [...list, product]);
    return success(product);
  }

  update(id: number, input: ProductInput): Result<Product> {
    if (!this.getById(id)) return failure('Produit introuvable.');
    const error = this.validate(input);
    if (error) return failure(error);
    const product: Product = { ...input, name: input.name.trim(), id };
    this._products.update((list) => list.map((p) => (p.id === id ? product : p)));
    return success(product);
  }

  remove(id: number): Result<void> {
    if (!this.getById(id)) return failure('Produit introuvable.');
    this._products.update((list) => list.filter((p) => p.id !== id));
    return success(undefined);
  }

  toggleActive(id: number): void {
    this._products.update((list) => list.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
  }

  /** Mise à jour rapide du stock (RG05 : stock >= 0). */
  setStock(id: number, stock: number): Result<Product> {
    const product = this.getById(id);
    if (!product) return failure('Produit introuvable.');
    if (!Number.isFinite(stock) || !Number.isInteger(stock)) {
      return failure('Le stock doit être un nombre entier.');
    }
    if (stock < 0) return failure('RG05 : le stock ne peut pas être négatif.');
    const updated: Product = { ...product, stock };
    this._products.update((list) => list.map((p) => (p.id === id ? updated : p)));
    return success(updated);
  }

  adjustStock(id: number, delta: number): Result<Product> {
    const product = this.getById(id);
    if (!product) return failure('Produit introuvable.');
    return this.setStock(id, product.stock + delta);
  }

  // ---------- Catégories ----------
  categoryName(id: number): string {
    return this._categories().find((c) => c.id === id)?.name ?? '—';
  }

  productCount(categoryId: number): number {
    return this._products().filter((p) => p.categoryId === categoryId).length;
  }

  addCategory(name: string): Result<Category> {
    const clean = name.trim();
    if (!clean) return failure('Le nom de la catégorie est obligatoire.');
    if (this.categoryNameExists(clean)) return failure('Cette catégorie existe déjà.');
    const id = this._categories().reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const category: Category = { id, name: clean };
    this._categories.update((list) => [...list, category]);
    return success(category);
  }

  renameCategory(id: number, name: string): Result<Category> {
    const clean = name.trim();
    if (!clean) return failure('Le nom de la catégorie est obligatoire.');
    if (this.categoryNameExists(clean, id)) return failure('Cette catégorie existe déjà.');
    const category: Category = { id, name: clean };
    this._categories.update((list) => list.map((c) => (c.id === id ? category : c)));
    return success(category);
  }

  removeCategory(id: number): Result<void> {
    const count = this.productCount(id);
    if (count > 0) {
      return failure(`Suppression impossible : ${count} produit(s) utilisent cette catégorie.`);
    }
    this._categories.update((list) => list.filter((c) => c.id !== id));
    return success(undefined);
  }

  // ---------- Règles de gestion ----------
  private categoryNameExists(name: string, excludeId?: number): boolean {
    return this._categories().some(
      (c) => c.id !== excludeId && c.name.toLowerCase() === name.toLowerCase(),
    );
  }

  private validate(input: ProductInput): string | null {
    if (!input.name.trim()) return 'Le nom du produit est obligatoire.';
    if (!(input.price > 0)) return 'RG04 : le prix doit être supérieur à 0 DT.';
    if (!Number.isInteger(input.stock) || input.stock < 0) {
      return 'RG05 : le stock doit être un entier supérieur ou égal à 0.';
    }
    if (!this._categories().some((c) => c.id === input.categoryId)) return 'Catégorie invalide.';
    return null;
  }
}
