import { useEffect, useState } from 'react';
import API from '../api';

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const user = localStorage.getItem('username');

  useEffect(() => {
    Promise.all([API.get('/customers'), API.get('/products'), API.get('/sales')])
      .then(([c, p, s]) => { setCustomers(c.data); setProducts(p.data); setSales(s.data); })
      .catch(() => {});
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmountPaid), 0);
  const todaySales = sales.filter((s) => s.salesDate?.split('T')[0] === today);
  const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.totalAmountPaid), 0);
  const recentSales = [...sales].slice(0, 5);

  const paymentBreakdown = sales.reduce((acc, s) => {
    acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + Number(s.totalAmountPaid);
    return acc;
  }, {});

  const topProducts = [...products]
    .sort((a, b) => Number(b.quantitySold) - Number(a.quantitySold))
    .slice(0, 5);

  const statCards = [
    { label: 'Total Customers', value: customers.length, color: 'bg-blue-600', icon: '👥' },
    { label: 'Total Products', value: products.length, color: 'bg-green-600', icon: '📦' },
    { label: 'Total Sales', value: sales.length, color: 'bg-purple-600', icon: '🧾' },
    { label: 'Total Revenue (RWF)', value: totalRevenue.toLocaleString(), color: 'bg-orange-500', icon: '💰' },
    { label: "Today's Sales", value: todaySales.length, color: 'bg-teal-600', icon: '📅' },
    { label: "Today's Revenue (RWF)", value: todayRevenue.toLocaleString(), color: 'bg-rose-500', icon: '📈' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-blue-900 mb-1">Welcome back, {user}!</h2>
        <p className="text-gray-500 text-sm">Here's what's happening at SalesPro Ltd today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {statCards.map(({ label, value, color, icon }) => (
          <div key={label} className={`${color} text-white rounded-xl shadow p-5`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium opacity-80">{label}</p>
              <span className="text-xl">{icon}</span>
            </div>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-blue-900">Recent Sales</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                {['Invoice', 'Customer', 'Product', 'Amount (RWF)'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSales.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-6 text-gray-400">No sales yet</td></tr>
              ) : recentSales.map((s, i) => (
                <tr key={s.invoiceNumber} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-3">#{s.invoiceNumber}</td>
                  <td className="px-4 py-3">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-3">{s.productName}</td>
                  <td className="px-4 py-3 font-medium">{Number(s.totalAmountPaid).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-blue-900">Top Products by Quantity Sold</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                {['Product', 'Qty Sold', 'Unit Price (RWF)'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-6 text-gray-400">No products yet</td></tr>
              ) : topProducts.map((p, i) => (
                <tr key={p.productCode} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-3">{p.productName}</td>
                  <td className="px-4 py-3">{p.quantitySold}</td>
                  <td className="px-4 py-3">{Number(p.unitPrice).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="bg-white rounded-xl shadow">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-blue-900">Revenue by Payment Method</h3>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.keys(paymentBreakdown).length === 0 ? (
            <p className="text-gray-400 text-sm col-span-4">No payment data yet</p>
          ) : Object.entries(paymentBreakdown).map(([method, amount]) => (
            <div key={method} className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">{method}</p>
              <p className="text-lg font-bold text-blue-800">{Number(amount).toLocaleString()}</p>
              <p className="text-xs text-gray-400">RWF</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
