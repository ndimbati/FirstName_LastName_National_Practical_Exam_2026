import { NavLink, useNavigate } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/customers', label: 'Customers', icon: '👥' },
  { to: '/products', label: 'Products', icon: '📦' },
  { to: '/sales', label: 'Sales', icon: '🧾' },
  { to: '/reports', label: 'Reports', icon: '📊' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = localStorage.getItem('username');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className="w-56 min-h-screen bg-blue-900 text-white flex flex-col fixed top-0 left-0 z-10">
      <div className="px-6 py-5 border-b border-blue-700">
        <p className="font-bold text-lg leading-tight">SalesPro Ltd</p>
        <p className="text-blue-300 text-xs mt-1">SRMS</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition ${isActive ? 'bg-white text-blue-900' : 'hover:bg-blue-800'}`}>
            <span>{icon}</span>{label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-blue-700">
        <p className="text-blue-300 text-xs mb-3 truncate">Logged in as <span className="text-white font-medium">{user}</span></p>
        <button onClick={logout} className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-lg text-sm font-semibold">
          Logout
        </button>
      </div>
    </aside>
  );
}
