// File: frontend/src/App.js

import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { NotificationProvider } from "./contexts/NotificationContext";

import Header from "./components/layout/header/Header";
import Footer from "./components/layout/footer/Footer";
import CookieBanner from "./components/CookieBanner";

import Home from "./pages/home/home";
import CategoryPage from "./pages/category/CategoryPage";
import ProductoPage from "./pages/producto/producto";
import Carrito from "./pages/carrito/carrito";
import Wishlist from "./pages/wishlist/wishlist";
import CheckoutWizard from "./pages/checkout/CheckoutWizard";
import Exito from "./pages/exito/exito";
import NotFound from "./pages/notfound/NotFound";

import LoginPage from "./pages/LoginPage";
import AdminLayout from "./pages/admin/AdminLayout";

import ProductsAndCategoriesTab from "./pages/admin/tabs/ProductsAndCategoriesTab";
import OrdersTab from "./pages/admin/tabs/OrdersTab";
import MetricsTab from "./pages/admin/tabs/MetricsTab";
import BulkTab from "./pages/admin/tabs/BulkTab";
import DropshipCenterTab from "./pages/admin/tabs/DropshipCenterTab";
import SettingsTab from "./pages/admin/tabs/SettingsTab";
import SuppliersTab from "./pages/admin/tabs/SuppliersTab";
import AlertsTab from "./pages/admin/tabs/AlertsTab";
import MessagesTab from "./pages/admin/tabs/MessagesTab";
import EmailLogsTab from "./pages/admin/tabs/EmailLogsTab";
import EmailTemplatesTab from "./pages/admin/tabs/EmailTemplatesTab";
import NewsletterTab from "./pages/admin/tabs/NewsletterTab";
import NewsletterCampaignTab from "./pages/admin/tabs/NewsletterCampaignTab";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import CookiesPolicy from "./pages/CookiesPolicy";

import { getToken } from "./services/authService";
import { fetchCategories as loadCategories } from "./services/categoryService";

import "./App.css";

function PrivateRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

function AppWrapper() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
    console.log("👉 API base URL:", BASE);

    loadCategories()
      .then(setCategories)
      .catch(err => {
        console.error("❌ Error cargando categorías:", err);
      });
  }, []);

  return (
    <>
      <CookieBanner />

      {!isAdmin && <Header categories={categories} />}

      <div style={{ marginTop: isAdmin ? 0 : 64 }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="products-categories" replace />} />
            <Route path="products-categories" element={<ProductsAndCategoriesTab />} />
            <Route path="orders" element={<OrdersTab />} />
            <Route path="metrics" element={<MetricsTab />} />
            <Route path="bulk" element={<BulkTab />} />
            <Route path="dropship" element={<DropshipCenterTab />} />
            <Route path="settings" element={<SettingsTab />} />
            <Route path="suppliers" element={<SuppliersTab />} />
            <Route path="alerts" element={<AlertsTab />} />
            <Route path="messages" element={<MessagesTab />} />
            <Route path="email-logs" element={<EmailLogsTab />} />
            <Route path="email-templates" element={<EmailTemplatesTab />} />
            <Route path="newsletter" element={<NewsletterTab />} />
            <Route path="newsletter-campaign" element={<NewsletterCampaignTab />} />
          </Route>

          <Route path="/" element={<Home />} />
          <Route path="/categoria" element={<CategoryPage />} />
          <Route path="/categoria/:name" element={<CategoryPage />} />
          <Route path="/categoria/:name/:subname" element={<CategoryPage />} />
          <Route path="/producto/:id" element={<ProductoPage />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<CheckoutWizard />} />
          <Route path="/exito" element={<Exito />} />
          <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
          <Route path="/terminos-condiciones" element={<TermsAndConditions />} />
          <Route path="/cookies" element={<CookiesPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {!isAdmin && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <WishlistProvider>
          <NotificationProvider>
            <AppWrapper />
          </NotificationProvider>
        </WishlistProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
