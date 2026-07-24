import type { Connection } from "mongoose";
import type { DatabaseName } from "../src/database/mongo";
import HealthService from "../src/services/health.service";

function createConnections(
  readyState: number,
): ReadonlyMap<DatabaseName, Connection> {
  const connection = { readyState } as Connection;
  return new Map<DatabaseName, Connection>([
    ["Stock", connection],
    ["StoreFront", connection],
  ]);
}

describe("HealthService", () => {
  it("reports ok when every database is connected", () => {
    const snapshot = new HealthService(
      createConnections(1),
      () => 12.9,
    ).getSnapshot();

    expect(snapshot.status).toBe("ok");
    expect(snapshot.uptimeSeconds).toBe(12);
    expect(snapshot.databases).toEqual({
      Stock: true,
      StoreFront: true,
    });
  });

  it("reports degraded when a database is disconnected", () => {
    const connections = new Map(createConnections(1));
    connections.set("StoreFront", { readyState: 0 } as Connection);

    const snapshot = new HealthService(connections, () => 0).getSnapshot();

    expect(snapshot.status).toBe("degraded");
    expect(snapshot.databases.StoreFront).toBeFalse();
  });
});
