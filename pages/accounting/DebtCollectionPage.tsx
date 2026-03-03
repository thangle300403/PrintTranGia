import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Customer } from '../../types';
import { DebtCollectionModal } from '../../components/accounting/DebtCollectionModal';
import { CreditCardIcon, SearchIcon, UserGroupIcon, PhoneIcon, EnvelopeIcon } from '../../components/icons/Icons';
import Pagination from '../../components/Pagination';

const DebtCollectionPage: React.FC = () => {
    const { customers } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const debtors = useMemo(() => {
        return customers
            .filter(c => (c.creditBalance || 0) > 0)
            .filter(c => {
                if (!searchTerm.trim()) return true;
                const lowerSearch = searchTerm.toLowerCase();
                return c.name.toLowerCase().includes(lowerSearch) || 
                       c.phone.includes(searchTerm) || 
                       (c.email || '').toLowerCase().includes(lowerSearch) ||
                       c.id.toLowerCase().includes(lowerSearch);
            })
            .sort((a, b) => (b.creditBalance || 0) - (a.creditBalance || 0));
    }, [customers, searchTerm]);


    const paginatedDebtors = useMemo(() => {
        return debtors.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [debtors, currentPage, itemsPerPage]);

    const totalReceivables = useMemo(() => {
        return debtors.reduce((sum, c) => sum + (c.creditBalance || 0), 0);
    }, [debtors]);

    const handleItemsPerPageChange = (size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1);
    };

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Thu nợ Khách hàng</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                        <div className="p-4 rounded-full bg-red-100 text-red-600">
                            <CreditCardIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng công nợ phải thu</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{totalReceivables.toLocaleString('vi-VN')} đ</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                         <div className="p-4 rounded-full bg-blue-100 text-blue-600">
                            <UserGroupIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Số lượng khách hàng nợ</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{debtors.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="relative max-w-md">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm khách hàng (Tên, SĐT, Email, Mã KH)..." 
                            value={searchTerm} 
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Khách hàng</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Thông tin liên hệ</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Dư nợ hiện tại</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedDebtors.length > 0 ? paginatedDebtors.map(customer => (
                                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{customer.name}</div>
                                                    <div className="text-sm text-gray-500 font-mono">{customer.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <PhoneIcon className="w-4 h-4 text-gray-400" />
                                                <span>{customer.phone}</span>
                                            </div>
                                            {customer.email && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                                                    <span>{customer.email}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600 dark:text-red-400 text-base">
                                            {(customer.creditBalance || 0).toLocaleString('vi-VN')} đ
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button 
                                                onClick={() => setSelectedCustomer(customer)}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                                            >
                                                Thu nợ
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                            Không có khách hàng nào đang nợ.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {debtors.length > itemsPerPage && (
                        <Pagination 
                            currentPage={currentPage} 
                            totalItems={debtors.length} 
                            itemsPerPage={itemsPerPage} 
                            onPageChange={setCurrentPage} 
                            onItemsPerPageChange={handleItemsPerPageChange} 
                        />
                    )}
                </div>
            </div>

            {selectedCustomer && (
                <DebtCollectionModal 
                    customer={selectedCustomer} 
                    onClose={() => setSelectedCustomer(null)} 
                />
            )}
        </>
    );
};

export default DebtCollectionPage;