import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { AdminProtectedRoute } from './components/ProtectedRoute';

import Home                from './pages/Home';
import Search              from './pages/Search';
import ListingDetail       from './pages/ListingDetail';
import Login               from './pages/Login';
import Register            from './pages/Register';
import RegisterDealer      from './pages/RegisterDealer';

import DealerDashboard     from './pages/dealer/DealerDashboard';
import DealerListings      from './pages/dealer/DealerListings';
import DealerCreateListing from './pages/dealer/DealerCreateListing';
import DealerEditListing   from './pages/dealer/DealerEditListing';
import DealerProfile       from './pages/dealer/DealerProfile';

import UserProfile         from './pages/user/UserProfile';
import UserEnquiries       from './pages/user/UserEnquiries';

import AdminLogin          from './pages/admin/AdminLogin';
import AdminDashboard      from './pages/admin/AdminDashboard';
import AdminUsers          from './pages/admin/AdminUsers';
import AdminDealers        from './pages/admin/AdminDealers';
import AdminListings       from './pages/admin/AdminListings';
import AdminBoosts         from './pages/admin/AdminBoosts';

const NotFound = () => (
  <div style={{ color: '#c9a84c', textAlign: 'center', padding: '4rem',
    background: '#0a0a0a', minHeight: '100vh' }}>
    <h1 style={{ fontSize: '4rem' }}>404</h1>
    <p>Page not found.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          theme="dark"
          toastStyle={{ backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #2a2a2a' }}
        />
        <Routes>
          {/* Public */}
          <Route path="/"                element={<Home />} />
          <Route path="/listings"        element={<Search />} />
          <Route path="/listings/:id"    element={<ListingDetail />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/register/dealer" element={<RegisterDealer />} />

          {/* Admin login — public but isolated */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected — any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile"           element={<UserProfile />} />
            <Route path="/profile/enquiries" element={<UserEnquiries />} />
          </Route>

          {/* Protected — dealer only */}
          <Route element={<ProtectedRoute requiredRole="dealer" />}>
            <Route path="/dealer/dashboard"         element={<DealerDashboard />} />
            <Route path="/dealer/listings"          element={<DealerListings />} />
            <Route path="/dealer/listings/create"   element={<DealerCreateListing />} />
            <Route path="/dealer/listings/edit/:id" element={<DealerEditListing />} />
            <Route path="/dealer/profile"           element={<DealerProfile />} />
          </Route>

          {/* Protected — admin only, redirects to /admin/login */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users"     element={<AdminUsers />} />
            <Route path="/admin/dealers"   element={<AdminDealers />} />
            <Route path="/admin/listings"  element={<AdminListings />} />
            <Route path="/admin/boosts"    element={<AdminBoosts />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
