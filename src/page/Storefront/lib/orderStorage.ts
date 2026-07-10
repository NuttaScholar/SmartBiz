import { seededOrders } from '../data/mockData';
import type { StorefrontOrder } from '../type';

export function getStoredOrders(token: string) {
  const rawValue = window.localStorage.getItem(`smartbiz-storefront-orders-${token}`);
  if (!rawValue) return seededOrders;

  try {
    return JSON.parse(rawValue) as StorefrontOrder[];
  } catch {
    return seededOrders;
  }
}

export function saveStoredOrders(token: string, orders: StorefrontOrder[]) {
  window.localStorage.setItem(`smartbiz-storefront-orders-${token}`, JSON.stringify(orders));
}
