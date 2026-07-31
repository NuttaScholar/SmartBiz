import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middlewares/auth";
import CustomerLinkService from "../services/customer-link.service";
import { success } from "../utils/response";

export default class CustomerLinkController {
  constructor(private readonly service: CustomerLinkService) {}

  listCustomerLinks = async (
    _request: AuthRequest,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response.json(success(await this.service.listCustomerLinks()));
    } catch (thrown) {
      next(thrown);
    }
  };

  getCustomerLink = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response.json(
        success(
          await this.service.getCustomerLink(
            request.params.customerID,
          ),
        ),
      );
    } catch (thrown) {
      next(thrown);
    }
  };

  createCustomerLink = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response.status(201).json(
        success(
          await this.service.createCustomerLink(request.body?.customerID),
          "Customer link created",
        ),
      );
    } catch (thrown) {
      next(thrown);
    }
  };

  rotateCustomerToken = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response.json(
        success(
          await this.service.rotateCustomerToken(
            request.params.customerID,
          ),
          "Customer token rotated",
        ),
      );
    } catch (thrown) {
      next(thrown);
    }
  };

  disableCustomerLink = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response.json(
        success(
          await this.service.disableCustomerLink(
            request.params.customerID,
          ),
          "Customer link disabled",
        ),
      );
    } catch (thrown) {
      next(thrown);
    }
  };

}
