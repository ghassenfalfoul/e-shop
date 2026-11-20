export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  categoryId: number;
}

export type ProductInput = Omit<Product, 'id'>;

/** Seuil d'alerte de rupture : stock <= 5 => statut rouge. */
export const LOW_STOCK_THRESHOLD = 5;

export function isLowStock(product: Pick<Product, 'stock'>): boolean {
  return product.stock <= LOW_STOCK_THRESHOLD;
}
