


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
// FIX: Add missing import for ContractAttachment
import { Contract, ContractStatus, ContractAttachment } from '../../types';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import DatePicker from '../../components/DatePicker';
import { UploadIcon, TrashIcon, PaperClipIcon } from '../../components/icons/Icons';

const ContractCreatePage: React.FC = () => {
    const { customers, users, addContract, updateContract, getContractById, currentUser } = useData();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Partial<Contract>>({
        status: ContractStatus.Draft,
        salespersonId: currentUser?.id,
        signingDate: new Date(),
        attachments: [],
    });
     const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (isEditMode && id) {
            const existingContract = getContractById(id);
            if (existingContract) {
                setFormData({
                    ...existingContract,
                    signingDate: new Date(existingContract.signingDate),
                    expiryDate: existingContract.expiryDate ? new Date(existingContract.expiryDate) : undefined,
                    attachments: existingContract.attachments || [],
                });
            } else {
                alert('Không tìm thấy hợp đồng!');
                navigate('/contracts');
            }
        }
    }, [id, isEditMode, getContractById, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const handleDateChange = (name: 'signingDate' | 'expiryDate', dateString: string) => {
        const date = dateString ? new Date(dateString) : undefined;
        setFormData(prev => ({ ...prev, [name]: date }));
        setIsDirty(true);
    };

    const handleNumberChange = (name: keyof Contract, value: number) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // FIX: Explicitly type 'file' as File to access its properties.
            const newFiles = Array.from(e.target.files).map((file: File) => ({
                id: `file_${Date.now()}_${Math.random()}`,
                name: file.name,
                url: URL.createObjectURL(file), // Temporary URL for preview
                size: file.size,
                uploadedAt: new Date(),
            }));
            setFormData(prev => ({...prev, attachments: [...(prev.attachments || []), ...newFiles]}));
            setIsDirty(true);
        }
    }

    const handleRemoveAttachment = (attachmentId: string) => {
        setFormData(prev => ({ ...prev, attachments: (prev.attachments || []).filter(f => f.id !== attachmentId) }));
        setIsDirty(true);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.customerId || !formData.contractValue) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }

        const dataToSave = {
            ...formData,
            signingDate: new Date(formData.signingDate!),
            expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        };

        if (isEditMode) {
            updateContract(dataToSave as Contract);
        } else {
            addContract(dataToSave as Omit<Contract, 'id'>);
        }
        setIsDirty(false);
        navigate('/contracts');
    };

    const inputClass = "w-full py-1.5 px-3 text-sm border rounded-lg bg-white dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? `Chỉnh sửa Hợp đồng #${id}` : 'Tạo Hợp đồng mới'}
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column for content and attachments */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">Nội dung hợp đồng</h2>
                        <textarea name="content" value={formData.content || ''} onChange={handleChange} rows={20} className={inputClass} placeholder="Nhập các điều khoản và nội dung chi tiết của hợp đồng tại đây..."></textarea>
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">Tệp đính kèm</h2>
                        <div className="space-y-3">
                            {(formData.attachments || []).map(file => (
                                <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <PaperClipIcon className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">{file.name}</a>
                                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB - {file.uploadedAt.toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveAttachment(file.id)} className="p-1.5 rounded-full hover:bg-red-100 text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden"/>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition">
                                <UploadIcon className="w-4 h-4"/> Tải lên tệp
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Right Column for metadata */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white border-b pb-3 dark:border-gray-600">Thông tin chung</h2>
                        <div>
                            <label className={labelClass}>Tiêu đề <span className="text-red-500">*</span></label>
                            <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className={inputClass} required />
                        </div>
                         <div>
                            <label className={labelClass}>Khách hàng <span className="text-red-500">*</span></label>
                            <select name="customerId" value={formData.customerId || ''} onChange={handleChange} className={inputClass} required>
                                <option value="">-- Chọn khách hàng --</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Giá trị hợp đồng (VND) <span className="text-red-500">*</span></label>
                            <FormattedNumberInput name="contractValue" value={formData.contractValue || ''} onChange={(val) => handleNumberChange('contractValue', val)} className={inputClass} required />
                        </div>
                         <div>
                            <label className={labelClass}>Nhân viên phụ trách</label>
                            <select name="salespersonId" value={formData.salespersonId || ''} onChange={handleChange} className={inputClass}>
                                <option value="">-- Chọn nhân viên --</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white border-b pb-3 dark:border-gray-600">Thời hạn & Trạng thái</h2>
                         <div>
                            <label className={labelClass}>Trạng thái</label>
                            <select name="status" value={formData.status || ''} onChange={handleChange} className={inputClass}>
                                {Object.values(ContractStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Ngày ký</label>
                            <DatePicker value={formData.signingDate ? formData.signingDate.toISOString().split('T')[0] : ''} onChange={(val) => handleDateChange('signingDate', val)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Ngày hết hạn</label>
                            <DatePicker value={formData.expiryDate ? formData.expiryDate.toISOString().split('T')[0] : ''} onChange={(val) => handleDateChange('expiryDate', val)} className={inputClass} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky footer for save buttons */}
            {isDirty && (
                <div className="sticky bottom-0 -mx-8 -mb-8 mt-6">
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button type="button" onClick={() => navigate('/contracts')} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 hover:bg-gray-300">Hủy</button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Lưu Hợp đồng</button>
                    </div>
                </div>
            )}
        </form>
    );
};

export default ContractCreatePage;
