import { useState } from 'react';
import API from '../api';

export default function Products() {
  const [form, setForm] = useState({ productName: '', quantitySold: '', unitPrice: '' });
  const [records, setRecords] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await API.post('/products', form);
      setMsg('Product added successfully!');
      setRecords((prev) => [...prev, form]);
      setForm({ productName: '', quantitySold: '', unitPrice: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <div className="w-full max-w-xl flex flex-col overflow-y-auto">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Add Product</h2>
        {msg && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{msg}</p>}
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
          {[
            { label: 'Product Name', key: 'productName', type: 'text' },
            { label: 'Quantity Sold', key: 'quantitySold', type: 'number' },
            { label: 'Unit Price (RWF)', key: 'unitPrice', type: 'number' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
          <button className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 font-semibold">Save Product</button>
        </form>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <h3 className="text-xl font-bold text-blue-900 mb-4">Product Records</h3>
        <div className="bg-white rounded-xl shadow overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-blue-700 text-white">
              <tr>{['Product Name', 'Qty Sold', 'Unit Price (RWF)'].map((h) => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-6 text-gray-400">No records yet</td></tr>
              ) : records.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-3">{r.productName}</td>
                  <td className="px-4 py-3">{r.quantitySold}</td>
                  <td className="px-4 py-3">{Number(r.unitPrice).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
