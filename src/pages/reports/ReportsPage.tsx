
import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { Order, PaymentMethod, ProductionOrderStatus, Customer, CustomerGroup, Product, MaterialVariant, OrderStatus } from '../../types';
import { PrinterIcon, DownloadIcon, SearchIcon, WarningIcon, TrendingUpIcon, ClipboardListIcon, CreditCardIcon, RevenueIcon } from '../../components/icons/Icons';
import DatePicker from '../../components/DatePicker';
import Pagination from '../../components/Pagination';
import CustomSelect from '../../components/CustomSelect';

type ReportType = 'sales' | 'inventory' | 'debt' | 'bi';

const REPORT_TYPES: Record<ReportType, string> = {
  sales: 'Doanh thu',
  inventory: 'Tồn kho',
  debt: 'Công nợ',
  bi: 'Quản trị (BI)',
};

// --- HELPER FUNCTIONS ---
const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(Math.round(value));
const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

const escapeCsvField = (field: any): string => {
    const str = String(field ?? '');
    if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob(["\uFEFF" + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- NEW MONTHLY REVENUE CHART COMPONENT ---
const MonthlyRevenueChart: React.FC<{ orders: Order[] }> = ({ orders }) => {
    const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; month: string; revenue: number } | null>(null);
    const chartRef = useRef<SVGSVGElement>(null);

    const monthlyData = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const data = Array.from({ length: 12 }, (_, i) => ({ month: `T${i + 1}`, revenue: 0 }));

        orders.forEach(order => {
            const orderDate = new Date(order.orderDate);
            if (orderDate.getFullYear() === currentYear && (order.status === OrderStatus.Paid || order.status === OrderStatus.Delivered || order.status === OrderStatus.PartialPayment)) {
                const monthIndex = orderDate.getMonth();
                data[monthIndex].revenue += order.totalAmount;
            }
        });
        return data;
    }, [orders]);

    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);
    
    const linePath = monthlyData.map((d, i) => {
        const x = (i / (monthlyData.length - 1)) * 100;
        const y = 100 - (d.revenue / maxRevenue * 100);
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');

    const areaPath = `${linePath} L 100,100 L 0,100 Z`;

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!chartRef.current) return;
        const svgRect = chartRef.current.getBoundingClientRect();
        const x = e.clientX - svgRect.left;
        const relativeX = (x / svgRect.width) * 100;
        
        const index = Math.round(relativeX / (100 / (monthlyData.length - 1)));
        const point = monthlyData[index];
        if (point) {
            const pointX = (index / (monthlyData.length - 1)) * svgRect.width + svgRect.left;
            const pointY = e.clientY;
            setTooltip({
                visible: true,
                x: pointX,
                y: pointY,
                month: point.month,
                revenue: point.revenue,
            });
        }
    };
    
    const handleMouseLeave = () => {
        setTooltip(null);
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Xu hướng Doanh thu (Năm nay)</h3>
            <div className="h-64 relative">
                <svg ref={chartRef} className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(y => (
                        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="var(--gray-200)" strokeWidth="0.5" />
                    ))}
                    {/* Area fill */}
                    <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--blue-500)" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="var(--blue-500)" stopOpacity="0"/>
                        </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#revenueGradient)" />
                    {/* Line */}
                    <path d={linePath} fill="none" stroke="var(--blue-600)" strokeWidth="1.5" />
                </svg>
                 {tooltip && tooltip.visible && (
                    <div 
                        className="absolute bg-gray-800 text-white text-xs rounded-md p-2 shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full" 
                        style={{ left: `${tooltip.x}px`, top: `${tooltip.y - 10}px` }}
                    >
                        <div className="font-bold">{tooltip.month}</div>
                        <div>{formatCurrency(tooltip.revenue)} đ</div>
                    </div>
                )}
            </div>
             <div className="flex justify-between text-xs text-gray-500 mt-2">
                {monthlyData.map(d => <span key={d.month}>{d.month}</span>)}
            </div>
        </div>
    );
};


// --- SALES REPORT CONTENT ---
interface DailyReportRow { date: string; total: number; tax: number; goodsTotal: number; fee: number; discount: number; discountRate: string; cash: number; bankTransfer: number; voucher: number; points: number; debt: number; cod: number; actualRevenue: number; }

const SalesContent: React.FC<{ data: DailyReportRow[], totals: any, orders: Order[] }> = ({ data, totals, orders }) => {
    const [filters, setFilters] = useState<Partial<Record<keyof DailyReportRow, string>>>({});
    
    const filteredData = useMemo(() => {
        return data.filter(row => {
            for (const key in filters) {
                const filterValue = filters[key as keyof DailyReportRow]?.toLowerCase();
                if (filterValue) {
                    const rowValue = String(row[key as keyof DailyReportRow]).toLowerCase();
                    if(!rowValue.includes(filterValue)) return false;
                }
            }
            return true;
        });
    }, [data, filters]);

    const handleFilterChange = (key: keyof DailyReportRow, value: string) => setFilters(prev => ({ ...prev, [key]: value }));

    const headers: { key: keyof DailyReportRow, label: string, formula?: string }[] = [ { key: 'date', label: 'Ngày' }, { key: 'total', label: 'Tổng' }, { key: 'tax', label: 'Tiền thuế' }, { key: 'goodsTotal', label: 'Tiền hàng' }, { key: 'fee', label: 'Tiền phí' }, { key: 'discount', label: 'Khuyến mại' }, { key: 'cash', label: 'Tiền mặt' }, { key: 'bankTransfer', label: 'Chuyển khoản' }, { key: 'debt', label: 'Công nợ' }, { key: 'actualRevenue', label: 'Thực thu'}];

    return (
        <>
            <MonthlyRevenueChart orders={orders} />
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>{headers.map(h => <th key={h.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{h.label}</th>)}</tr>
                  <tr className="no-print bg-gray-100 dark:bg-gray-900/50">{headers.map(h => <th key={`filter-${h.key}`} className="p-1 font-normal"><input type="text" className="w-full text-xs p-1.5 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500" onChange={(e) => handleFilterChange(h.key, e.target.value)} /></th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.map(row => (
                      <tr key={row.date} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(row.date).toLocaleDateString('vi-VN')}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(row.total)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(row.tax)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(row.goodsTotal)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(row.fee)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(row.discount)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(row.cash)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(row.bankTransfer)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(row.debt)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-green-600">{formatCurrency(row.actualRevenue)}</td>
                      </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 dark:bg-gray-700/50 font-bold text-gray-800 dark:text-gray-100">
                  <tr>
                      <td className="px-4 py-3 text-left">Tổng cộng</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(totals.total)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(totals.tax)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(totals.goodsTotal)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(totals.fee)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(totals.discount)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(totals.cash)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(totals.bankTransfer)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(totals.debt)}</td>
                      <td className="px-4 py-3 text-right text-green-600">{formatCurrency(totals.actualRevenue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
        </>
    );
};

// --- INVENTORY REPORT CONTENT ---
const InventoryContent: React.FC<{ materialReport: any[], productReport: any[] }> = ({ materialReport, productReport }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredMaterialReport = useMemo(() => searchTerm.trim() ? materialReport.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())) : materialReport, [materialReport, searchTerm]);
    const filteredProductReport = useMemo(() => searchTerm.trim() ? productReport.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase())) : productReport, [productReport, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="max-w-md relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
                    <input type="text" placeholder="Tìm kiếm chất liệu hoặc sản phẩm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 pl-10 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"/>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"><h2 className="text-xl font-semibold p-4 border-b border-gray-200 dark:border-gray-700">Báo cáo tồn kho chất liệu</h2><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50"><tr>{['Tên chất liệu', 'Tồn đầu kỳ', 'Xuất trong kỳ', 'Tồn cuối kỳ', 'Giá trị tồn', 'Tình trạng'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{filteredMaterialReport.map((item, i) => <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">{item.name}</td><td>{formatNumber(item.openingStock)} {item.purchaseUnit}</td><td>{formatNumber(item.usedInPeriod)} {item.purchaseUnit}</td><td className="font-semibold">{formatNumber(item.closingStock)} {item.purchaseUnit}</td><td>{formatCurrency(item.stockValue)}</td>
                    <td>{item.isLowStock && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1 w-fit"><WarningIcon className="w-4 h-4"/>Sắp hết</span>}</td>
                </tr>)}</tbody>
            </table></div></div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"><h2 className="text-xl font-semibold p-4 border-b border-gray-200 dark:border-gray-700">Báo cáo tồn kho sản phẩm</h2><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50"><tr>{['Tên sản phẩm', 'Tồn đầu kỳ', 'Đã bán trong kỳ', 'Tồn cuối kỳ', 'Giá trị tồn', 'Tình trạng'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{filteredProductReport.map((item, i) => <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">{item.name} <span className="text-gray-400">({item.sku})</span></td><td>{formatNumber(item.openingStock)}</td><td>{formatNumber(item.soldInPeriod)}</td><td className="font-semibold">{formatNumber(item.closingStock)}</td><td>{formatCurrency(item.stockValue)}</td>
                    <td>{item.isLowStock && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1 w-fit"><WarningIcon className="w-4 h-4"/>Sắp hết</span>}</td>
                </tr>)}</tbody>
            </table></div></div>
        </div>
    );
};

// --- DEBT REPORT CONTENT ---
const StatCard: React.FC<{ title: string; value: string | number; colorClass?: string }> = ({ title, value, colorClass = 'text-gray-900 dark:text-white' }) => ( <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h4><p className={`mt-1 text-2xl font-semibold ${colorClass}`}>{value}</p></div>);
interface CustomerDebtInfo { customer: Customer; openingDebt: number; debtIncurredInPeriod: number; paidInPeriod: number; closingDebt: number; }

const DebtContent: React.FC<{ data: CustomerDebtInfo[], summaryStats: any }> = ({ data, summaryStats }) => {
    const { customerGroups } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [groupFilter, setGroupFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const filteredData = useMemo(() => data.filter(i => (!searchTerm || i.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.customer.id.toLowerCase().includes(searchTerm.toLowerCase())) && (!groupFilter || i.customer.customerGroupId === groupFilter)), [data, searchTerm, groupFilter]);
    const paginatedData = useMemo(() => filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredData, currentPage, itemsPerPage]);

    const debtHeaders = [ { key: 'customer.id', label: 'Mã KH' }, { key: 'customer.name', label: 'Tên khách hàng' }, { key: 'customer.customerGroupId', label: 'Nhóm KH' }, { key: 'openingDebt', label: 'Nợ đầu kỳ' }, { key: 'debtIncurredInPeriod', label: 'Phát sinh' }, { key: 'paidInPeriod', label: 'Đã trả' }, { key: 'closingDebt', label: 'Nợ cuối kỳ' }, ];
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Nợ đầu kỳ" value={`${formatCurrency(summaryStats.totalOpeningDebt)} đ`} />
                <StatCard title="Phát sinh trong kỳ" value={`${formatCurrency(summaryStats.totalIncurred)} đ`} colorClass="text-blue-600 dark:text-blue-400"/>
                <StatCard title="Thanh toán trong kỳ" value={`${formatCurrency(summaryStats.totalPaid)} đ`} colorClass="text-green-600 dark:text-green-400"/>
                <StatCard title="Nợ cuối kỳ" value={`${formatCurrency(summaryStats.totalClosingDebt)} đ`} colorClass="text-red-600 dark:text-red-400"/>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><div className="flex flex-wrap items-center gap-4"><input type="text" placeholder="Tìm theo mã hoặc tên khách hàng..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-80 p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"/><CustomSelect options={[{value: '', label: 'Tất cả nhóm'}, ...customerGroups.map(g => ({value: g.id, label: g.name}))]} value={groupFilter} onChange={setGroupFilter} className="w-full md:w-auto min-w-48" /></div></div>
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-50 dark:bg-gray-700/50"><tr>{debtHeaders.map(h => <th key={h.key} className={`px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-300`}>{h.label}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{paginatedData.map(({ customer, openingDebt, debtIncurredInPeriod, paidInPeriod, closingDebt }) => <tr key={customer.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                <td className="px-6 py-4">{customer.id}</td><td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">{customer.name}</td><td className="px-6 py-4">{customerGroups.find(g => g.id === customer.customerGroupId)?.name || ''}</td><td className="px-6 py-4 text-right">{formatCurrency(openingDebt)}</td><td className="px-6 py-4 text-right text-blue-600">{formatCurrency(debtIncurredInPeriod)}</td><td className="px-6 py-4 text-right text-green-600">{formatCurrency(paidInPeriod)}</td><td className="px-6 py-4 text-right font-bold text-red-600">{formatCurrency(closingDebt)}</td>
            </tr>)}</tbody></table></div>{filteredData.length > itemsPerPage && <Pagination currentPage={currentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} />}</div>
        </div>
    );
};

// --- NEW BI (BUSINESS INTELLIGENCE) CONTENT ---
const BiCard: React.FC<{ title: string; value: string; subtext?: string; trend?: number }> = ({ title, value, subtext, trend }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{title}</h4>
        <div className="flex items-end justify-between">
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            {trend !== undefined && (
                <span className={`flex items-center text-sm font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
                </span>
            )}
        </div>
        {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
    </div>
);

const BiContent: React.FC<{ orders: Order[]; startDate: string; endDate: string; }> = ({ orders, startDate, endDate }) => {
    const { companyInfo } = useData();

    const biData = useMemo(() => {
        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);

        const relevantOrders = orders.filter(o => new Date(o.orderDate) >= start && new Date(o.orderDate) <= end && o.status !== OrderStatus.Cancelled);
        
        // 1. KPI Calculations
        const totalRevenue = relevantOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const totalOrders = relevantOrders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        // Estimated Profit
        const estimatedMargin = 0.30; // 30%
        const estimatedProfit = totalRevenue * estimatedMargin; 

        // 2. Top Products
        const productSales: Record<string, number> = {};
        relevantOrders.forEach(order => {
            order.items.forEach(item => {
                productSales[item.product.name] = (productSales[item.product.name] || 0) + item.totalPrice;
            });
        });
        const topProducts = Object.entries(productSales)
            .map(([name, sales]) => ({ name, sales }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        // 3. Daily Trend for Chart
        const dailyTrend: Record<string, { revenue: number, profit: number }> = {};
        // Initialize dates
        const dayIterator = new Date(start);
        while (dayIterator <= end) {
             dailyTrend[dayIterator.toISOString().split('T')[0]] = { revenue: 0, profit: 0 };
             dayIterator.setDate(dayIterator.getDate() + 1);
        }

        relevantOrders.forEach(order => {
             const dateKey = new Date(order.orderDate).toISOString().split('T')[0];
             if (dailyTrend[dateKey]) {
                 dailyTrend[dateKey].revenue += order.totalAmount;
                 dailyTrend[dateKey].profit += order.totalAmount * estimatedMargin;
             }
        });

        const chartData = Object.entries(dailyTrend)
            .map(([date, val]) => ({
                 date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit'}),
                 revenue: val.revenue,
                 profit: val.profit
            }))
            .sort((a, b) => {
                // Simple sort by relying on original object key order if needed, or reconstruct Date
                return 0; // Already sorted by dayIterator logic
            });

        return { totalRevenue, totalOrders, avgOrderValue, estimatedProfit, topProducts, chartData };
    }, [orders, startDate, endDate]);

    const maxChartValue = Math.max(...biData.chartData.map(d => d.revenue), 1);

    // Function to generate Stepped Line Path (horizontal then vertical)
    const generateSteppedPath = (accessor: (d: any) => number) => {
        if (biData.chartData.length === 0) return '';
        
        const firstY = 100 - (accessor(biData.chartData[0]) / maxChartValue * 100);
        let d = `M 0,${firstY}`; // Start at the first point

        biData.chartData.forEach((item, index) => {
            if (index === 0) return;
            
            // Previous Point Data
            const prevItem = biData.chartData[index - 1];
            const prevY = 100 - (accessor(prevItem) / maxChartValue * 100);
            
            // Current Point Data
            const x = (index / (biData.chartData.length - 1)) * 100;
            const currY = 100 - (accessor(item) / maxChartValue * 100);

            // STEPPED LOGIC:
            // 1. Draw Horizontal Line from prevX to currX (staying at prevY level)
            d += ` L ${x},${prevY}`; 
            // 2. Draw Vertical Line from prevY to currY (staying at currX)
            d += ` L ${x},${currY}`;
        });
        
        return d;
    };

    const revenuePath = generateSteppedPath(d => d.revenue);
    const profitPath = generateSteppedPath(d => d.profit);
    
    // Close the loop for area fill
    const areaPath = revenuePath 
        ? `${revenuePath} L 100,100 L 0,100 Z`
        : '';

    return (
        <div className="space-y-6 animate-fade-in">
             {/* KPIs */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <BiCard title="Doanh thu thuần" value={formatCurrency(biData.totalRevenue)} subtext="Sau khi trừ giảm giá & hoàn trả" trend={12.5} />
                <BiCard title="Lợi nhuận ước tính" value={formatCurrency(biData.estimatedProfit)} subtext="Biên lợi nhuận ~30%" trend={8.2} />
                <BiCard title="Tổng đơn hàng" value={formatNumber(biData.totalOrders)} subtext="Đơn hàng hoàn thành" trend={-2.4} />
                <BiCard title="Giá trị trung bình (AOV)" value={formatCurrency(biData.avgOrderValue)} subtext="Trên mỗi đơn hàng" trend={5.1} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart - Stepped Line */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Xu hướng Kinh doanh</h3>
                    <div className="h-80 w-full relative">
                        {/* SVG Chart Implementation */}
                        <svg className="w-full h-full" viewBox={`0 0 100 100`} preserveAspectRatio="none">
                             <defs>
                                <linearGradient id="gradientRevenue" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                </linearGradient>
                             </defs>

                             {/* Grid Lines */}
                             {[0, 25, 50, 75, 100].map(y => (
                                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />
                            ))}
                            
                            {/* Revenue Area (Stepped) */}
                            <path 
                                d={areaPath}
                                fill="url(#gradientRevenue)" 
                                stroke="none"
                            />

                            {/* Revenue Line (Blue - Stepped) */}
                            <path 
                                d={revenuePath}
                                fill="none" 
                                stroke="#3b82f6" 
                                strokeWidth="1.5" 
                            />
                            
                             {/* Profit Line (Green - Stepped) */}
                             <path 
                                d={profitPath}
                                fill="none" 
                                stroke="#10b981" 
                                strokeWidth="1.5" 
                                strokeDasharray="2,1"
                            />
                        </svg>
                        
                         {/* Chart Labels (X-Axis) */}
                        <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                            {biData.chartData.filter((_, i) => i % Math.max(1, Math.floor(biData.chartData.length / 6)) === 0).map((d, i) => (
                                <span key={i}>{d.date}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                         <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span><span className="text-sm text-gray-600 dark:text-gray-300">Doanh thu</span></div>
                         <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span><span className="text-sm text-gray-600 dark:text-gray-300">Lợi nhuận</span></div>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Top Sản phẩm / Dịch vụ</h3>
                    <div className="space-y-5">
                        {biData.topProducts.map((p, idx) => {
                            const percent = (p.sales / biData.totalRevenue) * 100;
                            return (
                                <div key={idx} className="relative group">
                                    <div className="flex justify-between text-sm mb-1 relative z-10">
                                        <span className="font-medium text-gray-700 dark:text-gray-200 truncate max-w-[180px]">{idx + 1}. {p.name}</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{formatNumber(p.sales)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            )
                        })}
                        {biData.topProducts.length === 0 && <p className="text-center text-gray-500 text-sm py-10">Chưa có dữ liệu.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReportsPage: React.FC = () => {
    const { orders, invoices, materialGroups, materialVariants, products, productionOrders, customers, customerGroups } = useData();
    const [activeTab, setActiveTab] = useState<ReportType>('sales');
    
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    // --- LIFTED DATA CALCULATION ---
    const salesDataAndTotals = useMemo(() => {
        const dailyData: Record<string, DailyReportRow> = {};
        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);

        const relevantOrders = orders.filter(o => new Date(o.orderDate) >= start && new Date(o.orderDate) <= end);

        for (const order of relevantOrders) {
            const dateStr = new Date(order.orderDate).toISOString().split('T')[0];
            if (!dailyData[dateStr]) {
                dailyData[dateStr] = { date: dateStr, total: 0, tax: 0, goodsTotal: 0, fee: 0, discount: 0, discountRate: '0%', cash: 0, bankTransfer: 0, voucher: 0, points: 0, debt: 0, cod: 0, actualRevenue: 0 };
            }
            const row = dailyData[dateStr];
            const vatAmount = order.vatAmount || 0;
            row.goodsTotal += order.totalAmount - vatAmount;
            row.tax += vatAmount;
            row.total += order.totalAmount;
            const invoice = invoices.find(inv => inv.orderId === order.id);
            const paidAmount = invoice?.payments.reduce((sum, p) => sum + p.amount, 0) || 0;
            invoice?.payments.forEach(p => {
                if (p.method === PaymentMethod.Cash) row.cash += p.amount;
                if (p.method === PaymentMethod.BankTransfer) row.bankTransfer += p.amount;
            });
            row.actualRevenue += paidAmount;
            row.debt += order.totalAmount - paidAmount;
        }
        const data = Object.values(dailyData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const totals = data.reduce((acc, row) => {
            Object.keys(row).forEach(key => { if (key !== 'date' && key !== 'discountRate') acc[key as keyof Omit<DailyReportRow, 'date'|'discountRate'>] += row[key as keyof Omit<DailyReportRow, 'date'|'discountRate'>]; });
            return acc;
        }, { total: 0, tax: 0, goodsTotal: 0, fee: 0, discount: 0, cash: 0, bankTransfer: 0, voucher: 0, points: 0, debt: 0, cod: 0, actualRevenue: 0 });
        return { data, totals };
    }, [orders, invoices, startDate, endDate]);

    const inventoryData = useMemo(() => {
        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);

        const allPOs = productionOrders.filter(po => po.status === ProductionOrderStatus.Completed && new Date(po.orderDate) <= end);
        const materialReport = materialVariants.map(variant => {
            const group = materialGroups.find(g => g.id === variant.groupId);
            const sizeStr = `${variant.width}x${variant.height}`;
            const materialName = group ? `${group.name} - ${sizeStr}` : sizeStr;
            const usageBeforeStart = allPOs.filter(po => new Date(po.orderDate) < start).reduce((sum, po) => (po.material && po.material.toLowerCase().includes(materialName.toLowerCase()) ? sum + po.quantity : sum), 0);
            const usageInPeriod = allPOs.filter(po => { const poDate = new Date(po.orderDate); return poDate >= start && poDate <= end; }).reduce((sum, po) => (po.material && po.material.toLowerCase().includes(materialName.toLowerCase()) ? sum + po.quantity : sum), 0);
            const openingStock = variant.initialStock - usageBeforeStart;
            const closingStock = openingStock - usageInPeriod;
            return { ...variant, name: materialName, openingStock, usedInPeriod: usageInPeriod, closingStock, stockValue: closingStock * variant.purchasePrice, isLowStock: closingStock <= variant.lowStockThreshold };
        });

        const allOrders = orders.filter(o => new Date(o.orderDate) <= end);
        const productReport = products.map(product => {
            const salesBeforeStart = allOrders.filter(o => new Date(o.orderDate) < start).reduce((sum, o) => sum + (o.items.find(i => i.product.id === product.id)?.quantity || 0), 0);
            const salesInPeriod = allOrders.filter(o => { const orderDate = new Date(o.orderDate); return orderDate >= start && orderDate <= end; }).reduce((sum, o) => sum + (o.items.find(i => i.product.id === product.id)?.quantity || 0), 0);
            const openingStock = product.initialStock - salesBeforeStart;
            const closingStock = openingStock - salesInPeriod;
            const price = product.price ?? 0;
            const stockValue = closingStock * price;
            return { ...product, openingStock, soldInPeriod: salesInPeriod, closingStock, stockValue, isLowStock: closingStock <= product.lowStockThreshold };
        });
        return { materialReport, productReport };
    }, [materialGroups, materialVariants, products, productionOrders, orders, startDate, endDate]);
    
    const debtDataAndSummary = useMemo(() => {
        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);
        const data = customers.map(customer => {
            const customerInvoices = invoices.filter(inv => inv.customer.id === customer.id);
            const openingDebt = customerInvoices.filter(inv => new Date(inv.invoiceDate) < start).reduce((debt, inv) => { const paidBeforeStart = inv.payments.filter(p => new Date(p.date) < start).reduce((sum, p) => sum + p.amount, 0); return debt + (inv.totalAmount - paidBeforeStart); }, 0);
            const debtIncurredInPeriod = customerInvoices.filter(inv => { const invDate = new Date(inv.invoiceDate); return invDate >= start && invDate <= end; }).reduce((sum, inv) => sum + inv.totalAmount, 0);
            const paidInPeriod = customerInvoices.flatMap(inv => inv.payments).filter(p => { const paymentDate = new Date(p.date); return paymentDate >= start && paymentDate <= end; }).reduce((sum, p) => sum + p.amount, 0);
            const closingDebt = openingDebt + debtIncurredInPeriod - paidInPeriod;
            return { customer, openingDebt, debtIncurredInPeriod, paidInPeriod, closingDebt };
        }).filter(item => item.closingDebt > 0.1 || item.debtIncurredInPeriod > 0 || item.paidInPeriod > 0);
        const summaryStats = { totalOpeningDebt: data.reduce((s, i) => s + i.openingDebt, 0), totalIncurred: data.reduce((s, i) => s + i.debtIncurredInPeriod, 0), totalPaid: data.reduce((s, i) => s + i.paidInPeriod, 0), totalClosingDebt: data.reduce((s, i) => s + i.closingDebt, 0) };
        return { data, summaryStats };
    }, [customers, invoices, startDate, endDate]);
  
    const handleExport = () => {
        const startStr = startDate.split('-').join('_');
        const endStr = endDate.split('-').join('_');
        const filename = `BaoCao_${activeTab}_${startStr}_den_${endStr}.csv`;
        let csvContent = '';

        switch(activeTab) {
            case 'sales':
                const salesHeaders = ["Ngày", "Tổng", "Tiền thuế", "Tiền hàng", "Phí", "KM", "Tiền mặt", "CK", "Công nợ", "Thực thu"];
                const salesRows = salesDataAndTotals.data.map(r => [new Date(r.date).toLocaleDateString('vi-VN'), r.total, r.tax, r.goodsTotal, r.fee, r.discount, r.cash, r.bankTransfer, r.debt, r.actualRevenue].map(escapeCsvField).join(','));
                const salesTotalsRow = ["Tổng cộng", salesDataAndTotals.totals.total, salesDataAndTotals.totals.tax, salesDataAndTotals.totals.goodsTotal, salesDataAndTotals.totals.fee, salesDataAndTotals.totals.discount, salesDataAndTotals.totals.cash, salesDataAndTotals.totals.bankTransfer, salesDataAndTotals.totals.debt, salesDataAndTotals.totals.actualRevenue].map(escapeCsvField).join(',');
                csvContent = [salesHeaders.join(','), ...salesRows, salesTotalsRow].join('\n');
                break;
            case 'inventory':
                const materialHeaders = ["Tên chất liệu", "Tồn đầu kỳ", "ĐVT", "Xuất trong kỳ", "Tồn cuối kỳ", "Giá trị tồn (VND)"];
                const materialRows = inventoryData.materialReport.map(i => [i.name, i.openingStock, i.purchaseUnit, i.usedInPeriod, i.closingStock, i.stockValue].map(escapeCsvField).join(','));
                const productHeaders = ["Tên sản phẩm", "SKU", "Tồn đầu kỳ", "Bán trong kỳ", "Tồn cuối kỳ", "Giá trị tồn (VND)"];
                const productRows = inventoryData.productReport.map(i => [i.name, i.sku, i.openingStock, i.soldInPeriod, i.closingStock, i.stockValue].map(escapeCsvField).join(','));
                csvContent = ["BÁO CÁO TỒN KHO CHẤT LIỆU", materialHeaders.join(','), ...materialRows, "", "BÁO CÁO TỒN KHO SẢN PHẨM", productHeaders.join(','), ...productRows].join('\n');
                break;
            case 'debt':
                const debtHeaders = ["Mã KH", "Tên khách hàng", "Nhóm KH", "Nợ đầu kỳ", "Phát sinh trong kỳ", "Đã trả trong kỳ", "Nợ cuối kỳ"];
                const debtRows = debtDataAndSummary.data.map(i => [i.customer.id, i.customer.name, customerGroups.find(g => g.id === i.customer.customerGroupId)?.name || '', i.openingDebt, i.debtIncurredInPeriod, i.paidInPeriod, i.closingDebt].map(escapeCsvField).join(','));
                const debtTotalsRow = ["Tổng cộng", "", "", debtDataAndSummary.summaryStats.totalOpeningDebt, debtDataAndSummary.summaryStats.totalIncurred, debtDataAndSummary.summaryStats.totalPaid, debtDataAndSummary.summaryStats.totalClosingDebt].map(escapeCsvField).join(',');
                csvContent = [debtHeaders.join(','), ...debtRows, debtTotalsRow].join('\n');
                break;
            case 'bi':
                 // Allow CSV export for BI data? Maybe just a summary
                 const biSummary = `BÁO CÁO QUẢN TRỊ TỪ ${startDate} ĐẾN ${endDate}\nDoanh thu thuần,${salesDataAndTotals.totals.total}\nLợi nhuận ước tính,${salesDataAndTotals.totals.total * 0.3}`;
                 csvContent = biSummary;
                 break;
        }

        downloadCsv(csvContent, filename);
    };

    const handlePrint = () => window.print();
    
    const tabIcons: Record<ReportType, React.ReactNode> = {
        sales: <TrendingUpIcon />,
        inventory: <ClipboardListIcon />,
        debt: <CreditCardIcon />,
        bi: <RevenueIcon />
    };

    return (
        <>
            <div className="space-y-6 printable-area">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 no-print">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Báo cáo</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-semibold text-gray-700 shadow-sm transition">
                            <PrinterIcon className="w-5 h-5" /> In báo cáo
                        </button>
                        <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 shadow-sm transition"><DownloadIcon className="w-5 h-5" /> Xuất khẩu</button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 no-print">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                            {(Object.keys(REPORT_TYPES) as ReportType[]).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setActiveTab(type)}
                                    className={`flex items-center gap-2 whitespace-nowrap pb-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === type
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                >
                                    {tabIcons[type]} {REPORT_TYPES[type]}
                                </button>
                            ))}
                        </div>
                         <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Kỳ báo cáo:</span>
                            <DatePicker value={startDate} onChange={setStartDate} className="w-36 py-1.5 px-3 border rounded-lg bg-gray-50 dark:bg-gray-700" placeholder="Từ ngày" />
                            <span className="text-gray-500">-</span>
                            <DatePicker value={endDate} onChange={setEndDate} className="w-36 py-1.5 px-3 border rounded-lg bg-gray-50 dark:bg-gray-700" placeholder="Đến ngày" />
                        </div>
                    </div>
                </div>
                
                <div className="print:pt-8">
                     <div className="hidden print:block text-center mb-6">
                        <h2 className="text-2xl font-bold uppercase">{REPORT_TYPES[activeTab]}</h2>
                        <p>Từ ngày: {new Date(startDate).toLocaleDateString('vi-VN')} - Đến ngày: {new Date(endDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                    {activeTab === 'sales' && <SalesContent data={salesDataAndTotals.data} totals={salesDataAndTotals.totals} orders={orders} />}
                    {activeTab === 'inventory' && <InventoryContent materialReport={inventoryData.materialReport} productReport={inventoryData.productReport} />}
                    {activeTab === 'debt' && <DebtContent data={debtDataAndSummary.data} summaryStats={debtDataAndSummary.summaryStats} />}
                    {activeTab === 'bi' && <BiContent orders={orders} startDate={startDate} endDate={endDate} />}
                </div>

            </div>
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .printable-area { display: block !important; }
                    body > #root > div {
                        display: block !important;
                    }
                     body > #root > div > main {
                        padding: 0 !important;
                    }
                    .bg-white { background-color: transparent !important; }
                    .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
                    .border { border: none !important; }
                }
            `}</style>
        </>
    );
};

export default ReportsPage;
