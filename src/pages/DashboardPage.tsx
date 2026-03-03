
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { PricingModel } from '../types';
import { 
    RevenueIcon, ClipboardListIcon, UserPlusIcon, CreditCardIcon, 
    TrendingUpIcon, TrendingDownIcon, QuoteIcon, OrderIcon, 
    CustomerIcon, WarningIcon, CheckCircleIcon, CalendarIcon 
} from '../components/icons/Icons';

// --- HELPER FUNCTIONS ---
const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

const getProductCategory = (productName: string): string => {
    const lowerName = productName.toLowerCase();
    if (lowerName.includes('tem') || lowerName.includes('nhãn') || lowerName.includes('decal')) {
        return 'In tem nhãn';
    }
    if (lowerName.includes('catalogue') || lowerName.includes('brochure')) {
        return 'In Catalogue';
    }
    if (lowerName.includes('túi giấy')) {
        return 'In Túi giấy';
    }
    return 'Sản phẩm khác';
};

// --- COMPONENTS ---

const WelcomeHeader: React.FC<{ userName?: string }> = ({ userName }) => {
    const [greeting, setGreeting] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Chào buổi sáng');
        else if (hour < 18) setGreeting('Chào buổi chiều');
        else setGreeting('Chào buổi tối');

        const now = new Date();
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setCurrentDate(now.toLocaleDateString('vi-VN', options));
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {greeting}, {userName}! 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                {currentDate}
            </p>
        </div>
    );
};

const KpiCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  colorClass: string; // e.g., "blue"
}> = ({ icon, title, value, change, changeType, colorClass }) => {
  const isIncrease = changeType === 'increase';
  
  // Dynamic classes based on color prop
  const bgColors: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bgColors[colorClass] || bgColors.blue}`}>
            {icon}
        </div>
      </div>
      
      <div className="flex items-center text-xs font-medium">
        <span className={`flex items-center px-2 py-0.5 rounded-full ${isIncrease ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
          {isIncrease ? <TrendingUpIcon className="w-3 h-3 mr-1"/> : <TrendingDownIcon className="w-3 h-3 mr-1"/>}
          {change}%
        </span>
        <span className="text-gray-400 ml-2">so với kỳ trước</span>
      </div>
    </div>
  );
};

const DashboardCard: React.FC<{ title: string; children: React.ReactNode; className?: string; action?: React.ReactNode; }> = ({ title, children, className = '', action }) => (
  <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col ${className}`}>
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
          {title}
      </h3>
      {action}
    </div>
    <div className="flex-1">
        {children}
    </div>
  </div>
);

const RevenueProfitChart: React.FC<{ data: { label: string; revenue: number; profit: number }[] }> = ({ data }) => {
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; data: any }>({ visible: false, x: 0, y: 0, data: null });
  const maxVal = Math.max(...data.map(d => Math.max(d.revenue, d.profit)), 1) * 1.1; // Add 10% buffer

  const handleMouseOver = (e: React.MouseEvent, item: any) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const parentRect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left - parentRect.left + rect.width / 2, 
      y: rect.top - parentRect.top,
      data: item,
    });
  };

  // Generate Path for Profit Line (Spline approximation)
  const getLinePath = () => {
      if (data.length === 0) return '';
      const points = data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - (d.profit / maxVal) * 100;
          return `${x},${y}`;
      });
      return `M ${points[0]} L ${points.join(' L ')}`;
  };

  return (
    <div className="h-[320px] w-full relative group cursor-crosshair">
      {/* Tooltip */}
      <div 
        className={`absolute z-20 pointer-events-none transition-opacity duration-200 ${tooltip.visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -110%)' }}
      >
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-gray-700">
              <p className="font-bold mb-1 text-gray-300">{tooltip.data?.label}</p>
              <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Thu: {formatCurrency(tooltip.data?.revenue || 0)}</span>
              </div>
              <div className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                   <span>Lãi: {formatCurrency(tooltip.data?.profit || 0)}</span>
              </div>
          </div>
          {/* Tooltip Arrow */}
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900 absolute left-1/2 -translate-x-1/2"></div>
      </div>

      <div className="h-full flex flex-col relative">
        {/* Y-Axis Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 0.25, 0.5, 0.75, 1].reverse().map((tick, i) => (
                <div key={i} className="flex items-center w-full h-0 border-t border-dashed border-gray-100 dark:border-gray-700 relative">
                    <span className="absolute left-0 -top-2.5 text-[10px] text-gray-400 bg-white dark:bg-gray-800 pr-1">
                        {/* Simplified format for Y-axis labels */}
                         {new Intl.NumberFormat('en', { notation: "compact" }).format(maxVal * tick)}
                    </span>
                </div>
            ))}
        </div>

        {/* Chart Area */}
        <div className="flex-grow relative ml-8 mt-2"> 
            <div className="absolute inset-0 flex justify-between items-end z-10 px-2 md:px-6">
                {data.map((item, index) => (
                    <div 
                        key={index} 
                        className="w-full h-full flex flex-col justify-end items-center relative group/bar"
                        onMouseEnter={(e) => handleMouseOver(e, item)}
                        onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
                    >
                         {/* Revenue Bar */}
                        <div 
                            className="w-1.5 md:w-4 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm md:rounded-t-md transition-all duration-300 group-hover/bar:brightness-110 shadow-[0_4px_10px_rgba(59,130,246,0.3)]"
                            style={{ height: `${(item.revenue / maxVal) * 100}%` }}
                        />
                        {/* Hover Overlay Area */}
                        <div className="absolute inset-0 bg-transparent"></div>
                    </div>
                ))}
            </div>

            {/* Profit Line Layer */}
            <svg className="absolute inset-0 w-full h-full z-0 px-2 md:px-6 overflow-visible" preserveAspectRatio="none">
                 <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                 </defs>
                 {/* Area under curve */}
                 <path d={`${getLinePath()} L 100,100 L 0,100 Z`} fill="url(#profitGradient)" className="opacity-0 transition-opacity duration-500 delay-100" style={{opacity: 1}} />
                 {/* The Line */}
                 <path 
                    d={getLinePath()} 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                 />
            </svg>
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between mt-3 ml-8 px-2 md:px-6">
            {data.map((item, i) => (
                 // Only show some labels if too many
                <span key={i} className={`text-[10px] md:text-xs text-gray-400 font-medium ${data.length > 15 && i % 3 !== 0 ? 'hidden' : 'block'}`}>
                    {item.label}
                </span>
            ))}
        </div>
      </div>
    </div>
  );
};

const RevenueDistributionChart: React.FC<{ data: { name: string; value: number; color: string }[] }> = ({ data }) => {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const circumference = 2 * Math.PI * 40; // r = 40
    let cumulativeOffset = 0;

    return (
      <div className="flex flex-col items-center h-full">
        <div className="relative w-56 h-56 md:w-64 md:h-64 my-4 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                 {/* Background Circle */}
                 <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="8" />
                 
                {data.map((item, index) => {
                    const percentage = total > 0 ? (item.value / total) : 0;
                    const strokeDasharray = `${percentage * circumference} ${circumference}`;
                    const strokeDashoffset = -cumulativeOffset;
                    cumulativeOffset += percentage * circumference;
                    
                    const isHovered = hoveredItem === item.name;

                    return (
                        <circle
                            key={index}
                            cx="50" cy="50" r="40"
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth={isHovered ? 12 : 10}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-300 ease-out cursor-pointer hover:filter hover:brightness-110"
                            onMouseEnter={() => setHoveredItem(item.name)}
                            onMouseLeave={() => setHoveredItem(null)}
                        />
                    );
                })}
            </svg>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Doanh thu</span>
                 <span className="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-white mt-1">
                     {new Intl.NumberFormat('en', { notation: "compact" }).format(total)}
                 </span>
            </div>
        </div>
        
        {/* Legend */}
        <div className="w-full mt-4 space-y-2 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
            {data.map(item => (
                <div 
                    key={item.name} 
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${hoveredItem === item.name ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium truncate" title={item.name}>{item.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                         <span className="text-xs font-bold text-gray-800 dark:text-white block">
                            {(item.value / total * 100).toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-gray-400">
                             {new Intl.NumberFormat('en', { notation: "compact" }).format(item.value)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
}

const RecentActivities: React.FC = () => {
    const { quotes, orders, customers } = useData();

    const activities = useMemo(() => {
        const allActivities = [
            ...quotes.map(q => ({ ...q, type: 'quote', date: q.createdAt })),
            ...orders.map(o => ({ ...o, type: 'order', date: o.orderDate })),
            ...customers.map((c, i) => ({ ...c, type: 'customer', date: new Date(Date.now() - i * 3600000) })),
        ];
        return [...allActivities]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 6);
    }, [quotes, orders, customers]);

    const renderActivity = (activity: any) => {
        const timeAgoMinutes = Math.round((new Date().getTime() - new Date(activity.date).getTime()) / (1000 * 60));
        let timeString: string;

        if (timeAgoMinutes < 1) timeString = "Vừa xong";
        else if (timeAgoMinutes < 60) timeString = `${timeAgoMinutes} phút trước`;
        else if (timeAgoMinutes < 1440) timeString = `${Math.floor(timeAgoMinutes / 60)} giờ trước`;
        else timeString = `${Math.floor(timeAgoMinutes / 1440)} ngày trước`;

        switch (activity.type) {
            case 'quote': 
                return { 
                    icon: <QuoteIcon />, 
                    title: `Báo giá mới #${activity.id}`, 
                    desc: `Đã tạo cho khách hàng ${activity.customer.name}`, 
                    time: timeString,
                    bg: 'bg-indigo-100 text-indigo-600'
                };
            case 'order': 
                return { 
                    icon: <OrderIcon />, 
                    title: `Đơn hàng #${activity.id}`, 
                    desc: `Đã đặt thành công với giá trị ${formatCurrency(activity.totalAmount)}`, 
                    time: timeString,
                    bg: 'bg-green-100 text-green-600'
                };
            case 'customer': 
                return { 
                    icon: <CustomerIcon />, 
                    title: `Khách hàng mới`, 
                    desc: `${activity.name} đã được thêm vào hệ thống`, 
                    time: timeString,
                    bg: 'bg-blue-100 text-blue-600'
                };
            default: return { icon: null, title: '', desc: '', time: '', bg: '' };
        }
    };
    
    return (
        <div className="relative pl-4">
             {/* Vertical Line */}
             <div className="absolute top-2 bottom-6 left-6 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
             
             <ul className="space-y-6">
                {activities.map((act, index) => {
                    const { icon, title, desc, time, bg } = renderActivity(act);
                    return (
                        <li key={index} className="relative flex items-start gap-4">
                            {/* Dot/Icon */}
                            <div className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full ${bg} border-2 border-white dark:border-gray-800 flex items-center justify-center shadow-sm`}>
                                <span className="transform scale-75">{icon}</span>
                            </div>
                            <div className="flex-1 pt-1.5 min-w-0">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate pr-2">{title}</p>
                                    <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">{time}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{desc}</p>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};

const TimeRangeButton: React.FC<{ label: string; value: any; activeValue: any; onClick: (value: any) => void; }> = ({ label, value, activeValue, onClick }) => (
    <button
        onClick={() => onClick(value)}
        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
            activeValue === value
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700'
        }`}
    >
        {label}
    </button>
);

const LowStockWidget: React.FC = () => {
    const { products, materialVariants } = useData();

    const lowStockItems = useMemo(() => {
        const lowProducts = products
            .filter(p => p.pricingModel === PricingModel.Fixed && p.lowStockThreshold > 0 && p.initialStock <= p.lowStockThreshold)
            .map(p => ({
                id: p.id, name: p.name, stock: p.initialStock, threshold: p.lowStockThreshold, unit: p.unit || 'cái', type: 'product' as const
            }));

        const lowMaterials = materialVariants
            .filter(m => m.lowStockThreshold > 0 && m.initialStock <= m.lowStockThreshold)
            .map(m => ({
                id: m.id, name: m.name, stock: m.initialStock, threshold: m.lowStockThreshold, unit: m.purchaseUnit, type: 'material' as const
            }));
        
        return [...lowProducts, ...lowMaterials].sort((a, b) => (a.stock / a.threshold) - (b.stock / b.threshold)).slice(0, 5); 
    }, [products, materialVariants]);

    return (
        <DashboardCard title="Cảnh báo Tồn kho" className="h-full">
            {lowStockItems.length > 0 ? (
                <div className="space-y-4">
                    {lowStockItems.map(item => {
                        const percentage = Math.min((item.stock / item.threshold) * 100, 100);
                        const isCritical = percentage < 30;
                        return (
                        <div key={`${item.type}-${item.id}`} className="group">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex flex-col min-w-0 pr-2">
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate" title={item.name}>{item.name}</p>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">{item.type === 'product' ? 'Sản phẩm' : 'Vật tư'}</span>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className={`font-bold text-sm ${isCritical ? 'text-red-600' : 'text-orange-500'}`}>{formatNumber(item.stock)}</span>
                                    <span className="text-xs text-gray-400"> / {formatNumber(item.threshold)} {item.unit}</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-red-500' : 'bg-orange-400'}`} 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    )})}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <CheckCircleIcon className="w-16 h-16 text-green-100 mb-3" />
                    <p className="font-medium text-gray-500">Kho hàng ổn định</p>
                    <p className="text-xs text-gray-400">Không có mặt hàng nào dưới ngưỡng</p>
                </div>
            )}
        </DashboardCard>
    );
};


const DashboardPage: React.FC = () => {
  const { currentUser, invoices, orders } = useData();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  const dashboardData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    // ... (Date logic remains same as original for brevity, assume start/end calculation is correct) ...
    // Re-implementing logic quickly:
    switch (timeRange) {
        case 'week':
            const day = now.getDay(), diff = now.getDate() - day + (day === 0 ? -6 : 1);
            startDate = new Date(now.setDate(diff)); startDate.setHours(0,0,0,0);
            endDate = new Date(startDate); endDate.setDate(startDate.getDate() + 6); endDate.setHours(23,59,59,999);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); endDate.setHours(23,59,59,999);
            break;
        case 'year':
        default:
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31); endDate.setHours(23,59,59,999);
            break;
    }

    const relevantPayments = invoices.flatMap(inv => inv.payments.map(p => ({ ...p, orderId: inv.orderId })))
      .filter(p => { const d = new Date(p.date); return d >= startDate && d <= endDate; });

    const totalRevenue = relevantPayments.reduce((sum, p) => sum + p.amount, 0);
    const newOrdersCount = orders.filter(o => { const d = new Date(o.orderDate); return d >= startDate && d <= endDate }).length;

    let chartData;
    if (timeRange === 'year') {
        const monthlyTotals = Array(12).fill(0).map(() => ({ revenue: 0, profit: 0 }));
        relevantPayments.forEach(p => {
            const m = new Date(p.date).getMonth();
            monthlyTotals[m].revenue += p.amount;
            monthlyTotals[m].profit += p.amount * 0.35; // increased mock margin
        });
        chartData = monthlyTotals.map((d, i) => ({ label: `T${i + 1}`, ...d }));
    } else {
        const dailyTotals = new Map();
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dailyTotals.set(d.toISOString().split('T')[0], { revenue: 0, profit: 0 });
        }
        relevantPayments.forEach(p => {
            const key = new Date(p.date).toISOString().split('T')[0];
            if(dailyTotals.has(key)) {
                const cur = dailyTotals.get(key);
                cur.revenue += p.amount;
                cur.profit += p.amount * 0.35;
            }
        });
        chartData = Array.from(dailyTotals.entries()).map(([k, v]) => ({ label: `${new Date(k).getDate()}`, ...v }));
    }

    // Revenue Distribution Logic (Simplified for visual update)
    const categoryRevenueMap = new Map<string, number>();
    relevantPayments.forEach(p => {
        const order = orders.find(o => o.id === p.orderId);
        if(order) {
            order.items.forEach(item => {
                 const cat = getProductCategory(item.product.name);
                 const val = (item.totalPrice / order.totalAmount) * p.amount;
                 categoryRevenueMap.set(cat, (categoryRevenueMap.get(cat) || 0) + val);
            });
        }
    });

    const categoryColors: Record<string, string> = {
        'In tem nhãn': '#3b82f6', // blue-500
        'In Catalogue': '#10b981', // emerald-500
        'In Túi giấy': '#f59e0b', // amber-500
        'Sản phẩm khác': '#94a3b8', // slate-400
    };
    
    const distributionData = Array.from(categoryRevenueMap.entries())
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value, color: categoryColors[name] || '#6366f1' }))
        .sort((a, b) => b.value - a.value);

    return { totalRevenue, newOrdersCount, chartData, distributionData };
  }, [invoices, orders, timeRange]);
  
  const totalReceivables = useMemo(() => {
     return invoices.reduce((total, inv) => {
        const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
        return total + Math.max(0, inv.totalAmount - paid);
     }, 0);
  }, [invoices]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <WelcomeHeader userName={currentUser?.name} />
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
            {['week', 'month', 'year'].map((t) => (
                <TimeRangeButton 
                    key={t}
                    label={t === 'week' ? 'Tuần' : t === 'month' ? 'Tháng' : 'Năm'} 
                    value={t} 
                    activeValue={timeRange} 
                    onClick={setTimeRange} 
                />
            ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard icon={<RevenueIcon className="w-6 h-6"/>} title="Doanh thu" value={formatCurrency(dashboardData.totalRevenue)} change={12.5} changeType="increase" colorClass="blue" />
        <KpiCard icon={<ClipboardListIcon className="w-6 h-6"/>} title="Đơn hàng mới" value={formatNumber(dashboardData.newOrdersCount)} change={8.2} changeType="increase" colorClass="green" />
        <KpiCard icon={<UserPlusIcon className="w-6 h-6"/>} title="Khách hàng mới" value="15" change={2.4} changeType="decrease" colorClass="orange" />
        <KpiCard icon={<CreditCardIcon className="w-6 h-6"/>} title="Công nợ phải thu" value={formatCurrency(totalReceivables)} change={5.1} changeType="increase" colorClass="red" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <DashboardCard title="Hiệu quả kinh doanh" className="xl:col-span-2 min-h-[400px]">
            <RevenueProfitChart data={dashboardData.chartData} />
        </DashboardCard>

        <DashboardCard title="Tỷ trọng doanh thu" className="min-h-[400px]">
            <RevenueDistributionChart data={dashboardData.distributionData} />
        </DashboardCard>
      </div>
      
      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LowStockWidget />
        <DashboardCard title="Hoạt động gần đây">
          <RecentActivities />
        </DashboardCard>
      </div>

    </div>
  );
};

export default DashboardPage;
