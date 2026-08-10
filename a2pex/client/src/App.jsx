import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/ui/Loader';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductPage from './pages/ProductPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import NotFound from './pages/NotFound';

// Admin is a separate chunk: storefront visitors never download dashboard
// code, and it's fetched on demand the first time someone visits /admin.
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AddProduct = lazy(() => import('./pages/admin/AddProduct'));
const EditProduct = lazy(() => import('./pages/admin/EditProduct'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loader label="Loading admin" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <Routes>
        {/* Public storefront */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
        </Route>

        {/* Admin (lazy-loaded) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AddProduct />} />
            <Route path="products/:id/edit" element={<EditProduct />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
