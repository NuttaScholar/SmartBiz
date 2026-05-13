import Discount from "../models/discount.model";

export default {
  getByCustomer(customerID: string) {
    return Discount.findOne({ customerID });
  },

  updateByCustomer(customerID: string, discounts: any[]) {
    return Discount.findOneAndUpdate(
      { customerID },
      { discounts },
      { new: true, upsert: true }
    );
  }
};
