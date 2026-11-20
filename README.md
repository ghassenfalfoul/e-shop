# MonShop – Back-office Web Administrateur (Sprints 1 & 2)

Application Angular 18 (standalone components, signaux, nouvelle syntaxe de contrôle `@if` / `@for`).

## Démarrage

```bash
npm install
npm start          # http://localhost:4200
```

Compte de démonstration : `admin@monshop.tn` / `admin123`
(le compte `client@monshop.tn` / `client123` est refusé : accès réservé aux administrateurs).

## Périmètre

**Sprint 1** – routage sécurisé (`authGuard`, `adminGuard`), intercepteur HTTP (Bearer + 401), authentification simulée,
layout MonShop (sidebar bordeaux, header, dark/light mode), tableau de bord (KPI, suivi des commandes, gestion des produits, suggestion IA).

**Sprint 2** – catalogue : CRUD produits (modale), CRUD catégories, mise à jour rapide du stock (−/+/saisie),
alertes de rupture (stock ≤ 5), bandeau « Suggestion IA ».

## Règles de gestion
- RG04 : prix > 0 DT
- RG05 : stock ≥ 0 (jamais négatif)
- Seul le rôle `ADMIN` accède au back-office
- Stock ≤ 5 ⇒ alerte rouge

Les données sont simulées dans `core/services` ; le branchement à l'API (base `ecommerce_db`) se fera dans un sprint ultérieur.
