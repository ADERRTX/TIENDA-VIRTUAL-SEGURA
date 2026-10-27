
import AdminSellersPage from './pages/AdminSellersPage';
import SellerApplyPage from './pages/SellerApplyPage';
import ClaimDetailPage from './pages/ClaimDetailPage';
import ClaimsPage from './pages/ClaimsPage';
import SellerProductsPage from './pages/SellerProductsPage';
import RequireRole from './components/RequireRole';
import SellerOrdersPage from './pages/SellerOrdersPage';
import OrdersPage from './pages/OrdersPage';
import CheckoutPage from './pages/CheckoutPage';
import { Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import CartPage from './pages/CartPage';
import CatalogPage from './pages/CatalogPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import ProductDetailPage from './pages/ProductDetailPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <Routes>
      
      <Route element={<PublicLayout />}>
      <Route element={<RequireRole roles={['BUYER']} />}>
  <Route path="vender" element={<SellerApplyPage />} />
</Route>
<Route element={<RequireRole roles={['ADMIN']} />}>
  <Route path="admin/vendedores" element={<AdminSellersPage />} />
</Route>
      <Route element={<RequireRole roles={['BUYER', 'SELLER', 'SUPPORT', 'ADMIN']} />}>
  <Route path="reclamos" element={<ClaimsPage />} />
  <Route path="reclamos/:id" element={<ClaimDetailPage />} />
</Route>
        <Route index element={<HomePage />} />
  <Route element={<RequireRole roles={['SELLER']} />}>
  <Route path="vendedor/pedidos" element={<SellerOrdersPage />} />
   <Route path="vendedor/productos" element={<SellerProductsPage />} />
</Route>
        <Route path="pedidos" element={<OrdersPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="catalogo/:id" element={<ProductDetailPage />} />
        <Route path="carrito" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}