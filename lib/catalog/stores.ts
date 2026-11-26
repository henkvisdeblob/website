import type { Store, StoreId } from "./types";

export const STORES: Store[] = [
  { id: "ah", name: "Albert Heijn", sourceKey: "albert_heijn", priceFactor: 1.0 },
  { id: "jumbo", name: "Jumbo", sourceKey: "jumbo", priceFactor: 0.97 },
  { id: "lidl", name: "Lidl", sourceKey: "lidl", priceFactor: 0.9 },
];

export function getStore(id: string): Store | undefined {
  return STORES.find((s) => s.id === id);
}

export function isStoreId(id: string): id is StoreId {
  return STORES.some((s) => s.id === id);
}
