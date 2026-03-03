
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Order, ZnsTemplate, ZnsTemplateType } from '../../types';
import { Toast } from '../Toast';
import { ZaloIcon, SendIcon } from '../icons/Icons';

interface SendZnsModalProps {
    order: Order;
    onClose: () => void;
    preselectedTemplateType?: ZnsTemplateType;
    onConfirmAndSend?: () => void;
    onConfirmWithoutSend?: () => void;
}

export const SendZnsModal: React.FC<SendZnsModalProps> = ({ order, onClose, preselectedTemplateType, onConfirmAndSend, onConfirmWithoutSend }) => {
    const { znsTemplates, companyInfo } = useData();
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const isAutomaticTrigger = !!onConfirmAndSend;

    useEffect(() => {
        if (preselectedTemplateType) {
            const preselected = znsTemplates.find(t => t.type === preselectedTemplateType);
            if (preselected) {
                setSelectedTemplateId(preselected.id);
            }
        } else if (znsTemplates.length > 0) {
            setSelectedTemplateId(znsTemplates[0].id);
        }
    }, [preselectedTemplateType, znsTemplates]);

    const selectedTemplate = useMemo(() => {
        return znsTemplates.find(t => t.id === selectedTemplateId);
    }, [selectedTemplateId, znsTemplates]);

    const previewMessage = useMemo(() => {
        if (!selectedTemplate || !order) return '';

        let content = selectedTemplate.content;
        const replacements: Record<string, string> = {
            '{{customer_name}}': order.customer.name,
            '{{order_id}}': order.id,
            '{{total_amount}}': order.totalAmount.toLocaleString('vi-VN') + 'đ',
            '{{company_name}}': companyInfo.name,
        };

        Object.entries(replacements).forEach(([key, value]) => {
            content = content.replace(new RegExp(key, 'g'), value);
        });

        return content;
    }, [selectedTemplate, order, companyInfo]);

    const handleSend = () => {
        if (!selectedTemplate || !order.customer.phone) {
            alert('Khách hàng không có SĐT hoặc chưa chọn mẫu tin.');
            return;
        }

        setIsLoading(true);
        console.log('Simulating ZNS send...');
        
        setTimeout(() => {
            setIsLoading(false);
            setToastMessage(`Đã gửi ZNS đến SĐT ${order.customer.phone} thành công.`);
            
            if (onConfirmAndSend) {
                onConfirmAndSend();
            }
            // Close modal after toast has time to show
            setTimeout(() => onClose(), 500);
        }, 1500);
    };

    return (
        <>
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                    <ZaloIcon className="w-8 h-8"/>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Gửi thông báo ZNS cho Đơn hàng #{order.id}
                    </h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chọn mẫu tin ZNS</label>
                        <select
                            value={selectedTemplateId}
                            onChange={e => setSelectedTemplateId(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        >
                            <option value="" disabled>-- Chọn một mẫu --</option>
                            {znsTemplates.map(t => (
                                <option key={t.id} value={t.id}>{t.name} (ID: {t.templateId})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Xem trước nội dung</label>
                        <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg min-h-[100px] text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                            {previewMessage || 'Vui lòng chọn một mẫu tin để xem trước.'}
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">
                        Tin nhắn sẽ được gửi đến SĐT của khách hàng: <strong>{order.customer.phone}</strong>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                    {isAutomaticTrigger ? (
                        <>
                            <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Hủy</button>
                            <button type="button" onClick={onConfirmWithoutSend} disabled={isLoading} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition">Chỉ cập nhật trạng thái</button>
                            <button type="button" onClick={handleSend} disabled={isLoading || !selectedTemplateId} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2 disabled:bg-gray-400">
                                {isLoading ? 'Đang gửi...' : 'Gửi & Cập nhật'}
                            </button>
                        </>
                    ) : (
                         <>
                            <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Đóng</button>
                            <button type="button" onClick={handleSend} disabled={isLoading || !selectedTemplateId} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2 disabled:bg-gray-400">
                                {isLoading ? 'Đang gửi...' : <><SendIcon className="w-4 h-4"/> Gửi ngay</>}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </>
    );
};
