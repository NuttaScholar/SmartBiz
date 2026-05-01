export default {
  async findByOrderID(orderID: string) {
    // ดึงข้อมูลจาก DB จริง
    return {
      orderID,
      items: [
        { name: "สินค้า A", qty: 2, price: 150 },
        { name: "สินค้า B", qty: 1, price: 299 },
      ],
    };
  },
};
