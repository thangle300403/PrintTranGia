
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { BankTransactionType } from '../../types';
import FormattedNumberInput from '../../components/FormattedNumberInput';

const BankReconciliationPage: React.FC = () => {
    const { companyInfo, bankTransactions } = useData();
    const [selectedAccountId, setSelectedAccountId] = useState<string>(companyInfo.bankAccounts[0]?.id || '');
    const [statementBalance, setStatementBalance] = useState<number | ''>('');

    const selectedAccount = useMemo(() => 
        companyInfo.bankAccounts.find(acc => acc.id === selectedAccountId), 
    [companyInfo.bankAccounts, selectedAccountId]);

    const systemBalance = useMemo(() => {
        if (!selectedAccount) return 0;
        const opening = selectedAccount.openingBalance || 0;
        const receipts = bankTransactions
            .filter(tx => tx.bankAccountId === selectedAccountId && tx.type === BankTransactionType.Receipt)
            .reduce((sum, tx) => sum + tx.amount, 0);
        const payments = bankTransactions
            .filter(tx => tx.bankAccountId === selectedAccountId && tx.type === BankTransactionType.Payment)
            .reduce((sum, tx) => sum + tx.amount, 0);
        return opening + receipts - payments;
    }, [selectedAccount, bankTransactions, selectedAccountId]);

    const difference = (Number(statementBalance) || 0) - systemBalance;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Đối chiếu tiền gửi</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tài khoản ngân hàng</label>
                        <select 
                            value={selectedAccountId} 
                            onChange={e => setSelectedAccountId(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        >
                            {companyInfo.bankAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumber}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Số dư theo Sao kê ngân hàng</label>
                        <FormattedNumberInput
                            value={statementBalance}
                            onChange={setStatementBalance}
                            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 font-semibold text-right"
                            placeholder="Nhập số dư cuối kỳ trên sao kê"
                        />
                    </div>
                </div>

                {/* Summary Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Kết quả đối chiếu</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Số dư sổ sách (Hệ thống):</span>
                            <span className="font-semibold text-lg">{systemBalance.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Số dư sao kê:</span>
                            <span className="font-semibold text-lg text-blue-600">{(Number(statementBalance) || 0).toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-gray-800 dark:text-gray-200 font-bold">Chênh lệch:</span>
                            <span className={`font-bold text-xl ${difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {difference > 0 ? '+' : ''}{difference.toLocaleString('vi-VN')} đ
                            </span>
                        </div>
                    </div>
                    {difference !== 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm mt-4">
                            <p>Có sự chênh lệch. Vui lòng kiểm tra lại các giao dịch chưa được ghi nhận hoặc sai sót trong nhập liệu.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BankReconciliationPage;
