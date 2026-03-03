import React, { useState } from 'react';
import { usePagination, DOTS } from '../hooks/usePagination';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
  siblingCount?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  siblingCount = 1,
}) => {
  const [goToPage, setGoToPage] = useState('');
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginationRange = usePagination({
    currentPage,
    totalCount: totalItems,
    siblingCount,
    pageSize: itemsPerPage,
  });
  
  const handleGoToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        const page = parseInt(goToPage, 10);
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
            setGoToPage('');
        } else {
            alert(`Vui lòng nhập số trang hợp lệ từ 1 đến ${totalPages}`);
            setGoToPage('');
        }
    }
  };

  const onNext = () => {
    if (currentPage < totalPages) {
        onPageChange(currentPage + 1);
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
        onPageChange(currentPage - 1);
    }
  };

  const onFirst = () => {
      onPageChange(1);
  }

  const onLast = () => {
      onPageChange(totalPages);
  }

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-y-4 gap-x-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6">
      <div className="flex items-center flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2">
        <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
          Hiển thị {startItem}-{endItem} trên {totalItems} kết quả
        </span>
        <div className="flex items-center gap-2">
            <label htmlFor="items-per-page" className="text-sm text-gray-700 dark:text-gray-300">Hiển thị</label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="text-sm pr-8 py-1 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Items per page"
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-300">/ trang</span>
        </div>
      </div>

      <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button onClick={onFirst} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50" aria-label="First page">
                &laquo;
            </button>
            <button onClick={onPrevious} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50" aria-label="Previous page">
                &lt;
            </button>
            {paginationRange.map((pageNumber, index) => {
            if (pageNumber === DOTS) {
                return <span key={index} className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">...</span>;
            }
            return (
                <button
                key={index}
                onClick={() => onPageChange(pageNumber as number)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${currentPage === pageNumber ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                aria-current={currentPage === pageNumber ? 'page' : undefined}
                >
                {pageNumber}
                </button>
            );
            })}
            <button onClick={onNext} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50" aria-label="Next page">
                &gt;
            </button>
            <button onClick={onLast} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50" aria-label="Last page">
                &raquo;
            </button>
        </nav>
        <div className="flex items-center gap-2">
            <label htmlFor="go-to-page" className="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">Đến trang</label>
            <input
                id="go-to-page"
                type="number"
                value={goToPage}
                onChange={(e) => setGoToPage(e.target.value)}
                onKeyDown={handleGoToPage}
                className="w-20 px-2 py-1 text-sm text-center border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Go to page"
                min="1"
                max={totalPages}
            />
        </div>
      </div>
    </div>
  );
};

export default Pagination;
