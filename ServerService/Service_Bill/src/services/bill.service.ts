const WORKFLOW = ["pending", "processing", "billing", "completed"];

export default {
  async searchOrders(customerName?: string, orderID?: string) {
    return { customerName, orderID };
  },

  async getOrdersByStatus(status: string) {
    return { status, items: [] };
  },

  async createOrder(payload: any) {
    return { orderID: "NEW123", ...payload };
  },

  async updateOrder(orderID: string, payload: any) {
    return { orderID, ...payload };
  },

  async deleteOrder(orderID: string) {
    return true;
  },

  async moveToNextStep(orderID: string) {
    const order = await this.getOrder(orderID);
    const currentIndex = WORKFLOW.indexOf(order.status);

    if (currentIndex === -1 || currentIndex === WORKFLOW.length - 1) {
      throw new Error("Cannot move to next step");
    }

    const nextStatus = WORKFLOW[currentIndex + 1];

    await this.updateStatus(orderID, nextStatus);

    return { orderID, status: nextStatus };
  },

  async markAsIncome(orderID: string) {
    await this.updateStatus(orderID, "income_recorded");
    return { orderID, status: "income_recorded" };
  },

  async markAsDebt(orderID: string) {
    await this.updateStatus(orderID, "debt_recorded");
    return { orderID, status: "debt_recorded" };
  },

  async getStatus(orderID: string) {
    const order = await this.getOrder(orderID);
    return { orderID, status: order.status };
  },

  // Mock DB functions
  async getOrder(orderID: string) {
    return { orderID, status: "billing" }; // mock
  },

  async updateStatus(orderID: string, status: string) {
    return true;
  },
};
