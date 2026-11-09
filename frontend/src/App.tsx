import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import RequireRole from './components/RequireRole';
import PublicLayout from './layouts/PublicLayout';
import { Spinner } from './components/ui/Spinner';

// Carga perezosa (code-splitting) de todas las páginas de la aplicación
const HomePage = lazy(() => import('./pages/HomePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const SellerApplyPage = lazy(() => import('./pages/SellerApplyPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ShipmentsPage = lazy(() => import('./pages/ShipmentsPage'));
const ClaimsPage = lazy(() => import('./pages/ClaimsPage'));
const ClaimDetailPage = lazy(() => import('./pages/ClaimDetailPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const SellerOrdersPage = lazy(() => import('./pages/SellerOrdersPage'));
const SellerProductsPage = lazy(() => import('./pages/SellerProductsPage'));
const SellerStorePage = lazy(() => import('./pages/SellerStorePage'));
const AdminJobsPage = lazy(() => import('./pages/AdminJobsPage'));
const AdminSellersPage = lazy(() => import('./pages/AdminSellersPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminAuditPage = lazy(() => import('./pages/AdminAuditPage'));
const AdminConfigPage = lazy(() => import('./pages/AdminConfigPage'));
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center py-16 animate-fade-in">
      <div className="flex flex-col items-center gap-3 text-ink-muted">
        <Spinner size="lg" className="text-brand" ariaLabel="Cargando contenido..." />
        <span className="text-xs font-medium tracking-wide">Cargando...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="catalogo" element={<CatalogPage />} />
          <Route path="catalogo/:id" element={<ProductDetailPage />} />
          <Route path="carrito" element={<CartPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="registro" element={<RegisterPage />} />

          <Route element={<RequireRole roles={['BUYER']} />}>
            <Route path="vender" element={<SellerApplyPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="pedidos" element={<OrdersPage />} />
          </Route>

          <Route element={<RequireRole roles={['SUPPORT', 'ADMIN']} />}>
            <Route path="envios" element={<ShipmentsPage />} />
          </Route>

          <Route element={<RequireRole roles={['BUYER', 'SELLER', 'SUPPORT', 'ADMIN']} />}>
            <Route path="reclamos" element={<ClaimsPage />} />
            <Route path="reclamos/:id" element={<ClaimDetailPage />} />
            <Route path="cuenta" element={<AccountPage />} />
          </Route>

          <Route element={<RequireRole roles={['SELLER']} />}>
            <Route path="vendedor/pedidos" element={<SellerOrdersPage />} />
            <Route path="vendedor/productos" element={<SellerProductsPage />} />
            <Route path="vendedor/tienda" element={<SellerStorePage />} />
          </Route>

          <Route element={<RequireRole roles={['ADMIN']} />}>
            <Route path="admin/simulador" element={<AdminJobsPage />} />
            <Route path="admin/vendedores" element={<AdminSellersPage />} />
            <Route path="admin/usuarios" element={<AdminUsersPage />} />
            <Route path="admin/auditoria" element={<AdminAuditPage />} />
            <Route path="admin/configuracion" element={<AdminConfigPage />} />
            <Route path="admin/reportes" element={<AdminReportsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
