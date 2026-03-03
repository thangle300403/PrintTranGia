
import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { Supplier, PurchaseOrder, PurchaseOrderStatus, PaymentStatus, PaymentMethod } from '../../types';
import { PencilIcon, TrashIcon, PlusCircleIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon, TruckIcon, SendIcon, CreditCardIcon, EyeIcon, DownloadIcon, UploadIcon, SearchIcon, ScissorsIcon } from '../../components/icons/Icons';
import { SupplierModal } from '../../components/purchasing/SupplierModal';
import { PurchaseOrderModal } from '../../components/purchasing/PurchaseOrderModal';
import { ReceiveInventoryModal } from '../../components/purchasing/ReceiveInventoryModal';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import CustomSelect from '../../components/CustomSelect';
import Pagination from '../../components/Pagination';

// --- HELPER COMPONENTS ---

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4 transition-transform hover:-translate-y-1">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const POPaymentModal: React.FC<{
    po: PurchaseOrder;
    onClose: () => void;
    onSave: (amount: number, method: PaymentMethod, bankAccountId?: string) => void;
}> = ({ po, onClose, onSave }) => {
    const { companyInfo } = useData();
    const remaining = po.totalAmount - (po.paidAmount || 0);
    const [amount, setAmount] = useState<number | ''>(remaining);
    const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
    const [bankAccountId, setBankAccountId] = useState(companyInfo.bankAccounts[0]?.id || '');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = Number(amount);
        if (numAmount <= 0) return alert('Số tiền phải lớn hơn 0');
        if (numAmount > remaining) return alert('Số tiền không được vượt quá số còn lại');
        
        onSave(numAmount, method, method === PaymentMethod.BankTransfer ? bankAccountId : undefined);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[70] p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Thanh toán Đơn mua hàng #{po.id}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-500">Tổng tiền: <span className="font-bold text-gray-800">{po.totalAmount.toLocaleString('vi-VN')} đ</span></p>
                        <p className="text-sm text-gray-500">Đã trả: <span className="font-bold text-green-600">{(po.paidAmount || 0).toLocaleString('vi-VN')} đ</span></p>
                        <p className="text-sm text-gray-500">Còn lại: <span className="font-bold text-red-600">{remaining.toLocaleString('vi-VN')} đ</span></p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Số tiền thanh toán</label>
                        <FormattedNumberInput value={amount} onChange={setAmount} className="w-full p-2 border rounded" required autoFocus />
                    </div>

                    <div>
                         <label className="block text-sm font-medium mb-1">Phương thức</label>
                         <select value={method} onChange={e => setMethod(e.target.value as PaymentMethod)} className="w-full p-2 border rounded">
                             <option value={PaymentMethod.Cash}>Tiền mặt</option>
                             <option value={PaymentMethod.BankTransfer}>Chuyển khoản</option>
                         </select>
                    </div>

                    {method === PaymentMethod.BankTransfer && (
                        <div>
                             <label className="block text-sm font-medium mb-1">Tài khoản chi</label>
                             <select value={bankAccountId} onChange={e => setBankAccountId(e.target.value)} className="w-full p-2 border rounded">
                                 {companyInfo.bankAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumber}</option>)}
                             </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Xác nhận</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- SUB-TABS ---

const SupplierTab: React.FC<{ 
    onEdit: (s: Supplier) => void, 
    onDelete: (id: string) => void, 
    onAdd: () => void 
}> = ({ onEdit, onDelete, onAdd }) => {
    const { suppliers, supplierGroups } = useData();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [groupFilter, setGroupFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'inactive'>('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Supplier; direction: 'asc' | 'desc' } | null>({ key: 'totalDebt', direction: 'desc' });
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredAndSortedSuppliers = useMemo(() => {
        let result = suppliers.filter(s => {
            const matchesSearch = !searchTerm || 
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.phone.includes(searchTerm);
            
            const matchesGroup = !groupFilter || s.supplierGroupId === groupFilter;
            const matchesStatus = !statusFilter || s.status === statusFilter;

            return matchesSearch && matchesGroup && matchesStatus;
        });

        if (sortConfig) {
            result.sort((a, b) => {
                const aVal = (a as any)[sortConfig.key] ?? '';
                const bVal = (b as any)[sortConfig.key] ?? '';
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [suppliers, searchTerm, groupFilter, statusFilter, sortConfig]);

    const paginatedSuppliers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedSuppliers.slice(start, start + itemsPerPage);
    }, [filteredAndSortedSuppliers, currentPage, itemsPerPage]);

    const groupOptions = [
        { value: '', label: 'Tất cả nhóm' },
        ...supplierGroups.map(g => ({ value: g.id, label: g.name }))
    ];

    const statusOptions = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Ngừng hoạt động' }
    ];

    const requestSort = (key: keyof Supplier) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <SearchIcon className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="Tìm tên, mã, SĐT..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <CustomSelect 
                        options={groupOptions} 
                        value={groupFilter} 
                        onChange={(v) => { setGroupFilter(v); setCurrentPage(1); }} 
                        className="w-full md:w-48"
                    />
                    <CustomSelect 
                        options={statusOptions} 
                        value={statusFilter} 
                        onChange={(v) => { setStatusFilter(v as any); setCurrentPage(1); }} 
                        className="w-full md:w-48"
                    />
                </div>
                <button onClick={onAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap shadow-sm transition">
                    <PlusCircleIcon className="w-4 h-4" /> Thêm NCC
                </button>
            </div>

            <div className="overflow-x-auto border dark:border-gray-700 rounded-lg">
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 cursor-pointer hover:text-blue-600" onClick={() => requestSort('id')}>
                                Mã NCC {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 cursor-pointer hover:text-blue-600" onClick={() => requestSort('name')}>
                                Tên NCC {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Liên hệ</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500 cursor-pointer hover:text-blue-600" onClick={() => requestSort('totalDebt')}>
                                Nợ phải trả {sortConfig?.key === 'totalDebt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500">Trạng thái</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedSuppliers.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">{s.id}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900 dark:text-white">{s.name}</div>
                                    <div className="text-xs text-gray-400">{supplierGroups.find(g => g.id === s.supplierGroupId)?.name || 'Chưa phân nhóm'}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-300 text-sm">
                                    <div>{s.contactPerson || 'N/A'}</div>
                                    <div className="text-xs">{s.phone}</div>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-red-600">{(s.totalDebt || 0).toLocaleString('vi-VN')} đ</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${s.status === 'inactive' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                                        {s.status === 'inactive' ? 'Dừng' : 'Hoạt động'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button onClick={() => onEdit(s)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition" title="Chỉnh sửa"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => onDelete(s.id)} className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition" title="Xóa"><TrashIcon className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                        {paginatedSuppliers.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">Không tìm thấy nhà cung cấp nào phù hợp.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {filteredAndSortedSuppliers.length > itemsPerPage && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredAndSortedSuppliers.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            )}
        </div>
    );
};

const PurchaseOrderTab: React.FC<{ 
    onEdit: (po: PurchaseOrder) => void, 
    onView: (po: PurchaseOrder) => void,
    onDelete: (id: string) => void, 
    onAdd: () => void,
    onStatusChange: (po: PurchaseOrder, status: PurchaseOrderStatus) => void,
    onPay: (po: PurchaseOrder) => void,
    onToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void
}> = ({ onEdit, onView, onDelete, onAdd, onStatusChange, onPay, onToast }) => {
    const { purchaseOrders, suppliers, addPurchaseOrder } = useData();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [orderTypeFilter, setOrderTypeFilter] = useState<'all' | 'material' | 'service'>('all');
    
    const getStatusBadge = (status: PurchaseOrderStatus) => {
        switch(status) {
            case PurchaseOrderStatus.Received: return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">Đã nhập kho</span>;
            case PurchaseOrderStatus.Ordered: return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">Đã đặt hàng</span>;
            case PurchaseOrderStatus.Cancelled: return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Đã hủy</span>;
            default: return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">Nháp</span>;
        }
    }

    const getPaymentBadge = (status: PaymentStatus) => {
        switch(status) {
            case PaymentStatus.Paid: return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-100">Đã thanh toán</span>;
            case PaymentStatus.Partial: return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-600 border border-yellow-100">TT một phần</span>;
            default: return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">Chưa thanh toán</span>;
        }
    }

    const filteredOrders = useMemo(() => {
        return purchaseOrders.filter(po => {
            if (orderTypeFilter === 'material') {
                return po.items.some(i => i.type === 'material' || i.type === 'raw_material');
            }
            if (orderTypeFilter === 'service') {
                return po.items.some(i => i.type === 'print_service');
            }
            return true;
        }).sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
    }, [purchaseOrders, orderTypeFilter]);

    const downloadTemplate = () => {
        const headers = ["Mã gom nhóm (PO ID)", "Nhà cung cấp (Tên)", "Ngày đặt", "Ngày giao", "Loại (Giấy/Vật tư/Gia công)", "Tên hàng/Dịch vụ", "Số lượng", "ĐVT", "Đơn giá"];
        const sampleRow = ["PO001", "Công ty Giấy Hoàng Anh", "25/12/2025", "28/12/2025", "Giấy", "Giấy Couche 300", "10", "Ram", "500000"];
        const csvContent = "\uFEFF" + headers.join(",") + "\n" + sampleRow.join(",");
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Mau_Nhap_Don_Mua_Hang_Gia_Cong.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const parseDate = (dateStr: string): Date => {
        if (!dateStr) return new Date();
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
        return new Date(dateStr);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                const lines = content.replace(/\r/g, '').split('\n').filter(line => line.trim() !== '');
                
                if (lines.length < 2) {
                    onToast("File không có dữ liệu!", 'error');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return; 
                }
                
                const headerRow = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
                
                const requiredColumns = ['mã gom nhóm', 'nhà cung cấp', 'tên hàng', 'số lượng', 'đơn giá'];
                const hasRequired = requiredColumns.every(req => headerRow.some(h => h.includes(req) || (req === 'mã gom nhóm' && h.includes('po id'))));

                if (!hasRequired) {
                    onToast("File không đúng định dạng mẫu. Vui lòng tải file mẫu và thử lại.", 'error');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                }

                const colMap: Record<number, string> = {};
                headerRow.forEach((h, index) => {
                    if (h.includes('mã') && (h.includes('gom') || h.includes('po'))) colMap[index] = 'poId';
                    else if (h.includes('nhà cung cấp')) colMap[index] = 'supplierName';
                    else if (h.includes('ngày đặt')) colMap[index] = 'orderDate';
                    else if (h.includes('ngày giao')) colMap[index] = 'deliveryDate';
                    else if (h.includes('loại')) colMap[index] = 'typeLabel';
                    else if (h.includes('tên hàng') || h.includes('dịch vụ')) colMap[index] = 'itemName';
                    else if (h.includes('số lượng')) colMap[index] = 'quantity';
                    else if (h.includes('đvt') || h.includes('đơn vị')) colMap[index] = 'unit';
                    else if (h.includes('đơn giá')) colMap[index] = 'price';
                });

                const groupedPOs: Record<string, any> = {};
                const errors: string[] = [];

                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',');
                    const row: any = {};
                    values.forEach((val, index) => {
                        const key = colMap[index];
                        if (key) row[key] = val.trim().replace(/^"|"$/g, '');
                    });

                    if (!row.poId) { errors.push(`Dòng ${i}: Thiếu Mã PO.`); continue; }
                    if (!row.itemName) { errors.push(`Dòng ${i}: Thiếu Tên hàng.`); continue; }
                    
                    const quantity = Number(row.quantity?.replace(/[^0-9.-]+/g, "") || 0);
                    const price = Number(row.price?.replace(/[^0-9.-]+/g, "") || 0);
                    
                    if (isNaN(quantity) || quantity <= 0) { errors.push(`Dòng ${i}: Số lượng không hợp lệ.`); continue; }
                    if (isNaN(price) || price < 0) { errors.push(`Dòng ${i}: Đơn giá không hợp lệ.`); continue; }

                    if (!groupedPOs[row.poId]) {
                        const supplierName = (row.supplierName || '').trim();
                        const supplier = suppliers.find(s => s.name.toLowerCase() === supplierName.toLowerCase());
                        
                        if (!supplier) {
                            errors.push(`Dòng ${i}: Không tìm thấy Nhà cung cấp "${supplierName}" trong hệ thống.`);
                            continue;
                        }
                        
                        groupedPOs[row.poId] = {
                            supplierId: supplier.id,
                            orderDate: row.orderDate ? parseDate(row.orderDate) : new Date(),
                            expectedDeliveryDate: row.deliveryDate ? parseDate(row.deliveryDate) : undefined,
                            items: [],
                            totalAmount: 0,
                            isValid: true
                        };
                    } else if (!groupedPOs[row.poId].isValid) {
                         continue; 
                    }

                    const totalPrice = quantity * price;
                    const typeLabel = (row.typeLabel || '').toLowerCase();
                    let type: 'material' | 'raw_material' | 'print_service' = 'material';
                    if (typeLabel.includes('gia công') || typeLabel.includes('in')) type = 'print_service';
                    else if (typeLabel.includes('vật tư')) type = 'raw_material';

                    groupedPOs[row.poId].items.push({
                        id: `item_${Date.now()}_${i}`,
                        type, 
                        materialName: row.itemName,
                        quantity: quantity,
                        unit: row.unit || 'cái',
                        unitPrice: price,
                        totalPrice: totalPrice,
                    });
                    
                    groupedPOs[row.poId].totalAmount += totalPrice;
                }

                let createdPos = 0;
                Object.values(groupedPOs).forEach(poData => {
                    if (poData.isValid && poData.items.length > 0) {
                        addPurchaseOrder({
                            supplierId: poData.supplierId,
                            orderDate: poData.orderDate,
                            expectedDeliveryDate: poData.expectedDeliveryDate,
                            items: poData.items,
                            totalAmount: poData.totalAmount,
                            paidAmount: 0,
                            paymentStatus: PaymentStatus.Unpaid
                        });
                        createdPos++;
                    }
                });
                
                if (createdPos > 0) {
                    onToast(`Đã nhập thành công ${createdPos} đơn mua hàng/gia công.`, 'success');
                } else if (errors.length > 0) {
                    onToast(`Không tạo được đơn hàng nào. Lỗi:\n${errors.slice(0, 5).join('\n')}`, 'error');
                }

                if (fileInputRef.current) fileInputRef.current.value = '';
            };
            reader.readAsText(file);
        }
    };


    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div className="flex flex-wrap items-center gap-3">
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <button 
                            onClick={() => setOrderTypeFilter('all')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${orderTypeFilter === 'all' ? 'bg-white dark:bg-gray-600 shadow text-blue-600' : 'text-gray-500'}`}
                        >
                            Tất cả
                        </button>
                        <button 
                            onClick={() => setOrderTypeFilter('material')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${orderTypeFilter === 'material' ? 'bg-white dark:bg-gray-600 shadow text-blue-600' : 'text-gray-500'}`}
                        >
                            Vật tư
                        </button>
                        <button 
                            onClick={() => setOrderTypeFilter('service')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${orderTypeFilter === 'service' ? 'bg-white dark:bg-gray-600 shadow text-blue-600' : 'text-gray-500'}`}
                        >
                            Gia công
                        </button>
                    </div>
                    <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                        <button onClick={downloadTemplate} className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 flex items-center gap-1" title="Tải file mẫu"><DownloadIcon className="w-3 h-3" /> Mẫu</button>
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                        <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 flex items-center gap-1" title="Nhập CSV"><UploadIcon className="w-3 h-3" /> Nhập Excel</button>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                    </div>
                </div>
                 <button onClick={onAdd} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center gap-2 shadow-sm transition"><PlusCircleIcon className="w-4 h-4"/> Tạo Đơn hàng / Gia công</button>
            </div>
             <div className="overflow-x-auto border dark:border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Mã PO</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Nhà cung cấp</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Tổng tiền</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500">Loại đơn</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500">Hàng hóa</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500">Thanh toán</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredOrders.map(po => {
                            const supplier = suppliers.find(s => s.id === po.supplierId);
                            const isReceived = po.status === PurchaseOrderStatus.Received;
                            const hasSubcontract = po.items.some(i => i.type === 'print_service');
                            
                            return (
                            <tr key={po.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">{po.id}</td>
                                <td className="px-6 py-4 text-gray-900 dark:text-white">{supplier?.name}</td>
                                <td className="px-6 py-4 text-right font-semibold">{po.totalAmount.toLocaleString('vi-VN')} đ</td>
                                <td className="px-6 py-4 text-center">
                                    {hasSubcontract ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                            <ScissorsIcon className="w-3 h-3 mr-1" /> Gia công
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                            Vật tư
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        {getStatusBadge(po.status)}
                                        {po.status === PurchaseOrderStatus.Ordered && (
                                            <button onClick={(e) => { e.stopPropagation(); onStatusChange(po, PurchaseOrderStatus.Received); }} className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700 flex items-center gap-1">
                                                <TruckIcon className="w-3 h-3"/> Nhập kho
                                            </button>
                                        )}
                                        {po.status === PurchaseOrderStatus.Draft && (
                                            <button onClick={(e) => { e.stopPropagation(); onStatusChange(po, PurchaseOrderStatus.Ordered); }} className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700 flex items-center gap-1">
                                                <SendIcon className="w-3 h-3"/> Đặt hàng
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                     <div className="flex flex-col items-center gap-1">
                                        {getPaymentBadge(po.paymentStatus)}
                                        {po.paymentStatus !== PaymentStatus.Paid && (
                                            <button onClick={(e) => { e.stopPropagation(); onPay(po); }} className="text-[10px] border border-blue-600 text-blue-600 px-2 py-0.5 rounded hover:bg-blue-50">
                                                Thanh toán
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button type="button" onClick={() => onView(po)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition" title="Xem chi tiết"><EyeIcon className="w-4 h-4" /></button>
                                    {!isReceived && (
                                        <>
                                        <button type="button" onClick={() => onEdit(po)} className="p-1.5 text-gray-500 hover:text-indigo-600 rounded hover:bg-blue-50 transition" title="Chỉnh sửa"><PencilIcon className="w-4 h-4" /></button>
                                        <button type="button" onClick={() => onDelete(po.id)} className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition" title="Xóa"><TrashIcon className="w-4 h-4" /></button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )})}
                        {filteredOrders.length === 0 && (
                            <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-500">Không có đơn hàng nào phù hợp.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

const SupplierListPage: React.FC = () => {
    const { 
        suppliers, 
        purchaseOrders, 
        addSupplier, 
        updateSupplier, 
        deleteSupplier, 
        addPurchaseOrder, 
        updatePurchaseOrder, 
        deletePurchaseOrder, 
        updatePurchaseOrderStatus,
        payPurchaseOrder
    } = useData();
    
    const [activeTab, setActiveTab] = useState<'suppliers' | 'orders'>('suppliers');
    const [modal, setModal] = useState<{ type: 'supplier' | 'po', data: any, mode?: 'view' | 'edit' | 'create' } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ type: 'supplier' | 'po', id: string } | null>(null);
    const [paymentModalPo, setPaymentModalPo] = useState<PurchaseOrder | null>(null);
    const [receivingPo, setReceivingPo] = useState<PurchaseOrder | null>(null);
    const [toastState, setToastState] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

    const kpiData = useMemo(() => ({
        supplierCount: suppliers.length,
        totalDebt: suppliers.reduce((sum, s) => sum + (s.totalDebt || 0), 0),
        pendingOrders: purchaseOrders.filter(po => po.status === PurchaseOrderStatus.Ordered).length
    }), [suppliers, purchaseOrders]);

    const handleSaveSupplier = (data: Omit<Supplier, 'id' | 'totalDebt'> | Supplier, saveAndNew?: boolean) => {
        if ('id' in data && data.id) {
            updateSupplier(data as Supplier);
            setToastState({ message: 'Cập nhật nhà cung cấp thành công.', type: 'success' });
        } else {
            addSupplier(data as Omit<Supplier, 'id' | 'totalDebt'>);
            setToastState({ message: 'Thêm nhà cung cấp mới thành công.', type: 'success' });
        }
        
        if (!saveAndNew) {
            setModal(null);
        }
    };

    const handleSavePO = (data: Omit<PurchaseOrder, 'id'> | PurchaseOrder) => {
        if ('id' in data) {
            updatePurchaseOrder(data as PurchaseOrder);
            setToastState({ message: 'Cập nhật đơn mua hàng thành công.', type: 'success' });
        } else {
            addPurchaseOrder(data as Omit<PurchaseOrder, 'id' | 'status'>);
            setToastState({ message: 'Tạo đơn mua hàng mới thành công.', type: 'success' });
        }
        setModal(null);
    };
    
    const handleDelete = () => {
        if (!confirmDelete) return;
        if (confirmDelete.type === 'supplier') {
            deleteSupplier(confirmDelete.id);
            setToastState({ message: 'Đã xóa nhà cung cấp.', type: 'info' });
        } else {
            deletePurchaseOrder(confirmDelete.id);
            setToastState({ message: 'Đã xóa đơn mua hàng.', type: 'info' });
        }
        setConfirmDelete(null);
    };

    const handleStatusChange = (po: PurchaseOrder, newStatus: PurchaseOrderStatus) => {
        if (newStatus === PurchaseOrderStatus.Received) {
            setReceivingPo(po);
        } else {
             updatePurchaseOrderStatus(po.id, newStatus);
             if (newStatus === PurchaseOrderStatus.Ordered) {
                 setToastState({ message: 'Đã chuyển trạng thái sang Đặt hàng.', type: 'info' });
             }
        }
    };

    const handleConfirmReceive = () => {
        if (receivingPo) {
            updatePurchaseOrderStatus(receivingPo.id, PurchaseOrderStatus.Received);
            setToastState({ message: 'Đã nhập kho thành công. Tồn kho và công nợ đã được cập nhật.', type: 'success' });
            setReceivingPo(null);
        }
    };

    const handlePaymentSave = (amount: number, method: PaymentMethod, bankAccountId?: string) => {
        if (paymentModalPo) {
            payPurchaseOrder(paymentModalPo.id, amount, method, bankAccountId);
            setToastState({ message: 'Thanh toán thành công.', type: 'success' });
            setPaymentModalPo(null);
        }
    };

    return (
        <>
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mua hàng & Nhà cung cấp</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title="Tổng số NCC" value={kpiData.supplierCount} icon={<PlusCircleIcon />} />
                <KpiCard title="Tổng nợ phải trả" value={kpiData.totalDebt.toLocaleString('vi-VN') + ' đ'} icon={<CreditCardIcon />} />
                <KpiCard title="Đơn hàng đang chờ" value={kpiData.pendingOrders} icon={<ClockIcon />} />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6 px-6">
                        <button onClick={() => setActiveTab('suppliers')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'suppliers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Nhà cung cấp</button>
                        <button onClick={() => setActiveTab('orders')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'orders' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Đơn mua hàng (PO)</button>
                    </nav>
                </div>

                {activeTab === 'suppliers' ? (
                    <SupplierTab 
                        onEdit={(s) => setModal({ type: 'supplier', data: s, mode: 'edit' })} 
                        onDelete={(id) => setConfirmDelete({ type: 'supplier', id })} 
                        onAdd={() => setModal({ type: 'supplier', data: null, mode: 'create' })} 
                    />
                ) : (
                    <PurchaseOrderTab 
                        onEdit={(po) => setModal({ type: 'po', data: po, mode: 'edit' })} 
                        onView={(po) => setModal({ type: 'po', data: po, mode: 'view' })}
                        onDelete={(id) => setConfirmDelete({ type: 'po', id })} 
                        onAdd={() => setModal({ type: 'po', data: null, mode: 'create' })} 
                        onStatusChange={handleStatusChange}
                        onPay={(po) => setPaymentModalPo(po)}
                        onToast={(msg, type) => setToastState({ message: msg, type })}
                    />
                )}
            </div>
        </div>

        {modal?.type === 'supplier' && <SupplierModal supplier={modal.data} onClose={() => setModal(null)} onSave={handleSaveSupplier} />}
        {modal?.type === 'po' && (
            <PurchaseOrderModal 
                po={modal.data} 
                onClose={() => setModal(null)} 
                onSave={handleSavePO} 
                isViewOnly={modal.mode === 'view'} 
            />
        )}
        {paymentModalPo && <POPaymentModal po={paymentModalPo} onClose={() => setPaymentModalPo(null)} onSave={handlePaymentSave} />}
        {receivingPo && (
            <ReceiveInventoryModal 
                order={receivingPo}
                onClose={() => setReceivingPo(null)}
                onConfirm={handleConfirmReceive}
            />
        )}
        
        <ConfirmationModal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Xác nhận Xóa" message="Bạn có chắc chắn muốn xóa mục này không? Hành động này không thể hoàn tác." />
        {toastState && <Toast message={toastState.message} type={toastState.type} onClose={() => setToastState(null)} />}
        </>
    );
};

export default SupplierListPage;
