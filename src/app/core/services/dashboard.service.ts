import { Injectable } from '@angular/core';
import { OrderSummary } from '../models/order.model';

/** Données simulées du tableau de bord (Sprint 1). */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  readonly traffic = 350897;
  readonly trafficGrowthLabel = '+12,5 %';
  readonly ordersCount = 64;
  readonly toShipCount = 12;

  readonly recentOrders: OrderSummary[] = [
    { id: 1042, customer: 'Sarra B.', status: 'PREPARING', total: 128 },
    { id: 1041, customer: 'Karim M.', status: 'SHIPPED', total: 89 },
    { id: 1040, customer: 'Leïla T.', status: 'DELIVERED', total: 215 },
    { id: 1039, customer: 'Youssef A.', status: 'SHIPPED', total: 54 },
  ];
}
