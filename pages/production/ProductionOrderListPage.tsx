
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { ProductionOrder, ProductionOrderStatus } from '../../types';
import { PencilIcon, TrashIcon, DocumentDuplicateIcon, EyeIcon, DownloadIcon } from '../../components/icons/Icons';
import Pagination from '../../components/Pagination';
import DatePicker from '../../components/DatePicker';
import { ProductionOrderDetailModal } from '../../components/production/ProductionOrderDetailModal';
import CustomSelect from '../../components/CustomSelect';
import { ProductionOrderModal } from '../../components/production/ProductionOrderModal';

const getStatusClass = (status: ProductionOrderStatus) => {
  switch (status) {
    case ProductionOrderStatus.New: return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800';
    case ProductionOrderStatus.PendingDesign: return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800';
    case ProductionOrderStatus.InProgress: return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800';
    case ProductionOrderStatus.Completed: return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800';
    case ProductionOrderStatus.Cancelled: return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const StatCard: React.FC<{ title: string, value: number, colorClass: string }> = ({ title, value, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h4>
        <p className={`mt-1 text-2xl font-semibold ${colorClass}`}>{value}</p>
    </div>
);


const ProductionOrderListPage: React.FC = () => {
    const { productionOrders, users, updateProductionOrderStatus, addProductionOrder, updateProductionOrder, deleteProductionOrder, duplicateProductionOrder } = useData();
    const navigate = useNavigate();
    const location = useLocation();

    const [modalState, setModalState] = useState<{ isOpen: boolean; order: Partial<ProductionOrder> | null; prefillData: Partial<ProductionOrder> | null }>({ isOpen: false, order: null, prefillData: null });
    const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);
    
    // Filtering and pagination state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProductionOrderStatus | ''>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    useEffect(() => {
        if (location.state?.openCreateModal) {
            setModalState({ isOpen: true, order: null, prefillData: location.state.prefillData || null });
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    const filteredOrders = useMemo(() => {
        return productionOrders
            .filter(order => {
                if (searchTerm) {
                    const lowerSearch = searchTerm.toLowerCase();
                    if (!order.id.toLowerCase().includes(lowerSearch) && !order.productName.toLowerCase().includes(lowerSearch) && !(order.orderId || '').toLowerCase().includes(lowerSearch)) {
                        return false;
                    }
                }
                if (statusFilter && order.status !== statusFilter) return false;

                const orderDate = new Date(order.orderDate);
                if (startDate && orderDate < new Date(startDate)) return false;
                if (endDate) {
                    const filterEndDate = new Date(endDate);
                    filterEndDate.setHours(23, 59, 59, 999);
                    if (orderDate > filterEndDate) return false;
                }
                return true;
            })
            .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }, [productionOrders, searchTerm, statusFilter, startDate, endDate]);

    const stats = useMemo(() => {
        return {
            total: filteredOrders.length,
            completed: filteredOrders.filter(o => o.status === ProductionOrderStatus.Completed).length,
            inProgress: filteredOrders.filter(o => o.status === ProductionOrderStatus.InProgress).length,
            new: filteredOrders.filter(o => o.status === ProductionOrderStatus.New).length,
        }
    }, [filteredOrders]);

    const paginatedOrders = useMemo(() => {
        return filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredOrders, currentPage, itemsPerPage]);

    const handleItemsPerPageChange = (size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1);
    };

    const handleSave = (data: Partial<ProductionOrder>) => {
        if (data.id) {
            updateProductionOrder(data as ProductionOrder);
        } else {
            addProductionOrder(data as Omit<ProductionOrder, 'id' | 'status' | 'orderDate'>);
        }
        setModalState({ isOpen: false, order: null, prefillData: null });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa Lệnh sản xuất này?')) {
            deleteProductionOrder(id);
        }
    };
    
    const handleDuplicate = (id: string) => {
        if (window.confirm('Bạn có muốn nhân bản Lệnh sản xuất này không?')) {
            duplicateProductionOrder(id);
        }
    };

    const handleExport = () => {
        const headers = ["Mã LSX", "Mã ĐH", "Tên sản phẩm", "Số lượng", "Đơn vị", "Nhân viên KD", "Ngày đặt", "Ngày giao", "Trạng thái", "Ghi chú", "Kích thước", "Chất liệu", "Màu in", "Thiết kế", "Số trang", "Phương thức in", "Gia công"];
        const rows = filteredOrders.map(order => [
            order.id,
            order.orderId,
            `"${order.productName.replace(/"/g, '""')}"`,
            order.quantity,
            order.unit,
            getUserName(order.salespersonId),
            new Date(order.orderDate).toLocaleDateString('vi-VN'),
            order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('vi-VN') : '',
            order.status,
            `"${(order.notes || '').replace(/"/g, '""')}"`,
            order.size,
            order.material,
            order.printColor,
            order.design,
            order.pages,
            order.printMethod,
            order.finishing
        ].join(','));
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(',') + "\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `DanhSachLSX_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'N/A';
    
    const statusOptions = [
        { value: '', label: 'Tất cả trạng thái' },
        ...Object.values(ProductionOrderStatus).map(s => ({ value: s, label: s }))
    ];

    const rowStatusOptions = Object.values(ProductionOrderStatus).map(s => ({ value: s, label: s }));
    
    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Danh sách Lệnh sản xuất (LSX)</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition shadow-sm flex items-center gap-2 text-sm">
                            <DownloadIcon className="w-4 h-4" /> Xuất CSV
                        </button>
                        <button onClick={() => setModalState({ isOpen: true, order: null, prefillData: null })} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm text-sm">
                            + Tạo LSX mới
                        </button>
                    </div>
                </div>

                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Tổng số LSX" value={stats.total} colorClass="text-gray-900 dark:text-white" />
                    <StatCard title="Hoàn thành" value={stats.completed} colorClass="text-green-600 dark:text-green-400" />
                    <StatCard title="Đang sản xuất" value={stats.inProgress} colorClass="text-blue-600 dark:text-blue-400" />
                    <StatCard title="Mới" value={stats.new} colorClass="text-yellow-600 dark:text-yellow-400" />
                </div>


                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap items-center gap-4">
                        <input type="text" placeholder="Tìm theo Mã LSX, Mã ĐH, Tên sản phẩm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-80 py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
                        <CustomSelect
                            options={statusOptions}
                            value={statusFilter}
                            onChange={value => { setStatusFilter(value as ProductionOrderStatus | ''); }}
                            className="w-full md:w-auto md:min-w-48"
                        />
                         <DatePicker value={startDate} onChange={setStartDate} className="w-full md:w-auto py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
                         <DatePicker value={endDate} onChange={setEndDate} className="w-full md:w-auto py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
                        <button onClick={handleResetFilters} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-1.5 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition text-sm">Xóa lọc</button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Mã LSX</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Sản phẩm</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Ngày đặt</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Ngày giao</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Nhân viên KD</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">{order.id}</td>
                                        <td className="px-6 py-4 whitespace-normal text-gray-800 dark:text-gray-200">
                                            <p className="font-semibold text-base">{order.productName}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">SL: {order.quantity} {order.unit}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('vi-VN') : ''}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getUserName(order.salespersonId)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-36" onClick={(e) => e.stopPropagation()}>
                                                <CustomSelect
                                                    options={rowStatusOptions}
                                                    value={order.status}
                                                    onChange={(value) => updateProductionOrderStatus(order.id, value as ProductionOrderStatus)}
                                                    className={`!bg-transparent font-bold !rounded-full !py-1 text-center ${getStatusClass(order.status)}`}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-1">
                                            <button onClick={() => setViewingOrderId(order.id)} className="p-2 text-gray-500 hover:text-teal-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Xem chi tiết"><EyeIcon /></button>
                                            <button onClick={() => setModalState({ isOpen: true, order, prefillData: null })} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Sửa"><PencilIcon className="w-4 h-4" /></button>
                                            <button onClick={() => handleDuplicate(order.id)} className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Nhân bản"><DocumentDuplicateIcon /></button>
                                            <button onClick={() => handleDelete(order.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Xóa"><TrashIcon className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredOrders.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredOrders.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    )}
                </div>
            </div>

            <ProductionOrderModal 
                isOpen={modalState.isOpen}
                order={modalState.order}
                prefillData={modalState.prefillData}
                onClose={() => setModalState({ isOpen: false, order: null, prefillData: null })}
                onSave={handleSave}
            />

            {viewingOrderId && (
                <ProductionOrderDetailModal orderId={viewingOrderId} onClose={() => setViewingOrderId(null)} />
            )}
            
        </>
    );
};

export default ProductionOrderListPage;
