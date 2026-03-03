import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { CustomObjectDefinition, CustomObjectField, CustomFieldType } from '../../types';
import { PencilIcon, TrashIcon, MenuIcon } from '../../components/icons/Icons';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';

// Field Modal
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
                        <input name="label" value={formData.label} onChange={handleChange} className={inputClass} required />
                    </div>
                     <div>
                        <label className={labelClass}>Tên máy (Name)</label>
                        <input name="name" value={formData.name} readOnly className={`${inputClass} bg-gray-100 dark:bg-gray-900`} />
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


const CustomModuleBuilderPage: React.FC = () => {
    const { customObjectDefinitions, addCustomObjectDefinition, updateCustomObjectDefinition, deleteCustomObjectDefinition } = useData();
    
    const [selectedDefId, setSelectedDefId] = useState<string | null>(null);
    const [isDefModalOpen, setIsDefModalOpen] = useState(false);
    const [editingDef, setEditingDef] = useState<Partial<CustomObjectDefinition> | null>(null);

    const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<Partial<CustomObjectField> | null>(null);

    const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);


    const [toast, setToast] = useState('');
    const [confirm, setConfirm] = useState<{ type: 'def' | 'field', id: string } | null>(null);
    
    const selectedDef = useMemo(() => customObjectDefinitions.find(d => d.id === selectedDefId), [customObjectDefinitions, selectedDefId]);

    const handleSaveDef = (data: Partial<CustomObjectDefinition>) => {
        if (!data.name || !data.pluralName) {
            alert('Vui lòng nhập Tên và Tên số nhiều.'); return;
        }
        if (data.id) { // Update
            updateCustomObjectDefinition(data as CustomObjectDefinition);
            setToast('Đã cập nhật Module.');
        } else { // Create
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

    // Drag-and-drop for fields
    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, fieldId: string) => {
        setDraggedFieldId(fieldId);
        e.dataTransfer.effectAllowed = 'move';
    };
    const handleDragEnter = (index: number) => {
        if (draggedFieldId) {
            setDragOverIndex(index);
        }
    };
    const handleDragLeave = () => {
        setDragOverIndex(null);
    };
    const handleDrop = (targetIndex: number) => {
        if (!draggedFieldId || !selectedDef) return;
        
        const fields = [...selectedDef.fields];
        const draggedIndex = fields.findIndex(f => f.id === draggedFieldId);
        if (draggedIndex === -1 || draggedIndex === targetIndex) {
            handleDragEnd();
            return;
        };

        const [removed] = fields.splice(draggedIndex, 1);
        fields.splice(targetIndex, 0, removed);
        
        updateCustomObjectDefinition({ ...selectedDef, fields });
        handleDragEnd();
    };
    
    const handleDragEnd = () => {
        setDraggedFieldId(null);
        setDragOverIndex(null);
    }


    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
                {/* Left: Definitions List */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
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
                {/* Right: Fields List */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                    {selectedDef ? (
                         <>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-lg">Các trường của "{selectedDef.name}"</h2>
                                <button onClick={() => { setEditingField(null); setIsFieldModalOpen(true); }} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">+ Thêm trường</button>
                            </div>
                            <ul className="space-y-2 flex-1 overflow-y-auto" onDragLeave={handleDragLeave}>
                                {selectedDef.fields.map((field, index) => (
                                    <React.Fragment key={field.id}>
                                    {dragOverIndex === index && (
                                         <div className="h-1 bg-blue-500 rounded-full my-1 transition-all" />
                                     )}
                                    <li 
                                        draggable
                                        onDragStart={e => handleDragStart(e, field.id)}
                                        onDragEnter={() => handleDragEnter(index)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => handleDrop(index)}
                                        onDragEnd={handleDragEnd}
                                        className={`group relative bg-white dark:bg-gray-700/50 border dark:border-gray-600 p-3 rounded-lg flex items-center gap-3 cursor-grab transition-all shadow-sm hover:shadow-md ${draggedFieldId === field.id ? 'opacity-30' : 'opacity-100'}`}
                                    >
                                        <MenuIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0"/>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">{field.label} {field.isRequired && <span className="text-red-500 text-xs">*</span>}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{field.name}</p>
                                        </div>
                                        <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 rounded-full">{field.type}</span>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => { setEditingField(field); setIsFieldModalOpen(true); }} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-gray-600 transition"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={() => setConfirm({ type: 'field', id: field.id })} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-gray-600 transition"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </li>
                                    </React.Fragment>
                                ))}
                                {selectedDef.fields.length === 0 && (
                                    <div className="text-center text-gray-500 dark:text-gray-400 py-10 flex flex-col items-center justify-center h-full">
                                        <p className="mb-4">Module này chưa có trường dữ liệu nào.</p>
                                        <button onClick={() => { setEditingField(null); setIsFieldModalOpen(true); }} className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg">
                                            + Thêm trường đầu tiên
                                        </button>
                                    </div>
                                )}
                            </ul>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Chọn một Module để xem các trường</div>
                    )}
                </div>
            </div>

            {/* Modals */}
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

export default CustomModuleBuilderPage;