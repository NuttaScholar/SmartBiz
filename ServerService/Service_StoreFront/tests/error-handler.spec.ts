import type { Request, Response } from "express";
import {
  errorHandler,
  notFoundHandler,
} from "../src/middlewares/error-handler";
import requestContext from "../src/middlewares/request-context";
import AppError from "../src/utils/app-error";

describe("error handlers", () => {
  function createResponse() {
    const response = {
      json: jasmine.createSpy("json"),
      locals: {},
      setHeader: jasmine.createSpy("setHeader"),
    } as unknown as Response;
    response.status = jasmine
      .createSpy("status")
      .and.returnValue(response);
    return response;
  }

  function createRequest(
    overrides: Partial<Request> = {},
  ): Request {
    return {
      method: "GET",
      path: "/storefront/admin/customer-links/CUST-001",
      ...overrides,
    } as Request;
  }

  it("returns an operational 404 without logging a server error", () => {
    const response = createResponse();
    const consoleError = spyOn(console, "error");
    const consoleWarn = spyOn(console, "warn");

    errorHandler(
      new AppError("Customer link not found", 404),
      createRequest(),
      response,
      jasmine.createSpy("next"),
    );

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: "Customer link not found",
      status: 404,
    });
    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
  });

  it("logs authentication failures as structured warnings without a stack", () => {
    const response = createResponse();
    response.locals.requestID = "request-401";
    const consoleWarn = spyOn(console, "warn");

    errorHandler(
      new AppError("Access denied", 403),
      createRequest({
        authData: {
          username: "admin",
          role: 0,
          type: "accessToken",
        },
      } as Partial<Request>),
      response,
      jasmine.createSpy("next"),
    );

    const warning = JSON.parse(
      consoleWarn.calls.mostRecent().args[0],
    );
    expect(warning).toEqual({
      level: "warn",
      event: "request_failed",
      requestID: "request-401",
      method: "GET",
      path: "/storefront/admin/customer-links/CUST-001",
      status: 403,
      principal: "admin",
      message: "Access denied",
    });
  });

  it("logs unexpected errors and returns status 500", () => {
    const response = createResponse();
    response.locals.requestID = "request-500";
    const consoleError = spyOn(console, "error");
    const thrown = new Error("Database unavailable");

    errorHandler(
      thrown,
      createRequest(),
      response,
      jasmine.createSpy("next"),
    );

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: "Database unavailable",
      status: 500,
    });
    const loggedError = JSON.parse(
      consoleError.calls.mostRecent().args[0],
    );
    expect(loggedError).toEqual(jasmine.objectContaining({
      level: "error",
      event: "request_failed",
      requestID: "request-500",
      method: "GET",
      path: "/storefront/admin/customer-links/CUST-001",
      status: 500,
      message: "Database unavailable",
      stack: jasmine.stringContaining("Database unavailable"),
    }));
  });

  it("returns a route-level 404 response", () => {
    const response = createResponse();

    notFoundHandler(
      {
        method: "GET",
        path: "/missing",
      } as Request,
      response,
    );

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: "Route GET /missing not found",
      status: 404,
    });
  });

  it("preserves a valid request ID for response correlation", () => {
    const response = createResponse();
    const next = jasmine.createSpy("next");

    requestContext(
      {
        header: jasmine
          .createSpy("header")
          .and.returnValue("client-request-123"),
      } as unknown as Request,
      response,
      next,
    );

    expect(response.locals.requestID).toBe("client-request-123");
    expect(response.setHeader)
      .toHaveBeenCalledWith("X-Request-ID", "client-request-123");
    expect(next).toHaveBeenCalled();
  });
});
