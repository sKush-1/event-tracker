import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EventsListPage } from './pages/EventsListPage';
import { EventFormPage } from './pages/EventFormPage';
import { SharedEventPage } from './pages/SharedEventPage';

// Layout wrapper for protected pages (includes Navbar)
const ProtectedLayout = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<EventsListPage />} />
      <Route path="/events/new" element={<EventFormPage />} />
      <Route path="/events/:id/edit" element={<EventFormPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-bg" />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1c1c27',
              color: '#e8e8f0',
              border: '1px solid #2a2a3d',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#00d4aa', secondary: '#1c1c27' } },
            error: { iconTheme: { primary: '#ff5757', secondary: '#1c1c27' } },
          }}
        />

        <Routes>
          {/* Public — no auth needed */}
          <Route path="/share/:shareToken" element={<SharedEventPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected — requires JWT */}
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<ProtectedLayout />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
