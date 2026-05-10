import { getDB } from "../database/mongo";

const COLLECTION = "orders";

export default {
  async findByCustomerAndOrder(customerName?: string, orderID?: string) {
    const db = getDB();
    const query: any = {};

    if (customerName) query.customerName = { $regex: customerName, $options: "i" };
    if (orderID) query.orderID = orderID;

    return db.collection(COLLECTION).find(query).toArray();
  },

  async findByStatus(status: string) {
    const db = getDB();
    return db.collection(COLLECTION).find({ status }).toArray();
  },

  async createOrder(data: any) {
    const db = getDB();
    await db.collection(COLLECTION).insertOne(data);
    return data;
  },

  async updateOrder(orderID: string, data: any) {
    const db = getDB();
    await db.collection(COLLECTION).updateOne({ orderID }, { $set: data });
    return { orderID, ...data };
  },

  async deleteOrder(orderID: string) {
    const db = getDB();
    await db.collection(COLLECTION).deleteOne({ orderID });
    return true;
  },

  async updateStatus(orderID: string, status: string) {
    const db = getDB();
    await db.collection(COLLECTION).updateOne({ orderID }, { $set: { status } });
    return { orderID, status };
  },

  async getOrder(orderID: string) {
    const db = getDB();
    return db.collection(COLLECTION).findOne({ orderID });
  }
};
