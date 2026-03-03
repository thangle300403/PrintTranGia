
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { QuoteStatus, Quote } from '../../types';
import { QuoteDetailModal } from '../../components/quotes/QuoteDetailModal';
import Pagination from '../../components/Pagination';
import DatePicker from '../../components/DatePicker';
import { EyeIcon, PencilIcon, SearchIcon, DocumentTextIcon, CheckCircleIcon, ClockIcon, ArchiveIcon, PlusCircleIcon, RevenueIcon, XCircleIcon } from '../../components/icons/Icons';

// --- STYLING HELPERS ---
const getStatusConfig = (status: QuoteStatus) => {
  switch (status) {
    case QuoteStatus.Approved: 
        return { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: <CheckCircleIcon className="w-3 h-3"/> };
    case QuoteStatus.Cancelled: 
        return { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: <ArchiveIcon className="w-3 h-3"/> };
    case QuoteStatus.Sent: 
        return { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: <DocumentTextIcon className="w-3 h-3"/> };
    case QuoteStatus.PendingApproval: 
        return { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: <ClockIcon className="w-3 h-3"/> };
    default: // Draft
        return { color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200', icon: <PencilIcon className="w-3 h-3"/> };
  }
};

const StatCard: React.FC<{ title: string; value: string; subtext?: string; icon: React.ReactNode; colorClass: string }> = ({ title, value, subtext, icon, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between transition-transform hover:-translate-y-1 duration-300">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
            {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6 ${colorClass.replace('bg-', 'text-')}` })}
        </div>
    </div>
);

const QuoteListPage: React.FC = () => {
  const { quotes, updateQuoteStatus } = useData();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewingQuoteId, setViewingQuoteId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
      const total = quotes.length;
      const totalValue = quotes.reduce((sum, q) => sum + q.totalAmount, 0);
      const approvedCount = quotes.filter(q => q.status === QuoteStatus.Approved).length;
      const pendingCount = quotes.filter(q => q.status === QuoteStatus.Sent || q.status === QuoteStatus.PendingApproval).length;
      const winRate = total > 0 ? Math.round((approvedCount / total) * 100) : 0;

      return {
          totalValue,
          totalCount: total,
          pendingCount,
          winRate
      };
  }, [quotes]);

  const fullyFilteredQuotes = useMemo(() => {
    return quotes
      .filter(quote => {
        if (debouncedSearchTerm) {
          const lowerSearch = debouncedSearchTerm.toLowerCase();
          if (!quote.id.toLowerCase().includes(lowerSearch) && 
              !quote.customer.name.toLowerCase().includes(lowerSearch) &&
              !quote.customer.id.toLowerCase().includes(lowerSearch)) {
            return false;
          }
        }
        if (statusFilter !== 'ALL' && quote.status !== statusFilter) return false;
        
        const quoteDate = new Date(quote.createdAt);
        if (startDate) {
             const start = new Date(startDate);
             start.setHours(0,0,0,0);
             if (quoteDate < start) return false;
        }
        if (endDate) {
            const filterEndDate = new Date(endDate);
            filterEndDate.setHours(23, 59, 59, 999); 
            if (quoteDate > filterEndDate) return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [quotes, debouncedSearchTerm, statusFilter, startDate, endDate]);

  const paginatedQuotes = useMemo(() => {
    return fullyFilteredQuotes.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [fullyFilteredQuotes, currentPage, itemsPerPage]);
  
  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleCancelQuote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn hủy báo giá này không?')) {
        updateQuoteStatus(id, QuoteStatus.Cancelled);
    }
  };

  const tabs = [
      { id: 'ALL', label: 'Tất cả' },
      { id: QuoteStatus.Draft, label: 'Mới tạo' },
      { id: QuoteStatus.Sent, label: 'Đã gửi' },
      { id: QuoteStatus.PendingApproval, label: 'Chờ duyệt' },
      { id: QuoteStatus.Approved, label: 'Đã chốt' },
      { id: QuoteStatus.Cancelled, label: 'Đã hủy' },
  ];

  return (
    <>
    <div className="space-y-6 pb-10">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Báo giá</h1>
            <p className="text-gray-500 text-sm mt-1">Theo dõi và quản lý các báo giá gửi khách hàng.</p>
        </div>
        <button
          onClick={() => navigate('/pos')}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none transform hover:-translate-y-0.5"
        >
          <PlusCircleIcon className="w-5 h-5"/>
          Tạo Báo giá mới
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Tổng giá trị báo giá" 
            value={stats.totalValue.toLocaleString('vi-VN') + ' đ'} 
            icon={<RevenueIcon />} 
            colorClass="bg-blue-600 text-blue-600"
          />
          <StatCard 
            title="Số lượng báo giá" 
            value={stats.totalCount.toString()} 
            subtext="Trong toàn bộ thời gian"
            icon={<DocumentTextIcon />} 
            colorClass="bg-indigo-500 text-indigo-500"
          />
          <StatCard 
            title="Đang thương thảo" 
            value={stats.pendingCount.toString()} 
            subtext="Cần follow-up"
            icon={<ClockIcon />} 
            colorClass="bg-orange-500 text-orange-500"
          />
          <StatCard 
            title="Tỷ lệ chốt đơn" 
            value={stats.winRate + '%'} 
            subtext="Trên tổng số báo giá"
            icon={<CheckCircleIcon />} 
            colorClass="bg-green-50 text-green-500"
          />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-2 overflow-x-auto">
              <nav className="-mb-px flex space-x-6">
                  {tabs.map(tab => (
                      <button
                          key={tab.id}
                          onClick={() => { setStatusFilter(tab.id as any); setCurrentPage(1); }}
                          className={`
                              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                              ${statusFilter === tab.id
                                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}
                          `}
                      >
                          {tab.label}
                      </button>
                  ))}
              </nav>
          </div>

          {/* Filter Bar */}
          <div className="p-4 flex flex-col lg:flex-row gap-4 justify-between bg-gray-50/50 dark:bg-gray-900/20">
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon className="w-4 h-4"/></span>
                    <input
                        type="text"
                        placeholder="Tìm mã BG, khách hàng..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    />
                </div>
                <div className="flex gap-2">
                     <DatePicker
                        value={startDate}
                        onChange={val => { setStartDate(val); setCurrentPage(1); }}
                        className="w-36 py-2 px-3 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        placeholder="Từ ngày"
                    />
                     <DatePicker
                        value={endDate}
                        onChange={val => { setEndDate(val); setCurrentPage(1); }}
                        className="w-36 py-2 px-3 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        placeholder="Đến ngày"
                    />
                </div>
              </div>
              
              <div className="flex justify-end">
                {(searchTerm || startDate || endDate) && (
                    <button
                        onClick={handleResetFilters}
                        className="text-sm text-gray-500 hover:text-red-600 underline decoration-dotted"
                    >
                        Xóa bộ lọc
                    </button>
                )}
              </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thông tin Khách hàng</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã & Ngày tạo</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tổng giá trị</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedQuotes.length > 0 ? paginatedQuotes.map(quote => {
                  const style = getStatusConfig(quote.status);
                  const isEditable = quote.status === QuoteStatus.Draft;
                  const canCancel = quote.status === QuoteStatus.Draft || quote.status === QuoteStatus.Sent || quote.status === QuoteStatus.PendingApproval;
                  
                  return (
                  <tr key={quote.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150">
                    <td className="px-6 py-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-700">
                                {quote.customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{quote.customer.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{quote.customer.phone}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" onClick={() => setViewingQuoteId(quote.id)}>{quote.id}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{quote.createdAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{quote.totalAmount.toLocaleString('vi-VN')} đ</div>
                        <div className="text-xs text-gray-500">{quote.items.length} sản phẩm</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        {quote.status === QuoteStatus.Approved || quote.status === QuoteStatus.Cancelled ? (
                             <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.color} ${style.border}`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.color.replace('text-', 'bg-')}`}></span>
                                {quote.status}
                            </span>
                        ) : (
                             <div className="relative inline-block text-left group/status">
                                <select
                                    value={quote.status}
                                    onChange={(e) => updateQuoteStatus(quote.id, e.target.value as QuoteStatus)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`appearance-none pl-6 pr-8 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${style.bg} ${style.color} ${style.border}`}
                                >
                                    {[QuoteStatus.Draft, QuoteStatus.Sent, QuoteStatus.PendingApproval, QuoteStatus.Approved, QuoteStatus.Cancelled].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none ${style.color.replace('text-', 'bg-')}`}></span>
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setViewingQuoteId(quote.id)} className="p-2 text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors" title="Xem chi tiết">
                                <EyeIcon className="w-4 h-4" />
                            </button>
                            {isEditable && (
                                <button onClick={() => navigate(`/quotes/${quote.id}/edit`)} className="p-2 text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors" title="Chỉnh sửa">
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                            )}
                            {canCancel && (
                                <button onClick={(e) => handleCancelQuote(e, quote.id)} className="p-2 text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors" title="Hủy báo giá">
                                    <XCircleIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </td>
                  </tr>
                )}) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                            <DocumentTextIcon className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-base font-medium">Không tìm thấy báo giá nào.</p>
                            <p className="text-sm">Thử thay đổi bộ lọc hoặc tạo báo giá mới.</p>
                        </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {fullyFilteredQuotes.length > 0 && (
              <Pagination
                  currentPage={currentPage}
                  totalItems={fullyFilteredQuotes.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
              />
          )}
      </div>
    </div>
    {viewingQuoteId && (
        <QuoteDetailModal quoteId={viewingQuoteId} onClose={() => setViewingQuoteId(null)} />
    )}
    </>
  );
};

export default QuoteListPage;
