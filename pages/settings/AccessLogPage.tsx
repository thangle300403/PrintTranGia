
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import Pagination from '../../components/Pagination';
import DatePicker from '../../components/DatePicker';
import CustomSelect from '../../components/CustomSelect';

const AccessLogPage: React.FC = () => {
    const { accessLogs, users, currentUser, rolePermissions } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const hasPermission = useMemo(() => {
        if (!currentUser) return false;
        const perms = rolePermissions[currentUser.roleId] || [];
        return perms.includes('view_logs');
    }, [currentUser, rolePermissions]);

    const getUserName = (userId: string) => {
        return users.find(u => u.id === userId)?.name || 'Unknown User';
    };

    const filteredLogs = useMemo(() => {
        if (!hasPermission) return [];
        return accessLogs
            .filter(log => {
                const logDate = new Date(log.timestamp);
                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0,0,0,0);
                    if (logDate < start) return false;
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23,59,59,999);
                    if (logDate > end) return false;
                }
                
                if (searchTerm) {
                    const lowerSearch = searchTerm.toLowerCase();
                    const userName = getUserName(log.userId).toLowerCase();
                    const ip = log.ipAddress.toLowerCase();
                    return userName.includes(lowerSearch) || ip.includes(lowerSearch) || log.action.toLowerCase().includes(lowerSearch);
                }
                return true;
            })
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [accessLogs, searchTerm, startDate, endDate, users, hasPermission]);

    const paginatedLogs = useMemo(() => {
        return filteredLogs.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredLogs, currentPage, itemsPerPage]);

    const handleItemsPerPageChange = (size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1);
    };

    if (!hasPermission) {
        return <div className="text-center p-8 text-red-600 text-xl">Bạn không có quyền truy cập trang này.</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nhật ký truy cập</h1>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-4">
                    <input
                        type="text"
                        placeholder="Tìm theo tên, IP, hành động..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full md:w-80 py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex items-center gap-2">
                        <DatePicker value={startDate} onChange={val => { setStartDate(val); setCurrentPage(1); }} className="w-36 py-1.5 px-3 border rounded-lg bg-gray-50 text-sm" placeholder="Từ ngày" />
                        <span className="text-gray-500">-</span>
                        <DatePicker value={endDate} onChange={val => { setEndDate(val); setCurrentPage(1); }} className="w-36 py-1.5 px-3 border rounded-lg bg-gray-50 text-sm" placeholder="Đến ngày" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Thời gian</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Người dùng</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hành động</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">IP Address</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedLogs.length > 0 ? paginatedLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {log.timestamp.toLocaleString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                        {getUserName(log.userId)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            log.action === 'Login' ? 'bg-blue-100 text-blue-800' :
                                            log.action === 'Logout' ? 'bg-gray-100 text-gray-800' :
                                            log.action === 'Failed Login' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                                        {log.ipAddress}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                        {log.status === 'Success' ? (
                                            <span className="text-green-600 font-medium">Thành công</span>
                                        ) : (
                                            <span className="text-red-600 font-medium">Thất bại</span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">Không có dữ liệu.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredLogs.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredLogs.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={handleItemsPerPageChange}
                    />
                )}
            </div>
        </div>
    );
};

export default AccessLogPage;
