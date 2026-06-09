import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Reports from './pages/Reports';

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-blue-50">
      <Sidebar />
      <main className="ml-56 flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><Layout><Customers /></Layout></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Layout><Products /></Layout></PrivateRoute>} />
        <Route path="/sales" element={<PrivateRoute><Layout><Sales /></Layout></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Layout><Reports /></Layout></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
