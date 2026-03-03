
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import Pagination from '../../components/Pagination';
import DatePicker from '../../components/DatePicker';
import CustomSelect from '../../components/CustomSelect';

const ActivityLogPage: React.FC = () => {
    const { activityLogs, users, currentUser, rolePermissions } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [actionFilter, setActionFilter] = useState('');
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
        return activityLogs
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
                
                if (actionFilter && log.action !== actionFilter) return false;

                if (searchTerm) {
                    const lowerSearch = searchTerm.toLowerCase();
                    const userName = getUserName(log.userId).toLowerCase();
                    return userName.includes(lowerSearch) || 
                           log.description.toLowerCase().includes(lowerSearch) || 
                           log.targetType.toLowerCase().includes(lowerSearch);
                }
                return true;
            })
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [activityLogs, searchTerm, startDate, endDate, actionFilter, users, hasPermission]);

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

    const actionOptions = [
        { value: '', label: 'Tất cả hành động' },
        { value: 'Create', label: 'Tạo mới (Create)' },
        { value: 'Update', label: 'Cập nhật (Update)' },
        { value: 'Delete', label: 'Xóa (Delete)' },
        { value: 'Approve', label: 'Duyệt (Approve)' },
        { value: 'Reject', label: 'Từ chối (Reject)' },
        { value: 'Import', label: 'Nhập khẩu (Import)' },
        { value: 'Export', label: 'Xuất khẩu (Export)' },
    ];

    const getActionColor = (action: string) => {
        switch (action) {
            case 'Create': return 'bg-green-100 text-green-800';
            case 'Update': return 'bg-blue-100 text-blue-800';
            case 'Delete': return 'bg-red-100 text-red-800';
            case 'Approve': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (!hasPermission) {
        return <div className="text-center p-8 text-red-600 text-xl">Bạn không có quyền truy cập trang này.</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nhật ký hoạt động</h1>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-4">
                    <input
                        type="text"
                        placeholder="Tìm theo tên, mô tả, đối tượng..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full md:w-80 py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <CustomSelect 
                        options={actionOptions}
                        value={actionFilter}
                        onChange={val => { setActionFilter(val); setCurrentPage(1); }}
                        className="w-full md:w-48"
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
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Thao tác</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Đối tượng</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Chi tiết</th>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                        {log.targetType} {log.targetId && <span className="text-gray-400 text-xs">({log.targetId})</span>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-md truncate" title={log.description}>
                                        {log.description}
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

export default ActivityLogPage;
