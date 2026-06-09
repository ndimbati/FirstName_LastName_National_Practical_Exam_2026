import { NavLink, useNavigate } from 'react-router-dom';

const links = [
  { to: '/customers', label: 'Customers' },
  { to: '/products', label: 'Products' },
  { to: '/sales', label: 'Sales' },
  { to: '/reports', label: 'Reports' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const user = localStorage.getItem('username');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-800 text-white px-6 py-3 flex items-center justify-between shadow">
      <span className="font-bold text-lg tracking-wide">SalesPro Ltd</span>
      <div className="flex items-center gap-4">
        {links.map(({ to, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `px-3 py-1 rounded font-medium transition ${isActive ? 'bg-white text-blue-800' : 'hover:bg-blue-700'}`}>
            {label}
          </NavLink>
        ))}
        <span className="text-blue-200 text-sm ml-2">{user}</span>
        <button onClick={logout} className="ml-2 bg-red-500 hover:bg-red-600 px-3 py-1 rounded font-medium">Logout</button>
      </div>
    </nav>
  );
}
