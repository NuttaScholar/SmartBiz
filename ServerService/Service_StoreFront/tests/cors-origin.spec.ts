import { parseAllowedOrigins } from "../src/utils/cors-origin";

describe("parseAllowedOrigins", () => {
  it("supports Admin and Storefront origins", () => {
    expect(parseAllowedOrigins(
      "http://localhost:3030,http://localhost:4030",
    )).toEqual([
      "http://localhost:3030",
      "http://localhost:4030",
    ]);
  });

  it("trims, normalizes, and removes duplicate origins", () => {
    expect(parseAllowedOrigins(
      " http://localhost:4030/ , http://localhost:4030 ",
    )).toEqual(["http://localhost:4030"]);
  });

  it("rejects invalid origins", () => {
    expect(() => parseAllowedOrigins("localhost:4030"))
      .toThrowError("Invalid CORS origin protocol: localhost:4030");
  });
});
