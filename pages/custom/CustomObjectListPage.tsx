import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { PencilIcon, TrashIcon } from '../../components/icons/Icons';
import Pagination from '../../components/Pagination';

const CustomObjectListPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { getCustomObjectDefinitionBySlug, customObjectRecords, deleteCustomObjectRecord } = useData();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const definition = slug ? getCustomObjectDefinitionBySlug(slug) : undefined;
    
    const filteredRecords = useMemo(() => {
        if (!definition) return [];
        let records = customObjectRecords.filter(r => r.definitionId === definition.id);

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            records = records.filter(record => {
                // Search across all field values for the record
                return Object.values(record.fields).some(value =>
                    String(value).toLowerCase().includes(lowerSearch)
                );
            });
        }
        return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [definition, customObjectRecords, searchTerm]);

    const paginatedRecords = useMemo(() => {
        return filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredRecords, currentPage, itemsPerPage]);

    const handleItemsPerPageChange = (size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
            deleteCustomObjectRecord(id);
        }
    };

    if (!definition) {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold text-red-600">Lỗi</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Không tìm thấy định nghĩa cho module "{slug}".</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{definition.pluralName}</h1>
                <button
                    onClick={() => navigate(`/custom/${slug}/new`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                    + Thêm mới {definition.name}
                </button>
            </div>

             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full md:w-80 py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700"
                />
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                {definition.fields.map(field => (
                                    <th key={field.id} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">{field.label}</th>
                                ))}
                                 <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedRecords.map(record => (
                                <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                    {definition.fields.map(field => (
                                        <td key={field.id} className="px-6 py-4 whitespace-nowrap">
                                            {field.type === 'checkbox'
                                                ? <input type="checkbox" checked={!!record.fields[field.name]} readOnly disabled className="h-4 w-4 rounded" />
                                                : String(record.fields[field.name] || '')
                                            }
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => navigate(`/custom/${slug}/${record.id}/edit`)} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(record.id)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredRecords.length === 0 && (
                        <div className="text-center py-10 text-gray-500">Chưa có bản ghi nào.</div>
                    )}
                </div>
                {filteredRecords.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredRecords.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={handleItemsPerPageChange}
                    />
                )}
            </div>
        </div>
    );
};

export default CustomObjectListPage;