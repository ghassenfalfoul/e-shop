import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Connexion - MonShop',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    canActivateChild: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Tableau de bord - MonShop',
        data: { title: 'Tableau de bord', subtitle: 'Vue d’ensemble de la boutique' },
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'products',
        title: 'Produits - MonShop',
        data: { title: 'Produits', subtitle: 'Gestion du catalogue et des stocks' },
        loadComponent: () => import('./features/products/product-list.component').then((m) => m.ProductListComponent),
      },
      {
        path: 'orders',
        title: 'Commandes - MonShop',
        data: { title: 'Commandes', subtitle: 'Suivi des commandes clients', feature: 'Gestion des commandes' },
        loadComponent: () => import('./features/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
      },
      {
        path: 'clients',
        title: 'Clients - MonShop',
        data: { title: 'Clients', subtitle: 'Base de clients de la boutique', feature: 'Gestion des clients' },
        loadComponent: () => import('./features/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
