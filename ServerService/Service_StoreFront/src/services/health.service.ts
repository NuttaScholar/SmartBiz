import type { Connection } from "mongoose";
import type { DatabaseName } from "../database/mongo";

export interface HealthSnapshot {
  service: "service_storefront";
  status: "ok" | "degraded";
  uptimeSeconds: number;
  databases: Record<DatabaseName, boolean>;
}

export default class HealthService {
  constructor(
    private readonly databases: ReadonlyMap<DatabaseName, Connection>,
    private readonly readUptime: () => number = () => process.uptime(),
  ) {}

  getSnapshot(): HealthSnapshot {
    const databaseStates: Record<DatabaseName, boolean> = {
      Stock: this.isConnected("Stock"),
      StoreFront: this.isConnected("StoreFront"),
    };

    return {
      service: "service_storefront",
      status: Object.values(databaseStates).every(Boolean) ? "ok" : "degraded",
      uptimeSeconds: Math.floor(this.readUptime()),
      databases: databaseStates,
    };
  }

  private isConnected(name: DatabaseName): boolean {
    return this.databases.get(name)?.readyState === 1;
  }
}
