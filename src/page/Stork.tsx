import { useState } from "react";
import ProductList, { Product } from "../component/Molecules/ProductList";
import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";
import axios from "axios";
import Option_Button from "../component/Molecules/Option_Button";
import DialogAddProduct from "../dialog/DialogAddProduct";
import DialogEditProduct from "../dialog/DialogEditProduct";

const Page_Stock: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialogAddProduct, setOpenAddProduct] = useState<boolean>(false);
  const [openDialogEditProduct, setOpenEditProduct] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/product/getProducts');
      if (response.status === 200) {
        setProducts(response.data);
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (productId: string) => {
    setSelectedProductId(productId);
    setOpenEditProduct(true);
  };

  return (
    <>
      <AppBar_c role="admin" page={pageApp_e.stock} />
      <ProductList
        products={products}
        loading={loading}
        error={error}
        fetchProducts={fetchProducts}
        onEditProduct={handleEditProduct}
      />

      <Option_Button 
        onOpenDialog={() => setOpenAddProduct(true)}
      />

      <DialogAddProduct 
        open={openDialogAddProduct} 
        onClose={() => setOpenAddProduct(false)}
      />

      <DialogEditProduct 
        open={openDialogEditProduct} 
        onClose={() => setOpenEditProduct(false)}
        productId={selectedProductId}
      />
    </>
  );
};

export default Page_Stock;
