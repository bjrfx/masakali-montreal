import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Menu from './pages/Menu';
import Locations from './pages/Locations';
import Reservations from './pages/Reservations';
import ManageReservations from './pages/ManageReservations';
import Catering from './pages/Catering';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMenuManagement from './pages/admin/MenuManagement';
import AdminReservations from './pages/admin/ReservationManagement';
import AdminAnalytics from './pages/admin/Analytics';
import AdminCateringManagement from './pages/admin/CateringManagement';
import AdminContactManagement from './pages/admin/ContactManagement';
import AdminHomepageContentManagement from './pages/admin/HomepageContentManagement';
import AdminNotificationEmailSettings from './pages/admin/NotificationEmailSettings';
import AdminLayout from './components/AdminLayout';
import ScrollToTop from './components/ScrollToTop';
import QuickBot from './components/QuickBot/QuickBot';

/**
 * Wrapper that syncs the URL language prefix with i18next
 * and updates the document's lang attribute + meta tags.
 */
function LanguageSync({ children, lang }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const targetLang = lang === 'fr' ? 'fr' : 'en';
    if (i18n.language !== targetLang) {
      i18n.changeLanguage(targetLang);
    }
    document.documentElement.lang = targetLang;
    localStorage.setItem('i18nextLng', targetLang);
  }, [lang, i18n]);

  return children;
}

/**
 * Renders the public page layout (Navbar + Page + Footer)
 */
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

/**
 * 404 page component
 */
function NotFoundPage() {
  const { t, i18n } = useTranslation();
  const homeLink = i18n.language === 'fr' ? '/fr' : '/';

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-display text-gold-gradient mb-4">404</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8">{t('common.pageNotFound')}</p>
          <a href={homeLink} className="btn-gold">{t('common.returnHome')}</a>
        </div>
      </div>
    </PublicLayout>
  );
}

function App() {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    if (adminToken) {
      try {
        const stored = localStorage.getItem('adminData');
        if (stored) setAdmin(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        setAdminToken(null);
      }
    }
  }, [adminToken]);

  const handleLogin = (token, adminData) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminData', JSON.stringify(adminData));
    setAdminToken(token);
    setAdmin(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdminToken(null);
    setAdmin(null);
  };

  const ProtectedRoute = ({ children }) => {
    if (!adminToken) return <Navigate to="/admin/login" replace />;
    return children;
  };

  /**
   * Build the public routes for a given language prefix.
   * prefix = "" for English, "fr" for French.
   */
  const publicRoutes = (prefix) => {
    const base = prefix ? `/${prefix}` : '';
    return (
      <Route path={base || '/'} element={<LanguageSync><PublicLayout><Home /></PublicLayout></LanguageSync>}>
      </Route>
    );
  };

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* ===== English public routes ===== */}
          <Route path="/" element={<LanguageSync><PublicLayout><Home /></PublicLayout></LanguageSync>} />
          <Route path="/about" element={<LanguageSync><PublicLayout><About /></PublicLayout></LanguageSync>} />
          <Route path="/menu" element={<LanguageSync><PublicLayout><Menu /></PublicLayout></LanguageSync>} />
          <Route path="/locations" element={<LanguageSync><PublicLayout><Locations /></PublicLayout></LanguageSync>} />
          <Route path="/reservations" element={<LanguageSync><PublicLayout><Reservations /></PublicLayout></LanguageSync>} />
          <Route path="/manage-reservations" element={<LanguageSync><PublicLayout><ManageReservations /></PublicLayout></LanguageSync>} />
          <Route path="/catering" element={<LanguageSync><PublicLayout><Catering /></PublicLayout></LanguageSync>} />
          <Route path="/contact" element={<LanguageSync><PublicLayout><Contact /></PublicLayout></LanguageSync>} />

          {/* ===== French public routes (/fr prefix) ===== */}
          <Route path="/fr" element={<LanguageSync lang="fr"><PublicLayout><Home /></PublicLayout></LanguageSync>} />
          <Route path="/fr/about" element={<LanguageSync lang="fr"><PublicLayout><About /></PublicLayout></LanguageSync>} />
          <Route path="/fr/menu" element={<LanguageSync lang="fr"><PublicLayout><Menu /></PublicLayout></LanguageSync>} />
          <Route path="/fr/locations" element={<LanguageSync lang="fr"><PublicLayout><Locations /></PublicLayout></LanguageSync>} />
          <Route path="/fr/reservations" element={<LanguageSync lang="fr"><PublicLayout><Reservations /></PublicLayout></LanguageSync>} />
          <Route path="/fr/manage-reservations" element={<LanguageSync lang="fr"><PublicLayout><ManageReservations /></PublicLayout></LanguageSync>} />
          <Route path="/fr/catering" element={<LanguageSync lang="fr"><PublicLayout><Catering /></PublicLayout></LanguageSync>} />
          <Route path="/fr/contact" element={<LanguageSync lang="fr"><PublicLayout><Contact /></PublicLayout></LanguageSync>} />

          {/* Admin Routes (English only) */}
          <Route path="/admin/login" element={
            adminToken ? <Navigate to="/admin" replace /> : <AdminLogin onLogin={handleLogin} />
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout admin={admin} onLogout={handleLogout}>
                <AdminDashboard token={adminToken} />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/menu" element={
            <ProtectedRoute>
              <AdminLayout admin={admin} onLogout={handleLogout}>
                <AdminMenuManagement token={adminToken} />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/homepage" element={
            <ProtectedRoute>
              <AdminLayout admin={admin} onLogout={handleLogout}>
                <AdminHomepageContentManagement token={adminToken} />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/reservations" element={
            <ProtectedRoute>
              <AdminLayout admin={admin} onLogout={handleLogout}>
                <AdminReservations token={adminToken} />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/catering" element={
            <ProtectedRoute>
              <AdminLayout admin={admin} onLogout={handleLogout}>
                <AdminCateringManagement token={adminToken} />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/contact" element={
            <ProtectedRoute>
              <AdminLayout admin={admin} onLogout={handleLogout}>
                <AdminContactManagement token={adminToken} />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/notifications" element={
            <ProtectedRoute>
              <AdminLayout admin={admin} onLogout={handleLogout}>
                <AdminNotificationEmailSettings token={adminToken} />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute>
              <AdminLayout admin={admin} onLogout={handleLogout}>
                <AdminAnalytics token={adminToken} />
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="/fr/*" element={<LanguageSync lang="fr"><NotFoundPage /></LanguageSync>} />
          <Route path="*" element={<LanguageSync><NotFoundPage /></LanguageSync>} />
        </Routes>
      </Router>
      <QuickBot />
    </ThemeProvider>
  );
}

export default App;
