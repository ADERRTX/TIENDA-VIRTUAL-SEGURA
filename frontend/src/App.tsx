import ShipmentsPage from './pages/ShipmentsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import { Route, Routes } from 'react-router-dom';
import RequireRole from './components/RequireRole';
import PublicLayout from './layouts/PublicLayout';
import AdminAuditPage from './pages/AdminAuditPage';
import AdminConfigPage from './pages/AdminConfigPage';
import AdminSellersPage from './pages/AdminSellersPage';
import AdminUsersPage from './pages/AdminUsersPage';
import CartPage from './pages/CartPage';
import CatalogPage from './pages/CatalogPage';
import CheckoutPage from './pages/CheckoutPage';
import ClaimDetailPage from './pages/ClaimDetailPage';
import ClaimsPage from './pages/ClaimsPage';
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import OrdersPage from './pages/OrdersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import RegisterPage from './pages/RegisterPage';
import SellerApplyPage from './pages/SellerApplyPage';
import SellerOrdersPage from './pages/SellerOrdersPage';
import SellerProductsPage from './pages/SellerProductsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="catalogo/:id" element={<ProductDetailPage />} />
        <Route path="carrito" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="pedidos" element={<OrdersPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />

        <Route element={<RequireRole roles={['BUYER']} />}>
          <Route path="vender" element={<SellerApplyPage />} />
        </Route>
        <Route element={<RequireRole roles={['SUPPORT', 'ADMIN']} />}>
  <Route path="envios" element={<ShipmentsPage />} />
</Route>

        <Route element={<RequireRole roles={['BUYER', 'SELLER', 'SUPPORT', 'ADMIN']} />}>
          <Route path="reclamos" element={<ClaimsPage />} />
          <Route path="reclamos/:id" element={<ClaimDetailPage />} />
        </Route>

        <Route element={<RequireRole roles={['SELLER']} />}>
          <Route path="vendedor/pedidos" element={<SellerOrdersPage />} />
          <Route path="vendedor/productos" element={<SellerProductsPage />} />
        </Route>

        <Route element={<RequireRole roles={['ADMIN']} />}>
          <Route path="admin/vendedores" element={<AdminSellersPage />} />
          <Route path="admin/usuarios" element={<AdminUsersPage />} />
          <Route path="admin/auditoria" element={<AdminAuditPage />} />
          <Route path="admin/configuracion" element={<AdminConfigPage />} />
          <Route path="admin/reportes" element={<AdminReportsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}