import React from 'react';
import { useData } from '../../context/DataContext';
import { PrinterIcon, DownloadIcon, CloseIcon } from '../icons/Icons';

interface ProductionOrderDetailModalProps {
  orderId: string;
  onClose: () => void;
}

// Helper component for spec cards
const SpecCard: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
        <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">{label}</p>
        <p className="text-base font-bold text-gray-900 dark:text-white break-words">{value || '---'}</p>
    </div>
);


export const ProductionOrderDetailModal: React.FC<ProductionOrderDetailModalProps> = ({ orderId, onClose }) => {
    const { getProductionOrderById, users, printTemplates, companyInfo } = useData();
    const order = getProductionOrderById(orderId);

    const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'N/A';

    const handlePrint = () => {
        if (!order) return;

        const template = printTemplates.find(t => t.type === 'ProductionOrder' && t.isActive);
        
        if (template) {
            let html = template.content;
            const replacements: Record<string, string> = {
                '{companyName}': companyInfo.name,
                '{companyAddress}': companyInfo.address,
                '{companyPhone}': companyInfo.phone,
                '{logo}': companyInfo.logoUrl,
                '{id}': order.id,
                '{relatedOrderId}': order.orderId || '---',
                '{productName}': order.productName,
                '{quantity}': `${order.quantity} ${order.unit || ''}`,
                '{orderDate}': new Date(order.orderDate).toLocaleDateString('vi-VN'),
                '{deliveryDate}': order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('vi-VN') : '---',
                '{salesperson}': getUserName(order.salespersonId),
                '{size}': order.size || '---',
                '{material}': order.material || '---',
                '{printColor}': order.printColor || '---',
                '{design}': order.design || '---',
                '{pages}': order.pages ? String(order.pages) : '---',
                '{printMethod}': order.printMethod || '---',
                '{finishing}': order.finishing || '---',
                '{notes}': order.notes || 'Không có ghi chú.',
            };

            Object.entries(replacements).forEach(([key, value]) => {
                html = html.split(key).join(value);
            });

            const newWindow = window.open('', '', 'height=600,width=800');
            if (newWindow) {
                newWindow.document.write(html);
                newWindow.document.close();
                newWindow.focus();
                setTimeout(() => {
                    newWindow.print();
                    newWindow.close();
                }, 500);
            }
        } else {
            // Fallback to browser print if no template
            alert("Chưa có mẫu in nào được thiết lập cho Lệnh sản xuất.");
        }
    };

    const handleDownloadCsv = () => {
        if (!order) return;

        const headers = [
            "MaLSX", "NgayDat", "SanPham", "KichThuoc", "ChatLieu",
            "SoTrang", "SoLuong", "PhuongThucIn", "GiaCong", "GhiChu"
        ];

        const escapeCsvField = (field: any): string => {
            const str = String(field ?? '');
            if (/[",\n]/.test(str)) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const orderDateObj = new Date(order.orderDate);
        const datePart = orderDateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const dataRow = [
            order.id,
            datePart,
            order.productName,
            order.size,
            order.material,
            order.pages,
            `${order.quantity} ${order.unit}`,
            order.printMethod,
            order.finishing,
            order.notes
        ].map(escapeCsvField).join(',');

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
            + headers.join(',') + "\n"
            + dataRow;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `LSX_${order.id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!order) {
        return (
             <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-red-600 mb-4">Lỗi</h3>
                    <p className="text-gray-700 dark:text-gray-300">Không thể tải thông tin lệnh sản xuất.</p>
                </div>
            </div>
        );
    }
    
    const specItems = [
        { label: "Mã Đơn hàng", value: order.orderId },
        { label: "Số lượng", value: `${order.quantity} ${order.unit || ''}` },
        { label: "Kích thước", value: order.size },
        { label: "Chất liệu", value: order.material },
        { label: "Màu in", value: order.printColor },
        { label: "Thiết kế", value: order.design },
        { label: "Số trang/mặt", value: order.pages },
        { label: "Phương thức in", value: order.printMethod },
        { label: "Gia công", value: order.finishing },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4 transition-opacity" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col border border-gray-200 dark:border-gray-700 transition-transform transform scale-95" 
                onClick={e => e.stopPropagation()}
                style={{ transform: 'scale(1)' }} // Animate in
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chi tiết Lệnh sản xuất #{order.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full"><CloseIcon className="w-6 h-6" /></button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Main Info Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{order.productName}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Từ Đơn hàng: <span className="font-bold text-gray-700 dark:text-gray-300">{order.orderId || '---'}</span></p>
                        </div>
                        <div className="text-right text-sm space-y-1 flex-shrink-0 pl-4">
                            <p className="text-gray-500 dark:text-gray-400">Ngày đặt: <span className="text-gray-900 dark:text-white">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</span></p>
                            <p className="text-gray-500 dark:text-gray-400">Ngày giao: <span className="text-gray-900 dark:text-white font-semibold">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('vi-VN') : '---'}</span></p>
                            <p className="text-gray-500 dark:text-gray-400">NV Kinh doanh: <span className="text-gray-900 dark:text-white font-semibold">{getUserName(order.salespersonId)}</span></p>
                        </div>
                    </div>
                    
                    {/* Production Specs */}
                    <div>
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-3">
                            <span className="w-1 h-5 bg-gray-800 dark:bg-gray-300 rounded-full"></span>
                            THÔNG SỐ SẢN XUẤT
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {specItems.map((item) => (
                                <SpecCard key={item.label} label={item.label} value={item.value} />
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                         <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-3">
                            <span className="w-1 h-5 bg-gray-800 dark:bg-gray-300 rounded-full"></span>
                            GHI CHÚ
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[60px]">
                            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{order.notes || 'Không có ghi chú.'}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex-shrink-0 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500 transition">Đóng</button>
                    <button onClick={handleDownloadCsv} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition"><DownloadIcon className="w-4 h-4" /> Xuất CSV</button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"><PrinterIcon className="w-4 h-4" /> In phiếu</button>
                </div>
            </div>
        </div>
    );
};
