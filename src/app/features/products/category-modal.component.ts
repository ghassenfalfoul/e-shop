import { Component, HostListener, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { IconComponent } from '../../shared/ui/icon.component';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="modal-backdrop" (click)="closed.emit()">
      <div class="modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Catégories</h2>
          <button type="button" class="icon-btn" (click)="closed.emit()" aria-label="Fermer">
            <app-icon name="x" [size]="18" />
          </button>
        </div>

        @if (error()) {
          <div class="form-error" role="alert">{{ error() }}</div>
        }

        <ul class="list">
          @for (c of svc.categories(); track c.id) {
            <li>
              @if (editingId() === c.id) {
                <input class="control" [(ngModel)]="editName" (keydown.enter)="saveEdit(c.id)" aria-label="Nom de la catégorie" />
                <button type="button" class="icon-btn" (click)="saveEdit(c.id)" aria-label="Valider"><app-icon name="check" [size]="16" /></button>
                <button type="button" class="icon-btn" (click)="cancelEdit()" aria-label="Annuler"><app-icon name="x" [size]="16" /></button>
              } @else {
                <span class="name">{{ c.name }}</span>
                <span class="count">{{ svc.productCount(c.id) }} produit(s)</span>
                <button type="button" class="icon-btn" (click)="startEdit(c.id, c.name)" aria-label="Renommer"><app-icon name="pencil" [size]="16" /></button>
                <button type="button" class="icon-btn danger" (click)="remove(c.id)" aria-label="Supprimer"><app-icon name="trash" [size]="16" /></button>
              }
            </li>
          }
        </ul>

        <form class="add" (ngSubmit)="add()">
          <input class="control" name="newName" [(ngModel)]="newName" placeholder="Nouvelle catégorie…" aria-label="Nouvelle catégorie" />
          <button type="submit" class="btn btn-primary"><app-icon name="plus" [size]="16" /> Ajouter</button>
        </form>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline" (click)="closed.emit()">Fermer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .list { list-style: none; padding: 0; margin: 0 0 18px; }
    .list li { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
    .name { flex: 1; font-weight: 600; }
    .count { color: var(--muted); font-size: 13px; }
    .add { display: flex; gap: 10px; }
    .form-error { margin-bottom: 14px; }
  `],
})
export class CategoryModalComponent {
  readonly svc = inject(ProductService);
  readonly closed = output<void>();

  readonly error = signal<string | null>(null);
  readonly editingId = signal<number | null>(null);
  editName = '';
  newName = '';

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }

  startEdit(id: number, name: string): void {
    this.error.set(null);
    this.editingId.set(id);
    this.editName = name;
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(id: number): void {
    const result = this.svc.renameCategory(id, this.editName);
    if (!result.ok) {
      this.error.set(result.error);
      return;
    }
    this.error.set(null);
    this.editingId.set(null);
  }

  add(): void {
    const result = this.svc.addCategory(this.newName);
    if (!result.ok) {
      this.error.set(result.error);
      return;
    }
    this.error.set(null);
    this.newName = '';
  }

  remove(id: number): void {
    const result = this.svc.removeCategory(id);
    this.error.set(result.ok ? null : result.error);
  }
}
