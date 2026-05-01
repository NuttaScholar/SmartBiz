import BillRepo from "../repositories/bill.repo";

export default {
  async getBillByOrderID(orderID: string) {
    return await BillRepo.findByOrderID(orderID);
  },
};
