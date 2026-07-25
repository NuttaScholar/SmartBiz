import type { NextFunction, Request, Response } from "express";
import StorefrontService from "../services/storefront.service";
import { success } from "../utils/response";

export default class StorefrontController {
  constructor(private readonly service: StorefrontService) {}

  getSession = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response.json(
        success(await this.service.getSession(request.params.customerToken)),
      );
    } catch (thrown) {
      next(thrown);
    }
  };

  getProducts = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = typeof request.query.q === "string"
        ? request.query.q
        : undefined;
      response.json(
        success(
          await this.service.getProducts(
            request.params.customerToken,
            query,
          ),
        ),
      );
    } catch (thrown) {
      next(thrown);
    }
  };

  getOrders = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response.json(
        success(await this.service.getOrders(request.params.customerToken)),
      );
    } catch (thrown) {
      next(thrown);
    }
  };

  getOrder = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response.json(
        success(
          await this.service.getOrder(
            request.params.customerToken,
            request.params.orderID,
          ),
        ),
      );
    } catch (thrown) {
      next(thrown);
    }
  };

  createOrder = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response
        .status(201)
        .json(
          success(
            await this.service.createOrder(
              request.params.customerToken,
              request.body,
            ),
            "Order created",
          ),
        );
    } catch (thrown) {
      next(thrown);
    }
  };

  updateEvidence = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response.json(
        success(
          await this.service.updateEvidence(
            request.params.customerToken,
            request.params.orderID,
            request.body,
          ),
          "Evidence updated",
        ),
      );
    } catch (thrown) {
      next(thrown);
    }
  };

  cancelOrder = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response.json(
        success(
          await this.service.cancelOrder(
            request.params.customerToken,
            request.params.orderID,
          ),
          "Order cancelled",
        ),
      );
    } catch (thrown) {
      next(thrown);
    }
  };
}
