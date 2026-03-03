import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { QuoteStatus } from '../../types';
import { QuoteDetailModal } from '../../components/quotes/QuoteDetailModal';
import Pagination from '../../components/Pagination';
import DatePicker from '../../components/DatePicker';
import { EyeIcon, PencilIcon } from '../../components/icons/Icons';
import CustomSelect from '../../components/CustomSelect';

const getStatusClass = (status: QuoteStatus) => {
  switch (status) {
    case 'Đã chốt': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Đã hủy': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'Đã gửi': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'Chờ duyệt': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
    default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  }
};

const QuoteListPage: React.FC = () => {
  const { quotes, updateQuoteStatus } = useData();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewingQuoteId, setViewingQuoteId] = useState<string | null>(null);

  // Debounce search term to improve performance on large lists
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 300); // 300ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

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
        if (statusFilter && quote.status !== statusFilter) return false;
        
        const quoteDate = new Date(quote.createdAt);
        if (startDate && quoteDate < new Date(startDate)) return false;
        if (endDate) {
            const filterEndDate = new Date(endDate);
            filterEndDate.setHours(23, 59, 59, 999); // Include the whole end day
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

  const nonTerminalStatuses = Object.values(QuoteStatus).filter(s => s !== QuoteStatus.Approved && s !== QuoteStatus.Cancelled);
  
  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    ...Object.values(QuoteStatus).map(status => ({ value: status, label: status }))
  ];

  return (
    <>
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Danh sách Báo giá</h1>
        <button
          onClick={() => navigate('/pos')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Tạo Báo giá mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-4">
            <input
                id="search"
                type="text"
                placeholder="Tìm theo mã BG, tên hoặc mã khách..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); }}
                className="w-full md:w-80 py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
            <CustomSelect
                options={statusOptions}
                value={statusFilter}
                onChange={value => { setStatusFilter(value as QuoteStatus | ''); setCurrentPage(1); }}
                className="w-full md:w-auto md:min-w-48"
            />
             <DatePicker
                value={startDate}
                onChange={val => { setStartDate(val); setCurrentPage(1); }}
                className="w-full md:w-auto py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
             <DatePicker
                value={endDate}
                onChange={val => { setEndDate(val); setCurrentPage(1); }}
                className="w-full md:w-auto py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
                onClick={handleResetFilters}
                className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-1.5 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition text-sm"
            >
                Xóa lọc
            </button>
          </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Mã Báo giá</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Khách hàng</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Ngày tạo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Tổng tiền</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedQuotes.length > 0 ? paginatedQuotes.map(quote => {
                const isEditable = quote.status === QuoteStatus.Draft;
                const isTerminalStatus = quote.status === QuoteStatus.Approved || quote.status === QuoteStatus.Cancelled;
                return (
                <tr key={quote.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{quote.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{quote.customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{quote.createdAt.toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-200">{quote.totalAmount.toLocaleString('vi-VN')} VND</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isTerminalStatus ? (
                        <span className={`px-2.5 py-1 inline-flex justify-center text-xs leading-5 font-semibold rounded-full min-w-[120px] ${getStatusClass(quote.status)}`}>
                        {quote.status}
                        </span>
                    ) : (
                        <select
                            value={quote.status}
                            onChange={(e) => updateQuoteStatus(quote.id, e.target.value as QuoteStatus)}
                            onClick={(e) => e.stopPropagation()}
                            className={`px-2.5 py-1 text-xs leading-5 font-semibold rounded-full border-transparent focus:ring-0 focus:outline-none appearance-none cursor-pointer min-w-[120px] text-center ${getStatusClass(quote.status)}`}
                        >
                            {[...nonTerminalStatuses, QuoteStatus.Cancelled].map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <button onClick={() => setViewingQuoteId(quote.id)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Xem">
                        <EyeIcon />
                    </button>
                    {isEditable && (
                         <button onClick={() => navigate(`/quotes/${quote.id}/edit`)} className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Sửa">
                            <PencilIcon />
                        </button>
                    )}
                  </td>
                </tr>
              )}) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Không tìm thấy báo giá phù hợp.
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