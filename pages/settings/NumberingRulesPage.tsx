import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { NumberingRule } from '../../types';
import { NumberingRuleModal } from '../../components/settings/NumberingRuleModal';

const NumberingRulesPage: React.FC = () => {
    const { numberingRules, updateNumberingRule } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<NumberingRule | null>(null);

    const handleOpenModal = (rule: NumberingRule) => {
        setEditingRule(rule);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingRule(null);
        setIsModalOpen(false);
    };

    const handleSave = (rule: NumberingRule) => {
        updateNumberingRule(rule);
        handleCloseModal();
    };
    
    const generateExample = (rule: NumberingRule) => {
        const numberStr = String(rule.nextNumber).padStart(rule.numberLength, '0');
        return `${rule.prefix}${numberStr}${rule.suffix || ''}`;
    };

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quy tắc đánh số chứng từ</h1>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Loại chứng từ</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Tiền tố</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Độ dài phần số</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Hậu tố</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Số tiếp theo</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Hiển thị</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {numberingRules.map(rule => (
                                    <tr key={rule.type} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{rule.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-300">{rule.prefix}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{rule.numberLength}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-300">{rule.suffix}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{rule.nextNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-200">{generateExample(rule)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleOpenModal(rule)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-semibold">Sửa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isModalOpen && <NumberingRuleModal rule={editingRule} onClose={handleCloseModal} onSave={handleSave} />}
        </>
    );
};

export default NumberingRulesPage;