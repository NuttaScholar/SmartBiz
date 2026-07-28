import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middlewares/auth";
import AdminOrderService from "../services/admin-order.service";
import { success } from "../utils/response";

export default class AdminOrderController {
  constructor(private readonly service: AdminOrderService) {}

  confirmPayment = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response.json(
        success(
          await this.service.confirmPayment(
            request.params.orderID,
            request.authData?.username,
            request.headers.authorization,
          ),
          "Payment confirmed and Bill order created",
        ),
      );
    } catch (thrown) {
      next(thrown);
    }
  };
}
