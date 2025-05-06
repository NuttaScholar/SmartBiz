import { billType_e } from '../type'

export type product_t = {
  _id: string,
  name: string,
  quantity: number,
  unit_price: number,
  total_amount?: number
}
export type Bill_t = {
  no: number;
  date: Date;
  billName: string;
  price: number;
  status: billType_e;
  products?: product_t[];
}

function createBill(no: number, date: string, billName: string, status: billType_e, rawProducts: Omit<product_t, 'total_amount'>[]): Bill_t {
    const products = rawProducts.map(product => ({
      ...product,
      total_amount: product.quantity * product.unit_price,
    }));
  
    const price = products.reduce((sum, p) => sum + p.total_amount!, 0);
  
    return {
      no,
      date: new Date(date),
      billName,
      price,
      status,
      products,
    };
}

export const BillList: Bill_t[] = [
    createBill(1, '2025-05-01', 'Mr.1', billType_e.not_paid, [
      { _id: 'P001', name: 'Pen', quantity: 10, unit_price: 10 },
      { _id: 'P002', name: 'Notebook', quantity: 5, unit_price: 50 },
      { _id: 'P003', name: 'Ruler', quantity: 2, unit_price: 50 },
      { _id: 'P004', name: 'Eraser', quantity: 10, unit_price: 5 },
      { _id: 'P005', name: 'Pencil', quantity: 30, unit_price: 15 },
    ]),
    createBill(2, '2025-05-02', 'Mr.2', billType_e.already_paid, [
      { _id: 'P006', name: 'Marker', quantity: 6, unit_price: 50 },
      { _id: 'P007', name: 'Board', quantity: 1, unit_price: 300 },
    ]),
    createBill(3, '2025-05-03', 'Mr.3', billType_e.must_delivered, [
      { _id: 'P008', name: 'Chair', quantity: 2, unit_price: 200 },
      { _id: 'P009', name: 'Desk Lamp', quantity: 3, unit_price: 120 },
    ]),
    createBill(4, '2025-05-04', 'Mr.1', billType_e.delivered, [
      { _id: 'P010', name: 'Table', quantity: 1, unit_price: 800 },
      { _id: 'P011', name: 'Fan', quantity: 2, unit_price: 310 },
    ]),
    createBill(5, '2025-05-05', 'Mr.2', billType_e.not_paid, [
      { _id: 'P012', name: 'Laptop Bag', quantity: 4, unit_price: 250 },
      { _id: 'P013', name: 'Mouse', quantity: 3, unit_price: 80 },
    ]),
    createBill(6, '2025-05-06', 'Mr.3', billType_e.already_paid, [
      { _id: 'P014', name: 'Whiteboard', quantity: 1, unit_price: 500 },
      { _id: 'P015', name: 'Marker Set', quantity: 2, unit_price: 215 },
    ]),
    createBill(7, '2025-05-07', 'Mr.1', billType_e.must_delivered, [
      { _id: 'P016', name: 'Bookshelf', quantity: 1, unit_price: 1200 },
      { _id: 'P017', name: 'Wall Clock', quantity: 2, unit_price: 190 },
    ]),
    createBill(8, '2025-05-08', 'Mr.2', billType_e.delivered, [
      { _id: 'P018', name: 'Monitor', quantity: 1, unit_price: 1500 },
      { _id: 'P019', name: 'HDMI Cable', quantity: 3, unit_price: 50.65 },
      { _id: 'P020', name: 'Power Strip', quantity: 1, unit_price: 35 },
    ]),
  ];
  