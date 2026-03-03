
import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { CashTransaction, CashTransactionType } from '../../types';
import { CashTransactionModal } from '../../components/accounting/CashTransactionModal';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import CustomSelect from '../../components/CustomSelect';
import { EyeIcon, PlusCircleIcon, BankIcon, TrendingUpIcon, TrendingDownIcon, CreditCardIcon, UploadIcon, DownloadIcon } from '../../components/icons/Icons';
import { Toast } from '../../components/Toast';

const getTypeClass = (type: CashTransactionType) => {
    return type === CashTransactionType.Receipt 
        ? 'text-green-600 dark:text-green-400' 
        : 'text-red-600 dark:text-red-400';
};

const getTypeBadgeClass = (type: CashTransactionType) => {
    return type === CashTransactionType.Receipt 
        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
};


const OpeningBalanceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
    onSave: (amount: number) => void;
}> = ({ isOpen, onClose, currentBalance, onSave }) => {
    const [amount, setAmount] = useState<number | ''>(currentBalance);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(Number(amount) || 0);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Thiết lập số dư đầu kỳ</h3>
                <p className="text-sm text-gray-500 mb-4">Nhập số dư tiền mặt ban đầu của quỹ.</p>
                <FormattedNumberInput
                    value={amount}
                    onChange={setAmount}
                    className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                    autoFocus
                />
                <div className="mt-6 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition">Hủy</button>
                    <button type="button" onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm">Lưu</button>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
    </div>
);


const CashFlowPage: React.FC = () => {
    const { cashTransactions, openingCashBalance, updateOpeningCashBalance, addCashTransaction } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<CashTransactionType>(CashTransactionType.Receipt);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isOpeningBalanceModalOpen, setIsOpeningBalanceModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<CashTransaction | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [toastState, setToastState] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

    // Filters
    const [filterType, setFilterType] = useState<'' | CashTransactionType>('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpenModal = (type: CashTransactionType, transaction?: CashTransaction) => {
        setModalType(type);
        setTransactionToEdit(transaction);
        setIsModalOpen(true);
        setIsDropdownOpen(false);
    };

    const { totalReceipts, totalPayments, closingBalance } = useMemo(() => {
        const totalReceipts = cashTransactions
            .filter(tx => tx.type === CashTransactionType.Receipt)
            .reduce((sum, tx) => sum + tx.amount, 0);

        const totalPayments = cashTransactions
            .filter(tx => tx.type === CashTransactionType.Payment)
            .reduce((sum, tx) => sum + tx.amount, 0);

        const closingBalance = openingCashBalance + totalReceipts - totalPayments;
        return { totalReceipts, totalPayments, closingBalance };
    }, [cashTransactions, openingCashBalance]);


    const filteredTransactions = useMemo(() => {
        return cashTransactions
            .filter(tx => {
                if (filterType && tx.type !== filterType) return false;
                if (searchTerm) {
                    const lowerSearch = searchTerm.toLowerCase();
                    return tx.id.toLowerCase().includes(lowerSearch) ||
                           tx.reason.toLowerCase().includes(lowerSearch) ||
                           tx.subject.toLowerCase().includes(lowerSearch) ||
                           tx.amount.toString().includes(lowerSearch);
                }
                return true;
            })
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [cashTransactions, filterType, searchTerm]);
    
    const typeOptions = [
        { value: '', label: 'Tất cả loại' },
        { value: CashTransactionType.Receipt, label: CashTransactionType.Receipt },
        { value: CashTransactionType.Payment, label: CashTransactionType.Payment },
    ];

    // --- CSV IMPORT LOGIC ---
    const downloadTemplate = () => {
        // Updated headers to Vietnamese
        const headers = ["Ngày chứng từ", "Số tiền", "Đối tượng", "Người giao dịch", "Lý do", "Chứng từ gốc"];
        const sampleRow = ["25/12/2025", "5000000", "Công ty ABC", "Nguyễn Văn A", "Chi tiền mua VPP", "HĐ001"];
        const csvContent = "\uFEFF" + headers.join(",") + "\n" + sampleRow.join(",");
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Mau_Nhap_Phieu_Chi.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const parseDate = (dateStr: string): Date => {
        // Handle dd/mm/yyyy
        if (!dateStr) return new Date();
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
        // Fallback to standard
        return new Date(dateStr);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                const lines = content.replace(/\r/g, '').split('\n').filter(line => line.trim() !== '');
                
                if (lines.length < 2) {
                    setToastState({ message: "File không có dữ liệu!", type: 'error' });
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                }
                
                // Process header to find column indices
                const headerRow = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
                
                // Validate headers
                const requiredColumns = ['số tiền', 'lý do'];
                const hasRequired = requiredColumns.every(req => headerRow.some(h => h.includes(req) || h.includes('amount') || h.includes('reason')));
                
                if (!hasRequired) {
                    setToastState({ 
                        message: "File không đúng định dạng. Vui lòng tải file mẫu và thử lại (Cần có cột Số tiền và Lý do).", 
                        type: 'error' 
                    });
                     if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                }

                // Map column index to internal property name
                const colMap: Record<number, string> = {};
                headerRow.forEach((h, index) => {
                    if (h.includes('ngày')) colMap[index] = 'date';
                    else if (h.includes('số tiền') || h.includes('amount')) colMap[index] = 'amount';
                    else if (h.includes('đối tượng') || h.includes('subject')) colMap[index] = 'subject';
                    else if (h.includes('người') || h.includes('receiver')) colMap[index] = 'receiverName';
                    else if (h.includes('lý do') || h.includes('reason')) colMap[index] = 'reason';
                    else if (h.includes('chứng từ') || h.includes('doc')) colMap[index] = 'referenceDoc';
                });

                let successCount = 0;
                let errorCount = 0;
                const errors: string[] = [];

                for (let i = 1; i < lines.length; i++) {
                    // Rudimentary CSV splitting
                    const values = lines[i].split(',');
                    const row: any = {};
                    
                    values.forEach((val, index) => {
                        const key = colMap[index];
                        if (key) {
                            row[key] = val.trim().replace(/^"|"$/g, '');
                        }
                    });

                    // Validation & Transformation
                    try {
                        const amountStr = row.amount?.replace(/[^0-9.-]+/g, "");
                        const amount = Number(amountStr);
                        
                        if (isNaN(amount) || amount <= 0) throw new Error("Số tiền không hợp lệ");
                        if (!row.reason) throw new Error("Thiếu lý do"); 

                        // Use parsed date if available, else today
                        const date = row.date ? parseDate(row.date) : new Date();

                        addCashTransaction({
                            type: CashTransactionType.Payment, // Default to Payment as requested in template
                            amount: amount,
                            subject: row.subject || 'Không tên',
                            receiverName: row.receiverName,
                            reason: row.reason,
                            referenceDoc: row.referenceDoc,
                            address: '',
                        });
                        
                        successCount++;
                    } catch (err: any) {
                        errorCount++;
                        errors.push(`Dòng ${i + 1}: ${err.message}`);
                    }
                }
                
                if (successCount > 0) {
                    if (errorCount > 0) {
                        setToastState({ 
                            message: `Nhập thành công ${successCount} dòng. Có ${errorCount} dòng lỗi:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '...' : ''}`, 
                            type: 'warning' 
                        });
                    } else {
                        setToastState({ 
                            message: `Nhập thành công toàn bộ ${successCount} dòng.`, 
                            type: 'success' 
                        });
                    }
                } else {
                    setToastState({ message: "Không nhập được dòng nào. Lỗi:\n" + errors.slice(0, 5).join('\n'), type: 'error' });
                }

                if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
            };
            reader.readAsText(file);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                     <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Thu, chi tiền mặt</h1>
                        <p className="text-gray-500 mt-1">Quản lý và theo dõi dòng tiền mặt của doanh nghiệp.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Import Actions */}
                        <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
                             <button
                                onClick={downloadTemplate}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded flex items-center gap-1"
                                title="Tải file mẫu nhập liệu"
                            >
                                <DownloadIcon className="w-3 h-3" /> Mẫu
                            </button>
                            <div className="w-px h-4 bg-gray-300"></div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded flex items-center gap-1"
                                title="Nhập dữ liệu từ file CSV"
                            >
                                <UploadIcon className="w-3 h-3" /> Nhập Excel/CSV
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileUpload} 
                                accept=".csv" 
                                className="hidden" 
                            />
                        </div>

                         <button
                            onClick={() => setIsOpeningBalanceModalOpen(true)}
                            className="px-4 py-2.5 text-sm font-semibold rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                        >
                            Số dư đầu kỳ
                        </button>
                        <div className="relative inline-block text-left">
                            <div>
                                <button
                                    type="button"
                                    className="inline-flex justify-center w-full rounded-lg shadow-sm px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    + Thêm mới
                                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            {isDropdownOpen && (
                                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                    <div className="py-1" role="menu" aria-orientation="vertical">
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleOpenModal(CashTransactionType.Receipt); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Phiếu thu tiền mặt</a>
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleOpenModal(CashTransactionType.Payment); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Phiếu chi tiền mặt</a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                 {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Số dư đầu kỳ" value={`${openingCashBalance.toLocaleString('vi-VN')} đ`} icon={<BankIcon />} colorClass="bg-gray-100 text-gray-600" />
                    <StatCard title="Tổng thu trong kỳ" value={`${totalReceipts.toLocaleString('vi-VN')} đ`} icon={<TrendingUpIcon />} colorClass="bg-green-100 text-green-600" />
                    <StatCard title="Tổng chi trong kỳ" value={`${totalPayments.toLocaleString('vi-VN')} đ`} icon={<TrendingDownIcon />} colorClass="bg-red-100 text-red-600" />
                    <StatCard title="Số dư cuối kỳ" value={`${closingBalance.toLocaleString('vi-VN')} đ`} icon={<CreditCardIcon />} colorClass="bg-blue-100 text-blue-600" />
                </div>

                {/* Table Card */}
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap items-center gap-4">
                            <input
                                type="text"
                                placeholder="Tìm theo số CT, số tiền, lý do..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full md:w-80 py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <CustomSelect
                                options={typeOptions}
                                value={filterType}
                                onChange={value => setFilterType(value as '' | CashTransactionType)}
                                className="w-full md:w-auto md:min-w-48"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Ngày</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Số CT</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Diễn giải</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Tổng tiền</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Hành động</th>
                                </tr>
                             </thead>
                             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{tx.date.toLocaleDateString('vi-VN')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">{tx.id}</td>
                                        <td className="px-6 py-4 whitespace-normal">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeClass(tx.type)}`}>{tx.type}</span>
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{tx.subject}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{tx.reason}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${getTypeClass(tx.type)}`}>
                                            {tx.type === CashTransactionType.Receipt ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            <button 
                                                onClick={() => handleOpenModal(tx.type, tx)}
                                                className="text-gray-500 hover:text-blue-600 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                                title="Xem & In phiếu"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">Không có giao dịch nào.</td>
                                    </tr>
                                )}
                             </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <CashTransactionModal 
                    type={modalType} 
                    onClose={() => setIsModalOpen(false)} 
                    transactionToEdit={transactionToEdit}
                />
            )}
            <OpeningBalanceModal
                isOpen={isOpeningBalanceModalOpen}
                onClose={() => setIsOpeningBalanceModalOpen(false)}
                currentBalance={openingCashBalance}
                onSave={updateOpeningCashBalance}
            />
            {toastState && <Toast message={toastState.message} type={toastState.type} onClose={() => setToastState(null)} />}
        </>
    );
};

export default CashFlowPage;
