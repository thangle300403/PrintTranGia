
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { MenuItem, CustomObjectDefinition, CustomObjectField, CustomFieldType, PERMISSION_NAMES, Permission, IconName } from '../../types';
import { PencilIcon, TrashIcon, DraggableHandleIcon } from '../../components/icons/Icons';
import { MenuItemModal } from '../../components/settings/MenuItemModal';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';
import IconRenderer from '../../components/IconRenderer';

// --- MenuManager Component ---
const MenuManager: React.FC = () => {
    const { navigationMenu, updateNavigationMenu, currentUser, rolePermissions } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    
    const [draggedItem, setDraggedItem] = useState<{ id: string; type: 'parent' | 'child' } | null>(null);
    const [dragOverTarget, setDragOverTarget] = useState<{ type: 'parent' | 'child' | 'parent-area', id: string } | null>(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState('');

    const hasPermission = useMemo(() => {
        if (!currentUser) return false;
        const perms = rolePermissions[currentUser.roleId] || [];
        return perms.includes('manage_menu');
    }, [currentUser, rolePermissions]);

    const topLevelItems = useMemo(() => navigationMenu.filter(item => !item.parentId).sort((a, b) => a.order - b.order), [navigationMenu]);
    const childItems = useMemo(() => {
        if (!selectedParentId) return [];
        return navigationMenu.filter(item => item.parentId === selectedParentId).sort((a, b) => a.order - b.order);
    }, [navigationMenu, selectedParentId]);
    
    useEffect(() => {
        if (!selectedParentId && topLevelItems.length > 0) {
            setSelectedParentId(topLevelItems[0].id);
        }
    }, [topLevelItems, selectedParentId]);

    if (!hasPermission) {
        return <div className="text-red-500">Bạn không có quyền truy cập chức năng này.</div>;
    }

    const handleOpenModal = (item: Partial<MenuItem> | null = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSaveItem = (itemData: MenuItem) => {
        let newItems = [...navigationMenu];
        if (itemData.id && newItems.some(i => i.id === itemData.id)) {
            newItems = newItems.map(i => (i.id === itemData.id ? itemData : i));
        } else {
            const newId = `menu_${Date.now()}`;
            newItems.push({ ...itemData, id: newId, order: 999 });
        }
        updateNavigationMenu(newItems);
        setToastMessage('Menu đã được cập nhật.');
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDeleteItem = (itemId: string) => {
        setItemToDelete(itemId);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        const itemsToDelete = new Set<string>([itemToDelete]);
        const children = navigationMenu.filter(item => item.parentId === itemToDelete);
        children.forEach(child => itemsToDelete.add(child.id));
        
        const newItems = navigationMenu.filter(item => !itemsToDelete.has(item.id));
        updateNavigationMenu(newItems);
        
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
        setToastMessage('Mục đã được xoá thành công.');
    };

    const handleDragStart = (e: React.DragEvent, id: string, type: 'parent' | 'child') => {
        setDraggedItem({ id, type });
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, type: 'parent' | 'child' | 'parent-area', id: string) => {
        e.preventDefault();
        if (draggedItem) {
            setDragOverTarget({ type, id });
        }
    };
    
    const handleDrop = (targetType: 'parent' | 'child', targetId: string) => {
        if (!draggedItem || draggedItem.id === targetId) {
            return;
        }
        if (draggedItem.type === 'parent' && targetType === 'child') {
            return;
        }

        let items = [...navigationMenu];
        const draggedItemIndex = items.findIndex(item => item.id === draggedItem.id);
        if (draggedItemIndex === -1) return;

        const draggedItemData = { ...items[draggedItemIndex] };
        items.splice(draggedItemIndex, 1);
        
        let targetIndex = items.findIndex(item => item.id === targetId);
        if (targetIndex === -1) return;
        
        if (draggedItem.type === 'parent' && targetType === 'parent') {
            items.splice(targetIndex, 0, draggedItemData);
        } 
        else if (draggedItem.type === 'child' && targetType === 'child') {
            const targetItem = items[targetIndex];
            draggedItemData.parentId = targetItem.parentId;
            items.splice(targetIndex, 0, draggedItemData);
        } 
        else if (draggedItem.type === 'child' && targetType === 'parent') {
            draggedItemData.parentId = targetId;
            const childrenOfTarget = items.filter(i => i.parentId === targetId);
            let insertIndex;
            if (childrenOfTarget.length > 0) {
                const lastChildId = childrenOfTarget[childrenOfTarget.length - 1].id;
                insertIndex = items.findIndex(i => i.id === lastChildId) + 1;
            } else {
                insertIndex = targetIndex + 1;
            }
            items.splice(insertIndex, 0, draggedItemData);
        } else {
            return;
        }

        const finalItems: MenuItem[] = [];
        const parentsInOrder = items.filter(i => !i.parentId);
        
        parentsInOrder.forEach((parent, parentIdx) => {
            finalItems.push({ ...parent, order: parentIdx });
            
            const childrenOfParent = items.filter(i => i.parentId === parent.id);
            childrenOfParent.forEach((child, childIdx) => {
                finalItems.push({ ...child, order: childIdx });
            });
        });
        
        items.forEach(item => {
            if (!finalItems.some(fi => fi.id === item.id)) {
                finalItems.push(item);
            }
        });

        updateNavigationMenu(finalItems);
    };
    
    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverTarget(null);
    };

    return (
        <>
            <p className="text-gray-600 dark:text-gray-400">Kéo và thả để sắp xếp lại các mục menu. Bạn có thể kéo mục con sang một mục cha khác.</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-20rem)] mt-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg">Menu Cha (cấp 1)</h2>
                        <button onClick={() => handleOpenModal({ parentId: undefined })} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">+ Thêm mới</button>
                    </div>
                    <ul className="space-y-2 flex-1 overflow-y-auto" onDragLeave={() => setDragOverTarget(null)}>
                        {topLevelItems.map((item) => (
                            <React.Fragment key={item.id}>
                                {dragOverTarget?.type === 'parent' && dragOverTarget.id === item.id && draggedItem?.id !== item.id && draggedItem?.type === 'parent' && (
                                     <div className="h-1 bg-blue-500 rounded-full my-1 transition-all" />
                                )}
                                <li
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item.id, 'parent')}
                                    onDragOver={(e) => handleDragOver(e, 'parent', item.id)}
                                    onDrop={() => handleDrop('parent', item.id)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => setSelectedParentId(item.id)}
                                    className={`group p-3 rounded-lg cursor-grab flex items-center gap-3 transition-all border
                                    ${selectedParentId === item.id ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-700/50 border-transparent hover:shadow-md'} 
                                    ${draggedItem?.id === item.id ? 'opacity-30' : ''} 
                                    ${draggedItem?.type === 'child' && dragOverTarget?.id === item.id ? 'border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'dark:border-gray-700 shadow-sm'}`}
                                >
                                    <div className="flex-1 flex items-center gap-3">
                                        <IconRenderer name={item.icon} />
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">{item.label}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{item.path}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </li>
                            </React.Fragment>
                        ))}
                    </ul>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                    {selectedParentId ? (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-lg">Menu Con của "{topLevelItems.find(i => i.id === selectedParentId)?.label}"</h2>
                                <button onClick={() => handleOpenModal({ parentId: selectedParentId })} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">+ Thêm mới</button>
                            </div>
                            <ul className="space-y-2 flex-1 overflow-y-auto" onDragLeave={() => setDragOverTarget(null)}>
                                {childItems.map((item) => (
                                     <React.Fragment key={item.id}>
                                        {dragOverTarget?.type === 'child' && dragOverTarget.id === item.id && draggedItem?.id !== item.id && (
                                            <div className="h-1 bg-blue-500 rounded-full my-1 transition-all" />
                                        )}
                                        <li
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, item.id, 'child')}
                                            onDragOver={(e) => handleDragOver(e, 'child', item.id)}
                                            onDrop={() => handleDrop('child', item.id)}
                                            onDragEnd={handleDragEnd}
                                            className={`group p-3 rounded-lg flex items-center gap-3 transition-all border bg-white dark:bg-gray-700/50 shadow-sm hover:shadow-md dark:border-gray-700 ${draggedItem?.id === item.id ? 'opacity-30' : ''}`}
                                        >
                                            <DraggableHandleIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 cursor-grab"/>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800 dark:text-gray-100">{item.label}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{item.path}</p>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(item)} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </li>
                                     </React.Fragment>
                                ))}
                                {childItems.length === 0 && (
                                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        <p>Menu này chưa có mục con nào.</p>
                                    </div>
                                )}
                            </ul>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Chọn một Menu Cha để xem các mục con.</div>
                    )}
                </div>
            </div>

            {isModalOpen && <MenuItemModal itemToEdit={editingItem} onClose={() => setIsModalOpen(false)} onSave={handleSaveItem} existingItems={navigationMenu} />}
            <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={confirmDelete} title="Xác nhận Xóa" message="Bạn có chắc chắn muốn xóa mục này? Các mục con (nếu có) cũng sẽ bị xóa." />
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </>
    );
};

// --- CustomModuleBuilder Component (Internal) ---
const FieldModal: React.FC<{
    field: Partial<CustomObjectField> | null;
    onClose: () => void;
    onSave: (field: CustomObjectField) => void;
}> = ({ field, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<CustomObjectField>>(
        field || { label: '', name: '', type: 'text', isRequired: false, options: [] }
    );

    const createFieldName = (label: string) => {
        return label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        if (name === 'label') {
            setFormData(prev => ({ ...prev, label: value, name: createFieldName(value) }));
        } else if (name === 'options') {
            setFormData(prev => ({ ...prev, options: value.split('\n') }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.label || !formData.name) {
            alert('Vui lòng nhập Tên hiển thị.'); return;
        }
        onSave({ ...formData, id: formData.id || `field_${Date.now()}` } as CustomObjectField);
    };
    
    const inputClass = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h3 className="font-bold text-lg mb-4">{field?.id ? 'Sửa' : 'Thêm'} trường dữ liệu</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass}>Tên hiển thị (Label)</label>
                        <input name="label" value={formData.label || ''} onChange={handleChange} className={inputClass} required />
                    </div>
                     <div>
                        <label className={labelClass}>Tên máy (Name)</label>
                        <input name="name" value={formData.name || ''} readOnly className={`${inputClass} bg-gray-100 dark:bg-gray-900`} />
                    </div>
                     <div>
                        <label className={labelClass}>Loại dữ liệu</label>
                        <select name="type" value={formData.type} onChange={handleChange} className={inputClass}>
                            <option value="text">Văn bản ngắn (Text)</option>
                            <option value="textarea">Văn bản dài (Textarea)</option>
                            <option value="number">Số (Number)</option>
                            <option value="date">Ngày (Date)</option>
                            <option value="select">Dropdown (Select)</option>
                            <option value="checkbox">Checkbox</option>
                        </select>
                    </div>
                    {formData.type === 'select' && (
                        <div>
                            <label className={labelClass}>Các lựa chọn (mỗi lựa chọn một dòng)</label>
                            <textarea
                                name="options"
                                value={formData.options?.join('\n') || ''}
                                onChange={handleChange}
                                className={inputClass}
                                rows={4}
                                placeholder="Lựa chọn 1&#10;Lựa chọn 2&#10;Lựa chọn 3"
                            />
                        </div>
                    )}
                    <label className="flex items-center gap-2"><input type="checkbox" name="isRequired" checked={!!formData.isRequired} onChange={handleChange} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" /> Bắt buộc nhập</label>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CustomModuleBuilder: React.FC = () => {
    const { customObjectDefinitions, addCustomObjectDefinition, updateCustomObjectDefinition, deleteCustomObjectDefinition } = useData();
    
    const [selectedDefId, setSelectedDefId] = useState<string | null>(null);
    const [isDefModalOpen, setIsDefModalOpen] = useState(false);
    const [editingDef, setEditingDef] = useState<Partial<CustomObjectDefinition> | null>(null);

    const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<Partial<CustomObjectField> | null>(null);

    const [toast, setToast] = useState('');
    const [confirm, setConfirm] = useState<{ type: 'def' | 'field', id: string } | null>(null);
    
    const selectedDef = useMemo(() => customObjectDefinitions.find(d => d.id === selectedDefId), [customObjectDefinitions, selectedDefId]);
    
    const handleSaveDef = (data: Partial<CustomObjectDefinition>) => {
        if (!data.name || !data.pluralName) {
            alert('Vui lòng nhập Tên và Tên số nhiều.'); return;
        }
        if (data.id) {
            updateCustomObjectDefinition(data as CustomObjectDefinition);
            setToast('Đã cập nhật Module.');
        } else {
            const newDef = addCustomObjectDefinition(data as any);
            setSelectedDefId(newDef.id);
            setToast('Đã tạo Module mới.');
        }
        setIsDefModalOpen(false);
    };

    const handleSaveField = (field: CustomObjectField) => {
        if (!selectedDef) return;
        const fields = [...selectedDef.fields];
        const existingIndex = fields.findIndex(f => f.id === field.id);
        if (existingIndex > -1) {
            fields[existingIndex] = field;
        } else {
            fields.push(field);
        }
        updateCustomObjectDefinition({ ...selectedDef, fields });
        setIsFieldModalOpen(false);
        setToast('Đã lưu trường dữ liệu.');
    };
    
    const handleDelete = () => {
        if (!confirm) return;
        if (confirm.type === 'def') {
            deleteCustomObjectDefinition(confirm.id);
            if (selectedDefId === confirm.id) setSelectedDefId(null);
            setToast('Đã xoá Module.');
        } else if (confirm.type === 'field' && selectedDef) {
            const newFields = selectedDef.fields.filter(f => f.id !== confirm!.id);
            updateCustomObjectDefinition({ ...selectedDef, fields: newFields });
            setToast('Đã xoá trường dữ liệu.');
        }
        setConfirm(null);
    };

     return (
        <>
            <p className="text-gray-600 dark:text-gray-400">Tạo các module quản lý dữ liệu riêng cho doanh nghiệp của bạn, ví dụ: quản lý tài sản, quản lý công việc...</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-20rem)] mt-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg">Modules Tùy Chỉnh</h2>
                        <button onClick={() => { setEditingDef({}); setIsDefModalOpen(true); }} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">+ Thêm mới</button>
                    </div>
                    <ul className="space-y-2 flex-1 overflow-y-auto">
                        {customObjectDefinitions.map(def => (
                            <li key={def.id} onClick={() => setSelectedDefId(def.id)} className={`group p-3 rounded-lg cursor-pointer ${selectedDefId === def.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold">{def.pluralName}</p>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                        <button onClick={(e) => { e.stopPropagation(); setEditingDef(def); setIsDefModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4"/></button>
                                        <button onClick={(e) => { e.stopPropagation(); setConfirm({ type: 'def', id: def.id }); }} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 font-mono">/custom/{def.slug}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                    {selectedDef ? (
                         <>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-lg">Các trường của "{selectedDef.name}"</h2>
                                <button onClick={() => { setEditingField(null); setIsFieldModalOpen(true); }} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">+ Thêm trường</button>
                            </div>
                            <ul className="space-y-2 flex-1 overflow-y-auto">
                                {selectedDef.fields.map(field => (
                                    <li key={field.id} className="group bg-white dark:bg-gray-700/50 border dark:border-gray-600 p-3 rounded-lg flex items-center gap-3">
                                        <div className="flex-1">
                                            <p className="font-semibold">{field.label} {field.isRequired && <span className="text-red-500 text-xs">*</span>}</p>
                                            <p className="text-xs text-gray-500 font-mono">{field.name}</p>
                                        </div>
                                        <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 rounded-full">{field.type}</span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                            <button onClick={() => { setEditingField(field); setIsFieldModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={() => setConfirm({ type: 'field', id: field.id })} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </li>
                                ))}
                                {selectedDef.fields.length === 0 && (
                                    <div className="text-center text-gray-500 py-10">Module này chưa có trường dữ liệu nào.</div>
                                )}
                            </ul>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">Chọn một Module để xem các trường</div>
                    )}
                </div>
            </div>

            {isDefModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
                        <h3 className="font-bold text-lg mb-4">{editingDef?.id ? 'Sửa' : 'Thêm'} Module</h3>
                        <form onSubmit={e => { e.preventDefault(); handleSaveDef(editingDef || {}); }} className="space-y-4">
                            <input value={editingDef?.name || ''} onChange={e => setEditingDef(p => ({...p, name: e.target.value}))} placeholder="Tên (số ít, vd: Tài sản)" className="w-full p-2 border rounded" required />
                            <input value={editingDef?.pluralName || ''} onChange={e => setEditingDef(p => ({...p, pluralName: e.target.value}))} placeholder="Tên (số nhiều, vd: Quản lý Tài sản)" className="w-full p-2 border rounded" required />
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setIsDefModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isFieldModalOpen && <FieldModal field={editingField} onClose={() => setIsFieldModalOpen(false)} onSave={handleSaveField} />}
            <ConfirmationModal isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={handleDelete} title="Xác nhận Xóa" message="Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác." />
            {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </>
    );
};

const CustomizationPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'menu' | 'modules'>('menu');
    const { currentUser, rolePermissions } = useData();

    const canManageMenu = useMemo(() => {
        if (!currentUser) return false;
        const perms = rolePermissions[currentUser.roleId] || [];
        return perms.includes('manage_menu');
    }, [currentUser, rolePermissions]);

    const canManageModules = useMemo(() => {
        if (!currentUser) return false;
        const perms = rolePermissions[currentUser.roleId] || [];
        return perms.includes('manage_custom_modules');
    }, [currentUser, rolePermissions]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tùy chỉnh Giao diện & Tính năng</h1>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {canManageMenu && (
                        <button
                            onClick={() => setActiveTab('menu')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'menu'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Quản lý Menu
                        </button>
                    )}
                    {canManageModules && (
                         <button
                            onClick={() => setActiveTab('modules')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'modules'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Quản lý Module Tùy chỉnh
                        </button>
                    )}
                </nav>
            </div>
            
            <div className="pt-4">
                {activeTab === 'menu' && canManageMenu && <MenuManager />}
                {activeTab === 'modules' && canManageModules && <CustomModuleBuilder />}
                {!canManageMenu && !canManageModules && <p className="text-red-500">Bạn không có quyền truy cập mục này.</p>}
            </div>
        </div>
    );
};

export default CustomizationPage;
