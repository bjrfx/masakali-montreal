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
import CateringByTray from './pages/CateringByTray';
import CateringByTrayOrderSummary from './pages/CateringByTrayOrderSummary';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMenuManagement from './pages/admin/MenuManagement';
import AdminReservations from './pages/admin/ReservationManagement';
import AdminAnalytics from './pages/admin/Analytics';
import AdminCateringManagement from './pages/admin/CateringManagement';
import AdminCateringByTrayManagement from './pages/admin/CateringByTrayManagement';
import AdminContactManagement from './pages/admin/ContactManagement';
import AdminHomepageContentManagement from './pages/admin/HomepageContentManagement';
import AdminNotificationEmailSettings from './pages/admin/NotificationEmailSettings';
import AdminReservationSettings from './pages/admin/ReservationSettings';
import AdminHiringBannerManagement from './pages/admin/HiringBannerManagement';
import AdminOnlineOrderPopupManagement from './pages/admin/OnlineOrderPopupManagement';
import AdminEmailTemplatesManagement from './pages/admin/EmailTemplatesManagement';
import AdminSmartCalendar from './pages/admin/SmartCalendar';
import AdminLayout from './components/AdminLayout';
import ScrollToTop from './components/ScrollToTop';
import HiringBanner from './components/HiringBanner';
import QuickBot from './components/QuickBot/QuickBot';

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

function PublicLayout({ children }) {
  return (
    <>
      <HiringBanner />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

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

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* English Public Routes */}
          <Route path="/" element={<LanguageSync><PublicLayout><Home /></PublicLayout></LanguageSync>} />
          <Route path="/about" element={<LanguageSync><PublicLayout><About /></PublicLayout></LanguageSync>} />
          <Route path="/menu" element={<LanguageSync><PublicLayout><Menu /></PublicLayout></LanguageSync>} />
          <Route path="/locations" element={<LanguageSync><PublicLayout><Locations /></PublicLayout></LanguageSync>} />
          <Route path="/reservations" element={<LanguageSync><PublicLayout><Reservations /></PublicLayout></LanguageSync>} />
          <Route path="/manage-reservations" element={<LanguageSync><PublicLayout><ManageReservations /></PublicLayout></LanguageSync>} />
          <Route path="/catering" element={<LanguageSync><PublicLayout><Catering /></PublicLayout></LanguageSync>} />
          <Route path="/catering-by-tray" element={<LanguageSync><PublicLayout><CateringByTray /></PublicLayout></LanguageSync>} />
          <Route path="/catering-by-tray/order-summary/:id" element={<LanguageSync><PublicLayout><CateringByTrayOrderSummary /></PublicLayout></LanguageSync>} />
          <Route path="/cateringbytray" element={<Navigate to="/catering-by-tray" replace />} />
          <Route path="/contact" element={<LanguageSync><PublicLayout><Contact /></PublicLayout></LanguageSync>} />

          {/* French Public Routes */}
          <Route path="/fr" element={<LanguageSync lang="fr"><PublicLayout><Home /></PublicLayout></LanguageSync>} />
          <Route path="/fr/about" element={<LanguageSync lang="fr"><PublicLayout><About /></PublicLayout></LanguageSync>} />
          <Route path="/fr/menu" element={<LanguageSync lang="fr"><PublicLayout><Menu /></PublicLayout></LanguageSync>} />
          <Route path="/fr/locations" element={<LanguageSync lang="fr"><PublicLayout><Locations /></PublicLayout></LanguageSync>} />
          <Route path="/fr/reservations" element={<LanguageSync lang="fr"><PublicLayout><Reservations /></PublicLayout></LanguageSync>} />
          <Route path="/fr/manage-reservations" element={<LanguageSync lang="fr"><PublicLayout><ManageReservations /></PublicLayout></LanguageSync>} />
          <Route path="/fr/catering" element={<LanguageSync lang="fr"><PublicLayout><Catering /></PublicLayout></LanguageSync>} />
          <Route path="/fr/catering-by-tray" element={<LanguageSync lang="fr"><PublicLayout><CateringByTray /></PublicLayout></LanguageSync>} />
          <Route path="/fr/catering-by-tray/order-summary/:id" element={<LanguageSync lang="fr"><PublicLayout><CateringByTrayOrderSummary /></PublicLayout></LanguageSync>} />
          <Route path="/fr/cateringbytray" element={<Navigate to="/fr/catering-by-tray" replace />} />
          <Route path="/fr/contact" element={<LanguageSync lang="fr"><PublicLayout><Contact /></PublicLayout></LanguageSync>} />

          {/* Admin Routes */}
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
          <Route path="/admin/online-order-popup" element={
            <ProtectedRoute>
              <AdminLayout admin={admin} onLogout={handleLogout}>
                <AdminOnlineOrderPopupManagement token={adminToken} />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/email-templates" element={
            <ProtectedRoute>
              <AdminLayout admin={admin} onLogout={handleLogout}>
                <AdminEmailTemplatesManagement token={adminToken} />
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
          <Route path="/admin/catering-by-tray" element={
            <ProtectedRoute>
              <AdminLayout admin={admin} onLogout={handleLogout}>
                <AdminCateringByTrayManagement token={adminToken} />
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
          <Route path="/admin/reservation-settings" element={
            <ProtectedRoute>
              <AdminLayout admin={admin} onLogout={handleLogout}>
                <AdminReservationSettings token={adminToken} />
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
          <Route path="/admin/hiring" element={
            <ProtectedRoute>
              <AdminLayout admin={admin} onLogout={handleLogout}>
                <AdminHiringBannerManagement token={adminToken} />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/smart-calendar" element={
            <ProtectedRoute>
              <AdminLayout admin={admin} onLogout={handleLogout}>
                <AdminSmartCalendar token={adminToken} />
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
