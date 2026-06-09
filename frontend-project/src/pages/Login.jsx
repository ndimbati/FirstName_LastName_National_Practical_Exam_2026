import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const inputClass = 'w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggle = () => { setIsRegister(!isRegister); setForm({ username: '', password: '' }); setMsg(''); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      if (isRegister) {
        await API.post('/auth/register', form);
        setMsg('Account created! You can now log in.');
        setIsRegister(false);
        setForm({ username: '', password: '' });
      } else {
        const res = await API.post('/auth/login', form);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || (isRegister ? 'Registration failed' : 'Login failed'));
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-blue-900 mb-2 text-center">SalesPro Ltd</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">Sales Record Management System</p>

        <div className="flex mb-6 border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => !isRegister || toggle()}
            className={`flex-1 py-2 text-sm font-semibold transition ${!isRegister ? 'bg-blue-700 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
            Login
          </button>
          <button onClick={() => isRegister || toggle()}
            className={`flex-1 py-2 text-sm font-semibold transition ${isRegister ? 'bg-blue-700 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
            Register
          </button>
        </div>

        {msg && <p className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">{msg}</p>}
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" required className={inputClass}
              value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required className={inputClass}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 font-semibold">
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
