import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { CustomObjectRecord, CustomObjectField } from '../../types';

const CustomObjectCreatePage: React.FC = () => {
    const { slug, id } = useParams<{ slug: string; id?: string }>();
    const navigate = useNavigate();
    const { getCustomObjectDefinitionBySlug, getCustomObjectRecordById, addCustomObjectRecord, updateCustomObjectRecord } = useData();
    const isEditMode = !!id;

    const definition = slug ? getCustomObjectDefinitionBySlug(slug) : undefined;
    const [formData, setFormData] = useState<Record<string, any>>({});

    useEffect(() => {
        if (isEditMode && id) {
            const record = getCustomObjectRecordById(id);
            if (record) {
                setFormData(record.fields);
            }
        }
    }, [isEditMode, id, getCustomObjectRecordById]);

    if (!definition) {
        return <div>Đang tải định nghĩa...</div>;
    }

    const handleChange = (fieldName: string, value: any, type: 'text' | 'checkbox') => {
        setFormData(prev => ({ ...prev, [fieldName]: type === 'checkbox' ? value as boolean : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        for (const field of definition.fields) {
            if (field.isRequired && !formData[field.name]) {
                alert(`Vui lòng nhập trường "${field.label}".`);
                return;
            }
        }
        
        if (isEditMode && id) {
            const originalRecord = getCustomObjectRecordById(id);
            if (originalRecord) {
                 updateCustomObjectRecord({ ...originalRecord, fields: formData });
            }
        } else {
            addCustomObjectRecord({ definitionId: definition.id, fields: formData });
        }
        navigate(`/custom/${slug}`);
    };
    
    const renderField = (field: CustomObjectField) => {
        const value = formData[field.name];
        const commonProps = {
            id: field.id,
            name: field.name,
            className: "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500",
            required: field.isRequired,
        };
        switch (field.type) {
            case 'textarea': return <textarea {...commonProps} value={value || ''} onChange={(e) => handleChange(field.name, e.target.value, 'text')} rows={4} />;
            case 'number': return <input type="number" {...commonProps} value={value || ''} onChange={(e) => handleChange(field.name, e.target.value, 'text')} />;
            case 'date': return <input type="date" {...commonProps} value={value || ''} onChange={(e) => handleChange(field.name, e.target.value, 'text')} />;
            case 'select': return (
                <select {...commonProps} value={value || ''} onChange={(e) => handleChange(field.name, e.target.value, 'text')}>
                    <option value="">-- Chọn --</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            );
            case 'checkbox': return (
                <input type="checkbox" id={field.id} name={field.name} checked={!!value} onChange={(e) => handleChange(field.name, e.target.checked, 'checkbox')} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
            );
            case 'text':
            default: return <input type="text" {...commonProps} value={value || ''} onChange={(e) => handleChange(field.name, e.target.value, 'text')} />;
        }
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? `Chỉnh sửa ${definition.name}` : `Tạo ${definition.name} mới`}
             </h1>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border space-y-4">
                {definition.fields.map(field => (
                    <div key={field.id}>
                        <label htmlFor={field.id} className={`block text-sm font-medium mb-1 ${field.type === 'checkbox' ? 'flex items-center gap-2' : ''}`}>
                            {field.type !== 'checkbox' && 
                                <>
                                    {field.label} {field.isRequired && <span className="text-red-500">*</span>}
                                </>
                            }
                            {renderField(field)}
                            {field.type === 'checkbox' && 
                                <>
                                    {field.label} {field.isRequired && <span className="text-red-500">*</span>}
                                </>
                            }
                        </label>
                    </div>
                ))}
             </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => navigate(`/custom/${slug}`)} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 hover:bg-gray-300">Hủy</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Lưu</button>
            </div>
        </form>
    );
};

export default CustomObjectCreatePage;