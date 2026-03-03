import React, { useState, useEffect } from 'react';
import { MenuItem, Permission, IconName, PERMISSION_NAMES } from '../../types';
import { AVAILABLE_ICONS } from '../../constants';
import { useData } from '../../context/DataContext';

interface MenuItemModalProps {
    itemToEdit: Partial<MenuItem> | null;
    onClose: () => void;
    onSave: (itemData: MenuItem) => void;
    existingItems: MenuItem[];
}

export const MenuItemModal: React.FC<MenuItemModalProps> = ({ itemToEdit, onClose, onSave, existingItems }) => {
    const { customObjectDefinitions } = useData();
    
    const findModuleIdFromPath = (path: string | undefined): string => {
        if (!path || !path.startsWith('/custom/')) return '';
        const slug = path.replace('/custom/', '');
        const def = customObjectDefinitions.find(d => d.slug === slug);
        return def?.id || '';
    };

    const [linkType, setLinkType] = useState<'custom_module' | 'external'>(
        itemToEdit?.path?.startsWith('/custom/') ? 'custom_module' : 'external'
    );
    const [selectedModuleId, setSelectedModuleId] = useState<string>(() => findModuleIdFromPath(itemToEdit?.path));
    
    const [formData, setFormData] = useState<Partial<MenuItem>>(
        itemToEdit || { label: '', path: '', order: 0 }
    );
    
    const topLevelItems = existingItems.filter(i => !i.parentId && i.id !== formData.id);

    const handleLinkTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as 'custom_module' | 'external';
        setLinkType(newType);
        setSelectedModuleId('');
        // Reset relevant fields
        setFormData(prev => ({ 
            ...prev, 
            label: '', 
            path: '' 
        }));
    };

    const handleModuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const moduleId = e.target.value;
        setSelectedModuleId(moduleId);
        const selectedDef = customObjectDefinitions.find(d => d.id === moduleId);
        if (selectedDef) {
            setFormData(prev => ({
                ...prev,
                label: selectedDef.pluralName,
                path: `/custom/${selectedDef.slug}`
            }));
        } else {
            setFormData(prev => ({ ...prev, label: '', path: '' }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.label || !formData.path) {
            alert('Vui lòng điền đầy đủ Tên hiển thị và Đường dẫn.');
            return;
        }

        const finalData = {
            id: formData.id || '',
            order: formData.order || 0,
            ...formData,
        }
        onSave(finalData as MenuItem);
    };

    const inputClass = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                    {itemToEdit?.id ? 'Chỉnh sửa mục Menu' : 'Thêm mục Menu mới'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass}>Loại liên kết</label>
                        <select value={linkType} onChange={handleLinkTypeChange} className={inputClass}>
                            <option value="external">Đường dẫn Tùy chỉnh / Hệ thống</option>
                            <option value="custom_module">Module Tùy chỉnh</option>
                        </select>
                    </div>

                    {linkType === 'custom_module' && (
                        <div>
                            <label className={labelClass}>Chọn Module</label>
                            <select value={selectedModuleId} onChange={handleModuleChange} className={inputClass} required>
                                <option value="">-- Chọn một Module --</option>
                                {customObjectDefinitions.map(def => (
                                    <option key={def.id} value={def.id}>{def.pluralName}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className={labelClass}>Tên hiển thị (Label)</label>
                        <input name="label" value={formData.label || ''} onChange={handleChange} className={inputClass} required />
                    </div>

                     <div>
                        <label className={labelClass}>Đường dẫn (Path)</label>
                        <input 
                            name="path" 
                            value={formData.path || ''} 
                            onChange={handleChange} 
                            className={`${inputClass} ${linkType === 'custom_module' ? 'bg-gray-100 dark:bg-gray-900' : ''}`} 
                            placeholder="VD: /quotes hoặc #" 
                            required 
                            readOnly={linkType === 'custom_module'} 
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Menu cha</label>
                            <select name="parentId" value={formData.parentId || ''} onChange={handleChange} className={inputClass}>
                                <option value="">(Không có - Đây là menu cấp 1)</option>
                                {topLevelItems.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className={labelClass}>Icon</label>
                            <select name="icon" value={formData.icon || ''} onChange={handleChange} className={inputClass} disabled={!!formData.parentId}>
                                <option value="">(Không có)</option>
                                {AVAILABLE_ICONS.map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">Chỉ áp dụng cho menu cấp 1.</p>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Quyền yêu cầu</label>
                        <select name="permission" value={formData.permission || ''} onChange={handleChange} className={inputClass}>
                            <option value="">(Công khai)</option>
                            {Object.entries(PERMISSION_NAMES).map(([key, name]) => (
                                <option key={key} value={key}>{name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Hủy</button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    )
}