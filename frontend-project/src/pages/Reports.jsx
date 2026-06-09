import { useState, useEffect, useRef } from 'react';
import API from '../api';

const TABS = ['daily', 'weekly', 'monthly'];
const HEADERS = ['Invoice#', 'Date', 'Customer', 'Telephone', 'Address', 'Product', 'Qty', 'Unit Price (RWF)', 'Payment', 'Amount (RWF)'];

export default function Reports() {
  const [tab, setTab] = useState('daily');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const printRef = useRef();

  useEffect(() => {
    setLoading(true);
    setSearch('');
    API.get(`/reports/${tab}`)
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const filtered = data.filter((r) => {
    const q = search.toLowerCase();
    return (
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
      r.productName?.toLowerCase().includes(q) ||
      r.paymentMethod?.toLowerCase().includes(q)
    );
  });

  const total = filtered.reduce((sum, r) => sum + Number(r.totalAmountPaid), 0);
  const avgSale = filtered.length ? total / filtered.length : 0;

  const paymentBreakdown = filtered.reduce((acc, r) => {
    acc[r.paymentMethod] = (acc[r.paymentMethod] || 0) + Number(r.totalAmountPaid);
    return acc;
  }, {});

  // Fix: use quantitySold instead of counting occurrences
  const productQty = filtered.reduce((acc, r) => {
    acc[r.productName] = (acc[r.productName] || 0) + Number(r.quantitySold);
    return acc;
  }, {});
  const bestProduct = Object.entries(productQty).sort((a, b) => b[1] - a[1])[0];

  const summaryCards = [
    { label: 'Total Transactions', value: filtered.length, color: 'bg-blue-600' },
    { label: 'Total Revenue (RWF)', value: total.toLocaleString(), color: 'bg-green-600' },
    { label: 'Avg Sale (RWF)', value: Math.round(avgSale).toLocaleString(), color: 'bg-purple-600' },
    { label: 'Best Selling Product', value: bestProduct ? bestProduct[0] : '—', color: 'bg-orange-500' },
  ];

  const downloadCSV = () => {
    const rows = [
      HEADERS,
      ...filtered.map((r) => [
        r.invoiceNumber,
        r.salesDate?.split('T')[0],
        `${r.firstName} ${r.lastName}`,
        r.telephone,
        r.address,
        r.productName,
        r.quantitySold,
        r.unitPrice,
        r.paymentMethod,
        r.totalAmountPaid,
      ]),
      ['', '', '', '', '', '', '', '', 'Total', total],
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tab}-report.csv`;
    link.click();
    // Fix: revoke the object URL to free memory
    URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>${tab} Sales Report</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
        h2 { color: #1e3a8a; }
        p { color: #6b7280; margin: 4px 0 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #1d4ed8; color: white; padding: 8px; text-align: left; }
        td { padding: 7px 8px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) td { background: #f9fafb; }
        tfoot td { font-weight: bold; background: #eff6ff; }
      </style></head>
      <body>
        <h2>SalesPro Ltd — ${tab.charAt(0).toUpperCase() + tab.slice(1)} Sales Report</h2>
        <p>Generated: ${new Date().toLocaleString()}</p>
        ${content}
      </body></html>
    `);
    win.document.close();
    win.focus();
    // Fix: use onafterprint to close window only after print dialog is done
    win.onafterprint = () => win.close();
    win.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-blue-900 mb-1">Sales Reports</h2>
        <p className="text-gray-500 text-sm">View daily, weekly, and monthly sales performance.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-lg font-semibold capitalize transition ${tab === t ? 'bg-blue-700 text-white shadow' : 'bg-white text-blue-700 border border-blue-700 hover:bg-blue-50'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, color }) => (
          <div key={label} className={`${color} text-white rounded-xl shadow p-4`}>
            <p className="text-xs opacity-80 mb-1">{label}</p>
            <p className="text-xl font-bold truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Payment Breakdown */}
      {Object.keys(paymentBreakdown).length > 0 && (
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold text-blue-900 mb-4 text-sm uppercase tracking-wide">Revenue by Payment Method</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(paymentBreakdown).map(([method, amount]) => (
              <div key={method} className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">{method}</p>
                <p className="font-bold text-blue-800 mt-1">{Number(amount).toLocaleString()} RWF</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Table */}
      <div className="bg-white rounded-xl shadow">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-blue-900 capitalize">{tab} Sales Records</h3>
            <span className="text-sm text-gray-500">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search customer, product, payment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            {filtered.length > 0 && (
              <>
                <button onClick={downloadCSV}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">
                  ⬇ CSV
                </button>
                <button onClick={printPDF}
                  className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">
                  🖨 PDF
                </button>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto" ref={printRef}>
          <table className="w-full text-sm">
            <thead className="bg-blue-700 text-white sticky top-0">
              <tr>{HEADERS.map((h) => <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={HEADERS.length} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={HEADERS.length} className="text-center py-8 text-gray-400">
                  {search ? 'No records match your search' : `No ${tab} records found`}
                </td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.invoiceNumber} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-3">{r.invoiceNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.salesDate?.split('T')[0]}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.firstName} {r.lastName}</td>
                  <td className="px-4 py-3">{r.telephone}</td>
                  <td className="px-4 py-3">{r.address}</td>
                  <td className="px-4 py-3">{r.productName}</td>
                  <td className="px-4 py-3">{r.quantitySold}</td>
                  <td className="px-4 py-3">{Number(r.unitPrice).toLocaleString()}</td>
                  <td className="px-4 py-3">{r.paymentMethod}</td>
                  <td className="px-4 py-3 font-medium">{Number(r.totalAmountPaid).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot className="bg-blue-50 font-bold">
                <tr>
                  <td colSpan={HEADERS.length - 1} className="px-4 py-3 text-right">Total Revenue:</td>
                  <td className="px-4 py-3 text-blue-800">{total.toLocaleString()} RWF</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
