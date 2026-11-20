import { DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ORDER_STATUS_LABELS, OrderStatus } from '../../core/models/order.model';
import { isLowStock } from '../../core/models/product.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { ProductService } from '../../core/services/product.service';
import { IconComponent } from '../../shared/ui/icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, RouterLink, IconComponent],
  template: `
    <!-- KPI -->
    <section class="kpis">
      <article class="card kpi">
        <div class="kpi-icon" style="background: #781636"><app-icon name="logo" [size]="28" [strokeWidth]="2.4" /></div>
        <div class="kpi-text">
          <span class="kpi-label upper">Total trafic</span>
          <strong class="kpi-value">{{ dash.traffic | number: '1.0-0':'en-US' }}</strong>
          <span class="chip">{{ dash.trafficGrowthLabel }}</span>
        </div>
        <svg class="spark spark-sm" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="0,32 9,22 17,27 27,16 36,21 46,9 56,17 66,8 78,14 88,5 100,10" />
        </svg>
      </article>

      <article class="card kpi">
        <div class="kpi-icon" style="background: #7c3aed"><app-icon name="bag" [size]="28" /></div>
        <div class="kpi-text">
          <span class="kpi-label">Commandes</span>
          <strong class="kpi-value">{{ dash.ordersCount }}</strong>
        </div>
        <div class="donut" role="img" aria-label="Répartition des commandes"></div>
      </article>

      <article class="card kpi">
        <div class="kpi-icon" style="background: #15803d"><app-icon name="box" [size]="28" /></div>
        <div class="kpi-text">
          <span class="kpi-label">À expédier</span>
          <strong class="kpi-value">{{ dash.toShipCount }}</strong>
        </div>
        <svg class="spark spark-lg" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="0,32 12,20 22,28 35,14 46,22 58,8 70,20 82,10 92,5 100,2" />
        </svg>
      </article>
    </section>

    <!-- Panneaux -->
    <section class="panels">
      <article class="card panel">
        <header class="panel-head">
          <h2>Suivi des commandes</h2>
          <a routerLink="/orders" class="see-all">Voir tout →</a>
        </header>
        <ul class="rows">
          @for (order of dash.recentOrders; track order.id) {
            <li class="order-row">
              <span class="order-name">#{{ order.id }} - {{ order.customer }}</span>
              <span class="badge" [class]="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
              <span class="order-total">{{ order.total }} DT</span>
            </li>
          }
        </ul>
      </article>

      <article class="card panel">
        <header class="panel-head">
          <h2>Gestion des produits</h2>
          <a routerLink="/products" class="see-all">Voir tout →</a>
        </header>
        <ul class="rows">
          @for (p of featured(); track p.id) {
            <li class="product-row">
              <span class="thumb"><app-icon name="box" [size]="22" /></span>
              <span class="p-name">{{ p.name }}</span>
              @if (low(p.stock)) {
                <span class="stock low"><app-icon name="alert" [size]="18" /> Stock : <b>{{ p.stock }}</b></span>
              } @else {
                <span class="stock ok"><app-icon name="check-circle" [size]="16" /> Stock : <b>{{ p.stock }}</b></span>
              }
              <span class="p-price">{{ p.price }} DT</span>
              <a class="btn btn-outline btn-sm edit" routerLink="/products" [queryParams]="{ edit: p.id }">
                <app-icon name="pencil" [size]="15" /> Modifier
              </a>
            </li>
          }
        </ul>
      </article>
    </section>

    <!-- Suggestion IA -->
    @if (products.suggestion(); as s) {
      <section class="ia-banner" role="note">
        <h3>SUGGESTION IA</h3>
        <p>
          Le « {{ s.product.name }} » est presque épuisé @if (s.views > 0) { alors que {{ s.views }} clients l’ont consulté cette semaine } : réapprovisionner en priorité.
        </p>
      </section>
    }
  `,
  styles: [`
    :host { display: block; }

    /* KPI */
    .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .kpi { display: flex; align-items: center; gap: 16px; padding: 20px; min-height: 130px; }
    .kpi-icon {
      width: 60px; height: 60px; border-radius: 16px; color: #fff; flex: none;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .kpi-text { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
    .kpi-label { font-size: 14px; font-weight: 600; color: var(--muted); line-height: 1.25; }
    .kpi-label.upper { text-transform: uppercase; letter-spacing: 0.3px; }
    .kpi-value { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.1; }
    .chip { margin-top: 4px; background: var(--green-bg); color: var(--green); font-size: 12px; font-weight: 700; padding: 2px 12px; border-radius: 999px; }

    .spark { margin-left: auto; flex: 1 1 auto; height: 40px; min-width: 50px; overflow: visible; }
    .spark polyline { fill: none; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
    .spark-sm { max-width: 56px; }
    .spark-sm polyline { stroke: #781636; stroke-width: 1.6; }
    [data-theme='dark'] .spark-sm polyline { stroke: #f08aa8; }
    .spark-lg { max-width: 120px; height: 56px; }
    .spark-lg polyline { stroke: #15803d; stroke-width: 3.2; }
    [data-theme='dark'] .spark-lg polyline { stroke: #4ade80; }

    .donut {
      position: relative; margin-left: auto; width: 80px; height: 80px; border-radius: 50%; flex: none;
      background: conic-gradient(#8b1538 0 33%, #5b8def 33% 61%, #f5a623 61% 88%, #f08aa0 88% 100%);
    }
    .donut::after { content: ''; position: absolute; inset: 15px; border-radius: 50%; background: var(--surface); }

    /* Panneaux */
    .panels { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; }
    .panel { padding: 22px; }
    .panel-head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 14px; margin-bottom: 0; border-bottom: 1px solid var(--border); }
    .panel-head h2 { font-size: 22px; font-weight: 800; letter-spacing: -0.3px; }
    .see-all { color: var(--link); font-weight: 700; font-size: 15px; }
    .rows { list-style: none; margin: 0; padding: 0; }
    .rows > li { border-bottom: 1px solid var(--border); }
    .rows > li:last-child { border-bottom: 0; }

    .order-row { display: grid; grid-template-columns: 1fr 130px 70px; align-items: center; padding: 14px 0; font-size: 15px; }
    .order-row .badge { justify-self: center; }
    .order-total { text-align: right; }

    .product-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; }
    .thumb {
      width: 52px; height: 52px; border-radius: 12px; background: var(--surface-2); color: var(--muted);
      display: inline-flex; align-items: center; justify-content: center; flex: none;
    }
    .p-name { flex: 1 1 80px; min-width: 70px; font-size: 15px; line-height: 1.25; }
    .stock { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; font-size: 14.5px; white-space: nowrap; }
    .stock b { font-weight: 800; margin-left: 2px; }
    .stock.ok { color: var(--green); }
    .stock.low { color: var(--red); }
    .p-price { font-size: 14.5px; white-space: nowrap; }
    .edit { height: 44px; padding: 0 16px; font-weight: 700; }

    /* Suggestion IA */
    .ia-banner {
      margin-top: 24px; padding: 20px 26px 22px; border-radius: 18px;
      background: var(--ia-bg); border: 1px solid var(--ia-border);
    }
    .ia-banner h3 { color: var(--ia-title); font-size: 17px; font-weight: 800; margin-bottom: 4px; }
    .ia-banner p { font-size: 16px; line-height: 1.45; }

    @media (max-width: 1250px) {
      .panels { grid-template-columns: 1fr; }
    }
    @media (max-width: 1100px) {
      .kpis { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent {
  readonly dash = inject(DashboardService);
  readonly products = inject(ProductService);

  /** Les trois produits mis en avant dans le panneau « Gestion des produits ». */
  readonly featured = computed(() => this.products.products().filter((p) => p.isActive).slice(0, 3));

  low(stock: number): boolean {
    return isLowStock({ stock });
  }

  statusLabel(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status];
  }

  statusClass(status: OrderStatus): string {
    switch (status) {
      case 'PREPARING':
      case 'PENDING':
        return 'badge badge-amber';
      case 'SHIPPED':
        return 'badge badge-blue';
      case 'DELIVERED':
        return 'badge badge-green';
      case 'CANCELLED':
        return 'badge badge-red';
    }
  }
}
