
import React, { useState, useMemo } from 'react';
import { PurchaseOrder, PurchaseOrderStatus } from '../../types';
import { CheckCircleIcon, BoxIcon, CreditCardIcon, ArrowRightIcon, TruckIcon } from '../icons/Icons';

interface ReceiveInventoryModalProps {
    order: PurchaseOrder;
    onClose: () => void;
    onConfirm: () => void;
}

export const ReceiveInventoryModal: React.FC<ReceiveInventoryModalProps> = ({ order, onClose, onConfirm }) => {
    const [step, setStep] = useState(1);

    const steps = [
        { number: 1, title: 'Kiểm tra Hàng hóa', icon: <BoxIcon className="w-5 h-5"/> },
        { number: 2, title: 'Công nợ & Thanh toán', icon: <CreditCardIcon className="w-5 h-5"/> },
        { number: 3, title: 'Xác nhận', icon: <CheckCircleIcon className="w-5 h-5"/> },
    ];

    const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const renderStep1 = () => (
        <div className="space-y-4 animate-fade-in">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <TruckIcon className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                    <h4 className="font-bold text-blue-800">Thông tin lô hàng</h4>
                    <p className="text-sm text-blue-700">Đơn hàng: <strong>{order.id}</strong></p>
                    <p className="text-sm text-blue-700">Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-3 text-left">Sản phẩm / Vật tư</th>
                            <th className="p-3 text-left">Kho đích</th>
                            <th className="p-3 text-center">Số lượng</th>
                            <th className="p-3 text-center">ĐVT</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {order.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="p-3 font-medium">{item.materialName}</td>
                                <td className="p-3 text-gray-500">
                                    {item.type === 'material' ? 'Kho Giấy' : item.type === 'raw_material' ? 'Kho Vật tư' : 'Không lưu kho'}
                                </td>
                                <td className="p-3 text-center font-bold text-blue-600">{item.quantity.toLocaleString('vi-VN')}</td>
                                <td className="p-3 text-center text-gray-500">{item.unit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-gray-500 italic">* Vui lòng kiểm đếm số lượng thực tế khớp với danh sách trên trước khi tiếp tục.</p>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center py-4">
                <p className="text-gray-500">Tổng giá trị đơn nhập hàng</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{order.totalAmount.toLocaleString('vi-VN')} đ</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-bold text-yellow-800 mb-2">Tác động tài chính:</h4>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                    <li>Công nợ nhà cung cấp sẽ <strong>tăng thêm {order.totalAmount.toLocaleString('vi-VN')} đ</strong>.</li>
                    <li>Trạng thái thanh toán hiện tại: <strong>{order.paymentStatus}</strong>.</li>
                    {order.paymentStatus === 'Chưa thanh toán' && (
                        <li>Bạn cần tạo phiếu chi riêng để thanh toán cho đơn hàng này.</li>
                    )}
                </ul>
            </div>
             <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-700 mb-2">Cập nhật giá vốn:</h4>
                <p className="text-sm text-gray-600">Hệ thống sẽ tự động tính lại <strong>Giá vốn Bình quân Gia quyền</strong> cho các mặt hàng trong kho dựa trên đơn giá nhập lần này.</p>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 text-center animate-fade-in py-4">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircleIcon className="w-10 h-10" />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-gray-900">Sẵn sàng nhập kho</h3>
                <p className="text-gray-600 mt-2">
                    Hệ thống sẽ cập nhật tồn kho và ghi nhận công nợ ngay lập tức.<br/>
                    Hành động này không thể hoàn tác (trừ khi xóa thủ công).
                </p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nhập kho Đơn hàng #{order.id}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>

                {/* Stepper */}
                <div className="px-8 pt-6 pb-2">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                        {steps.map((s) => {
                            const isActive = s.number === step;
                            const isCompleted = s.number < step;
                            return (
                                <div key={s.number} className="flex flex-col items-center bg-white dark:bg-gray-800 px-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                                        isActive ? 'border-blue-600 bg-blue-50 text-blue-600' :
                                        isCompleted ? 'border-green-500 bg-green-500 text-white' :
                                        'border-gray-300 text-gray-400'
                                    }`}>
                                        {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : s.icon}
                                    </div>
                                    <span className={`text-xs font-semibold mt-2 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{s.title}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto max-h-[60vh]">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex justify-between">
                    {step > 1 ? (
                        <button onClick={handleBack} className="px-5 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition">
                            Quay lại
                        </button>
                    ) : (
                        <button onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition">
                            Hủy bỏ
                        </button>
                    )}
                    
                    {step < 3 ? (
                        <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg">
                            Tiếp tục <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    ) : (
                        <button onClick={onConfirm} className="px-8 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-2 shadow-lg transform active:scale-95">
                            XÁC NHẬN NHẬP KHO
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
