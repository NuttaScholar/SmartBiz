import { Router } from "express";
import BillController from "../controllers/bill.controller";
import { Model } from "mongoose";
import { OrderDocument } from "../models/order.interface";
import { ContactDocument } from "../models/contact.interface";
import { ProductDocument } from "../models/product.interface";

export default function billRoutes(
    OrderModel: Model<OrderDocument>,
    ContactModel: Model<ContactDocument>,
    ProductModel: Model<ProductDocument>
) {
    const router = Router();
    const controller = new BillController(OrderModel, ContactModel, ProductModel);

    // Mounted at /bill. Controllers check user roles or service scopes for each endpoint.

    //*************************************************
    // Order search and summaries
    //*************************************************

    /**
     * GET /bill/search
     * Search online and direct orders. Optional query: customerID, orderID, status, source.
     */
    router.get("/search", (req, res) =>
        controller.searchOrders(req, res));

    /**
     * GET /bill/status/count
     * Count orders by status. Optional query: customerID, orderID, source.
     * customerID supports partial matching, as in /search.
     */
    router.get("/status/count", (req, res) =>
        controller.countOrdersByStatus(req, res));

    /**
     * GET /bill/status/:status
     * List orders by status. Optional query: source=online or direct.
     * Keep after /status/count to avoid interpreting count as a status.
     */
    router.get("/status/:status", (req, res) =>
        controller.getOrdersByStatus(req, res));

    /**
     * GET /bill/product/:productID/usage
     * Check whether the product is used by orders and return the order count.
     */
    router.get("/product/:productID/usage", (req, res) =>
        controller.getProductUsage(req, res));

    //*************************************************
    // Payment evidence
    //*************************************************

    /**
     * GET /bill/evidence/:orderID
     * Read an online or direct order with payment evidence metadata.
     * Query: customerID (required; must match the order owner).
     * Service_StoreFront uses the returned objectKey to generate a signed URL.
     */
    router.get("/evidence/:orderID", (req, res) =>
        controller.getAdminEvidenceOrder(req, res));

    /**
     * PATCH /bill/evidence/:orderID
     * Save or replace direct-order evidence without changing the order status.
     * Body: customerID, evidence { fileName, mimeType, objectKey, updatedAt }.
     * Accepts uploaded-file metadata, not binary file data.
     */
    router.patch("/evidence/:orderID", (req, res) =>
        controller.updateDirectEvidence(req, res));

    //*************************************************
    // StoreFront orders
    //*************************************************

    /**
     * GET /bill/storefront/payment-confirmations
     * List online orders in PaymentNotified status awaiting payment confirmation.
     */
    router.get("/storefront/payment-confirmations", (req, res) =>
        controller.listPaymentConfirmations(req, res));

    /**
     * GET /bill/storefront/history
     * List online and direct orders for a customer, newest first.
     * Query: customerID (required), limit (default 20, maximum 100), cursor.
     * Returns items, hasMore, and nextCursor for pagination.
     */
    router.get("/storefront/history", (req, res) =>
        controller.getCustomerOrderHistory(req, res));

    /**
     * GET /bill/storefront
     * List online orders for a customer.
     * Query: customerID (required), orderID (optional single-order filter).
     */
    router.get("/storefront", (req, res) =>
        controller.getStorefrontOrders(req, res));

    /**
     * POST /bill/storefront
     * Create an online order with initial status Submitted.
     * Body: customerID, items, totalAmount, and optional orderID.
     */
    router.post("/storefront", (req, res) =>
        controller.createStorefrontOrder(req, res));

    /**
     * PATCH /bill/storefront/:orderID/evidence
     * Save online evidence before payment confirmation and set PaymentNotified.
     * Body: customerID, evidence { fileName, mimeType, objectKey, updatedAt }.
     */
    router.patch("/storefront/:orderID/evidence", (req, res) =>
        controller.updateStorefrontEvidence(req, res));

    /**
     * PATCH /bill/storefront/:orderID/payment-confirmation
     * Confirm an online order in PaymentNotified status with evidence.
     * Body: confirmedBy. Changes the status to PrepareProduct on success.
     */
    router.patch("/storefront/:orderID/payment-confirmation", (req, res) =>
        controller.confirmStorefrontPayment(req, res));

    /**
     * DELETE /bill/storefront/:orderID
     * Cancel a customer online order in Submitted status and restore stock.
     * Query: customerID (required). Changes the status to Cancelled.
     */
    router.delete("/storefront/:orderID", (req, res) =>
        controller.cancelStorefrontOrder(req, res));

    //*************************************************
    // Order management and status transitions
    //*************************************************

    /**
     * POST /bill
     * Create a direct order.
     * Body: customerID, items, totalAmount.
     */
    router.post("/", (req, res) =>
        controller.createOrder(req, res));

    /**
     * PUT /bill/:orderID
     * Update a direct order while its status permits editing.
     * Body: customerID, items, and/or totalAmount.
     */
    router.put("/:orderID", (req, res) =>
        controller.updateOrder(req, res));

    /**
     * DELETE /bill/:orderID
     * Delete a direct order before Billing, or cancel an online order before payment confirmation.
     * Restores stock; online orders are retained with status Cancelled.
     */
    router.delete("/:orderID", (req, res) =>
        controller.deleteOrder(req, res));

    /**
     * PATCH /bill/:orderID/next
     * Advance the order according to its source workflow and allowed status transitions.
     */
    router.patch("/:orderID/next", (req, res) =>
        controller.moveToNextStep(req, res));

    /**
     * PATCH /bill/:orderID/billing/income
     * Record payment from Billing status and complete the income-recording workflow.
     */
    router.patch("/:orderID/billing/income", (req, res) =>
        controller.markAsIncome(req, res));

    /**
     * PATCH /bill/:orderID/billing/debt
     * Mark a Billing order as unpaid by changing its status to WaitingPayment.
     */
    router.patch("/:orderID/billing/debt", (req, res) =>
        controller.markAsDebt(req, res));

    /**
     * GET /bill/:orderID/status
     * Read the current status of the order identified by orderID.
     */
    router.get("/:orderID/status", (req, res) =>
        controller.getStatus(req, res));

    return router;
}
