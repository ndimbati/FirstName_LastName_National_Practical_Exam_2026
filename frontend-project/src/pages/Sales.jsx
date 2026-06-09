import { useState, useEffect } from 'react';
import API from '../api';

const emptyForm = { salesDate: '', paymentMethod: '', totalAmountPaid: '', customerNumber: '', productCode: '' };

export default function Sales() {
  const [form, setForm] = useState(emptyForm);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchAll = async () => {
    const [s, c, p] = await Promise.all([API.get('/sales'), API.get('/customers'), API.get('/products')]);
    setSales(s.data); setCustomers(c.data); setProducts(p.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      if (editId) {
        await API.put(`/sales/${editId}`, form);
        setMsg('Sale updated successfully!');
        setEditId(null);
      } else {
        await API.post('/sales', form);
        setMsg('Sale recorded successfully!');
      }
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (sale) => {
    setEditId(sale.invoiceNumber);
    setForm({
      salesDate: sale.salesDate?.split('T')[0] || '',
      paymentMethod: sale.paymentMethod,
      totalAmountPaid: sale.totalAmountPaid,
      customerNumber: sale.customerNumber,
      productCode: sale.productCode,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sale?')) return;
    try {
      await API.delete(`/sales/${id}`);
      setMsg('Sale deleted.');
      fetchAll();
    } catch { setError('Delete failed'); }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <div className="w-full max-w-xl flex flex-col overflow-y-auto">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">{editId ? 'Edit Sale' : 'Record Sale'}</h2>
        {msg && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{msg}</p>}
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sales Date</label>
            <input type="date" required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.salesDate} onChange={(e) => setForm({ ...form, salesDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              <option value="">Select method</option>
              {['Cash', 'Mobile Money', 'Bank Transfer', 'Credit Card'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount Paid (RWF)</label>
            <input type="number" required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.totalAmountPaid} onChange={(e) => setForm({ ...form, totalAmountPaid: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.customerNumber} onChange={(e) => setForm({ ...form, customerNumber: e.target.value })}>
              <option value="">Select customer</option>
              {customers.map((c) => <option key={c.customerNumber} value={c.customerNumber}>{c.firstName} {c.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.productCode} onChange={(e) => setForm({ ...form, productCode: e.target.value })}>
              <option value="">Select product</option>
              {products.map((p) => <option key={p.productCode} value={p.productCode}>{p.productName}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 font-semibold">
              {editId ? 'Update Sale' : 'Save Sale'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm(emptyForm); }}
                className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 font-semibold">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <h3 className="text-xl font-bold text-blue-900 mb-4">Sales Records</h3>
        <div className="bg-white rounded-xl shadow overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-blue-700 text-white">
              <tr>{['Invoice#', 'Date', 'Customer', 'Product', 'Payment', 'Amount (RWF)', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-6 text-gray-400">No sales records found</td></tr>
              ) : sales.map((s, i) => (
                <tr key={s.invoiceNumber} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-3">{s.invoiceNumber}</td>
                  <td className="px-4 py-3">{s.salesDate?.split('T')[0]}</td>
                  <td className="px-4 py-3">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-3">{s.productName}</td>
                  <td className="px-4 py-3">{s.paymentMethod}</td>
                  <td className="px-4 py-3">{Number(s.totalAmountPaid).toLocaleString()}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEdit(s)} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 text-xs">Edit</button>
                    <button onClick={() => handleDelete(s.invoiceNumber)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
