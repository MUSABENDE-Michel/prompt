import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FileText, Download, Printer, Calendar, FileSpreadsheet, File } from 'lucide-react';
import * as reportService from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const reportTypes = [
  { value: 'stock', label: 'Available Stock' },
  { value: 'stock-in', label: 'Stock In' },
  { value: 'stock-out', label: 'Stock Out' },
  { value: 'daily', label: 'Daily Report' },
  { value: 'weekly', label: 'Weekly Report' },
  { value: 'monthly', label: 'Monthly Report' },
];

const Reports = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('stock');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const reportIdRef = useRef(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    month: String(new Date().getMonth() + 1).padStart(2, '0'),
    year: String(new Date().getFullYear()),
    singleDate: new Date().toISOString().split('T')[0],
  });

  const getReportId = () => {
    if (!reportIdRef.current) {
      reportIdRef.current = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }
    return reportIdRef.current;
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    reportIdRef.current = null;
    try {
      if (reportType === 'stock') {
        const res = await reportService.getStockReport();
        setData({ products: res.data.data, title: 'Available Stock Report' });
      } else if (reportType === 'stock-in') {
        const res = await reportService.getStockInReport({ startDate: dateRange.startDate, endDate: dateRange.endDate });
        setData({ ...res.data.data, title: 'Stock In Report' });
      } else if (reportType === 'stock-out') {
        const res = await reportService.getStockOutReport({ startDate: dateRange.startDate, endDate: dateRange.endDate });
        setData({ ...res.data.data, title: 'Stock Out Report' });
      } else if (reportType === 'daily') {
        const res = await reportService.getDailyReport({ date: dateRange.singleDate });
        setData({ ...res.data.data, title: `Daily Report - ${dateRange.singleDate}` });
      } else if (reportType === 'weekly') {
        const res = await reportService.getWeeklyReport({ startDate: dateRange.startDate });
        setData({ ...res.data.data, title: `Weekly Report (${res.data.data.startDate} - ${res.data.data.endDate})` });
      } else if (reportType === 'monthly') {
        const res = await reportService.getMonthlyReport({ month: dateRange.month, year: dateRange.year });
        setData({ ...res.data.data, title: `Monthly Report - ${res.data.data.month}/${res.data.data.year}` });
      }
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [reportType, dateRange]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const getFlatItems = useMemo(() => {
    if (data?.products && data.products.length > 0 && !data?.transactions) return data.products;
    if (data?.transactions && data.transactions.length > 0) return data.transactions;
    return [];
  }, [data]);

  const isProductReport = !!(data?.products && data.products.length > 0 && !data?.transactions);

  const summaryCards = useMemo(() => {
    const totalQty = data?.transactions
      ? data.transactions.reduce((sum, t) => sum + (t.quantityMoved || 0), 0)
      : data?.products
        ? data.products.reduce((sum, p) => sum + (p.quantityInStock || 0), 0)
        : 0;

    if (isProductReport) {
      return [
        { label: 'Total Products', value: getFlatItems.length, color: 'blue' },
        { label: 'Total Stock Qty', value: totalQty, color: 'green' },
        { label: 'Total Value', value: `${(data?.products || []).reduce((s, p) => s + (p.quantityInStock || 0) * (p.unitPrice || 0), 0).toLocaleString()} Frw`, color: 'purple' },
        { label: 'Categories', value: new Set((data?.products || []).map(p => p.category)).size, color: 'orange' },
      ];
    }

    return [
      { label: 'Total Transactions', value: getFlatItems.length, color: 'blue' },
      { label: 'Stock In', value: data?.stockIn ?? (reportType === 'stock-in' ? data?.totalQuantity ?? 0 : 0), color: 'green' },
      { label: 'Stock Out', value: data?.stockOut ?? (reportType === 'stock-out' ? data?.totalQuantity ?? 0 : 0), color: 'red' },
      { label: 'Total Quantity', value: data?.stockIn !== undefined ? (data.stockIn + (data.stockOut || 0)) : (data?.totalQuantity ?? totalQty), color: 'indigo' },
    ];
  }, [data, getFlatItems, isProductReport, reportType]);

  const exportCSV = () => {
    const items = getFlatItems;
    if (items.length === 0) { toast.error('No data to export'); return; }

    const rows = isProductReport
      ? items.map(p => ({
          Code: p.productCode, Name: p.productName, Category: p.category,
          'Stock Qty': p.quantityInStock, 'Unit Price': `${Number(p.unitPrice || 0).toLocaleString()} Frw`,
          Supplier: p.supplierName,
        }))
      : items.map(t => ({
          Date: new Date(t.transactionDate).toLocaleDateString(),
          Type: t.transactionType === 'STOCK_IN' ? 'Stock In' : 'Stock Out',
          Product: t.product?.productName || '-',
          Warehouse: t.warehouse?.warehouseName || '-',
          Quantity: t.quantityMoved,
        }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${(data?.title || 'Report').replace(/\s+/g, '_')}.csv`);
    toast.success('CSV exported');
  };

  const exportExcel = () => {
    const items = getFlatItems;
    if (items.length === 0) { toast.error('No data to export'); return; }

    const rows = isProductReport
      ? items.map(p => ({
          Code: p.productCode, Name: p.productName, Category: p.category,
          'Stock Qty': p.quantityInStock, 'Unit Price': `${Number(p.unitPrice || 0).toLocaleString()} Frw`,
          Supplier: p.supplierName,
        }))
      : items.map(t => ({
          Date: new Date(t.transactionDate).toLocaleDateString(),
          Type: t.transactionType === 'STOCK_IN' ? 'Stock In' : 'Stock Out',
          Product: t.product?.productName || '-',
          Warehouse: t.warehouse?.warehouseName || '-',
          Quantity: t.quantityMoved,
        }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${(data?.title || 'Report').replace(/\s+/g, '_')}.xlsx`);
    toast.success('Excel exported');
  };

  const exportPDF = () => {
    const items = getFlatItems;
    if (items.length === 0) { toast.error('No data to export'); return; }

    const doc = new jsPDF();
    const reportId = getReportId();

    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175);
    doc.text('StockHub Ltd', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Kigali City, Rwanda', 14, 27);
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text(data?.title || 'Report', 14, 37);
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text(`Report ID: ${reportId}`, 14, 44);
    doc.text(`Generated By: ${user?.username || 'System'}`, 14, 49);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 54);
    doc.setTextColor(0);

    if (isProductReport) {
      const headers = [['Code', 'Name', 'Category', 'Qty', 'Price', 'Supplier']];
      const body = items.map(p => [
        p.productCode, p.productName, p.category, p.quantityInStock,
        `${Number(p.unitPrice || 0).toLocaleString()} Frw`, p.supplierName,
      ]);
      doc.autoTable({ head: headers, body: body, startY: 60, theme: 'grid', headStyles: { fillColor: [30, 64, 175] } });
    } else {
      const headers = [['Date', 'Type', 'Product', 'Warehouse', 'Qty']];
      const body = items.map(t => [
        new Date(t.transactionDate).toLocaleDateString(),
        t.transactionType === 'STOCK_IN' ? 'Stock In' : 'Stock Out',
        t.product?.productName || '-', t.warehouse?.warehouseName || '-', t.quantityMoved,
      ]);
      doc.autoTable({ head: headers, body: body, startY: 60, theme: 'grid', headStyles: { fillColor: [30, 64, 175] } });
    }

    doc.save(`${(data?.title || 'Report').replace(/\s+/g, '_')}.pdf`);
    toast.success('PDF exported');
  };

  const handlePrint = () => window.print();

  const showDateFilters = ['stock-in', 'stock-out', 'daily', 'weekly', 'monthly'].includes(reportType);
  const cardColors = { blue: 'bg-blue-50 text-blue-700', green: 'bg-blue-50 text-blue-700', red: 'bg-blue-50 text-blue-700', purple: 'bg-blue-50 text-blue-700', orange: 'bg-blue-50 text-blue-700', indigo: 'bg-blue-50 text-blue-700' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
            <File size={16} /> CSV
          </button>
          <button onClick={exportExcel} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
            <Download size={16} /> PDF
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm font-medium text-blue-700 transition-colors">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              {reportTypes.map((rt) => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
            </select>
          </div>
          {showDateFilters && (
            <>
              {reportType === 'daily' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={dateRange.singleDate}
                    onChange={(e) => setDateRange({ ...dateRange, singleDate: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              )}
              {['stock-in', 'stock-out'].includes(reportType) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </>
              )}
              {reportType === 'monthly' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                    <select value={dateRange.month}
                      onChange={(e) => setDateRange({ ...dateRange, month: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={String(i + 1).padStart(2, '0')}>
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input type="number" value={dateRange.year}
                      onChange={(e) => setDateRange({ ...dateRange, year: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-24" />
                  </div>
                </>
              )}
              {reportType === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Week Starting</label>
                  <input type="date" value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              )}
              <button onClick={fetchReport} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                <Calendar size={16} /> Generate
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
                <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                <p className={`text-2xl font-bold ${cardColors[card.color]?.split(' ')[1] || 'text-gray-800'}`}>
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                <h3 className="font-semibold text-gray-800">{data.title}</h3>
              </div>
              <div className="mt-1 flex gap-4 text-xs text-gray-400">
                <span>Report ID: {getReportId()}</span>
                <span>Generated By: {user?.username || 'System'}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              {getFlatItems.length > 0 ? (
                isProductReport ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Code</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Qty</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Price</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Supplier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {getFlatItems.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600">{p.productCode}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{p.productName}</td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{p.category}</span></td>
                          <td className="px-4 py-3 text-right text-gray-600">{p.quantityInStock}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{Number(p.unitPrice || 0).toLocaleString()} Frw</td>
                          <td className="px-4 py-3 text-gray-600">{p.supplierName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Product</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Warehouse</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {getFlatItems.map((t) => (
                        <tr key={t._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600">{new Date(t.transactionDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              t.transactionType === 'STOCK_IN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>{t.transactionType === 'STOCK_IN' ? 'Stock In' : 'Stock Out'}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{t.product?.productName || '-'}</td>
                          <td className="px-4 py-3 text-gray-600">{t.warehouse?.warehouseName || '-'}</td>
                          <td className="px-4 py-3 text-right font-medium text-gray-800">{t.quantityMoved}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <FileText size={48} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-lg font-medium">No records found</p>
                  <p className="text-sm mt-1">Try a different date range or report type.</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl p-16 shadow-sm border border-gray-100 text-center text-gray-400">
          <FileText size={56} className="mx-auto mb-4 text-gray-200" />
          <p className="text-lg font-medium text-gray-500">Select a report type</p>
          <p className="text-sm mt-1">Choose from the options above and generate your report.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
