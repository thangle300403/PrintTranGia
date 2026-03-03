
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { CashTransactionType } from '../../types';
import DatePicker from '../../components/DatePicker';
import { PrinterIcon } from '../../components/icons/Icons';

const CashLedgerPage: React.FC = () => {
    const { cashTransactions, openingCashBalance } = useData();
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const ledgerData = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Calculate Opening Balance at start date
        const transactionsBeforeStart = cashTransactions.filter(tx => new Date(tx.date) < start);
        const receiptsBefore = transactionsBeforeStart.filter(tx => tx.type === CashTransactionType.Receipt).reduce((sum, tx) => sum + tx.amount, 0);
        const paymentsBefore = transactionsBeforeStart.filter(tx => tx.type === CashTransactionType.Payment).reduce((sum, tx) => sum + tx.amount, 0);
        const openingBalanceAtStart = openingCashBalance + receiptsBefore - paymentsBefore;

        // Filter transactions within range
        const transactionsInRange = cashTransactions
            .filter(tx => {
                const date = new Date(tx.date);
                return date >= start && date <= end;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort ascending for ledger

        // Calculate running balance
        let runningBalance = openingBalanceAtStart;
        const rows = transactionsInRange.map(tx => {
            const isReceipt = tx.type === CashTransactionType.Receipt;
            runningBalance += isReceipt ? tx.amount : -tx.amount;
            return {
                ...tx,
                receipt: isReceipt ? tx.amount : 0,
                payment: isReceipt ? 0 : tx.amount,
                balance: runningBalance
            };
        });

        return { openingBalanceAtStart, rows };
    }, [cashTransactions, openingCashBalance, startDate, endDate]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 no-print">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sổ chi tiết tiền mặt</h1>
                <button 
                    onClick={handlePrint} 
                    className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-semibold text-gray-700 shadow-sm transition"
                >
                    <PrinterIcon className="w-5 h-5" /> In sổ
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4 no-print">
                <div className="flex items-center gap-2">
                    <DatePicker value={startDate} onChange={setStartDate} className="w-36 py-1.5 px-3 border rounded-lg text-sm bg-gray-50" placeholder="Từ ngày" />
                    <span className="text-gray-500">-</span>
                    <DatePicker value={endDate} onChange={setEndDate} className="w-36 py-1.5 px-3 border rounded-lg text-sm bg-gray-50" placeholder="Đến ngày" />
                </div>
                <div className="text-sm text-gray-500 italic">
                    * Số dư đầu kỳ được tính toán dựa trên toàn bộ lịch sử giao dịch trước ngày bắt đầu.
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden printable-area">
                {/* Print Header */}
                <div className="hidden print:block p-4 text-center border-b">
                    <h2 className="text-2xl font-bold uppercase">Sổ chi tiết tiền mặt</h2>
                    <p>Từ ngày: {new Date(startDate).toLocaleDateString('vi-VN')} - Đến ngày: {new Date(endDate).toLocaleDateString('vi-VN')}</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Ngày CT</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Số CT</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Diễn giải</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Thu</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Chi</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Tồn</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {/* Opening Balance Row */}
                            <tr className="bg-gray-50 dark:bg-gray-900/50 font-semibold">
                                <td colSpan={3} className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">Số dư đầu kỳ</td>
                                <td></td>
                                <td></td>
                                <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{ledgerData.openingBalanceAtStart.toLocaleString('vi-VN')}</td>
                            </tr>
                            {/* Transactions */}
                            {ledgerData.rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.date.toLocaleDateString('vi-VN')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{row.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <p>{row.reason}</p>
                                        <p className="text-xs text-gray-400 italic">{row.subject}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                                        {row.receipt > 0 ? row.receipt.toLocaleString('vi-VN') : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                                        {row.payment > 0 ? row.payment.toLocaleString('vi-VN') : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900 dark:text-white">
                                        {row.balance.toLocaleString('vi-VN')}
                                    </td>
                                </tr>
                            ))}
                            {ledgerData.rows.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Không có phát sinh trong giai đoạn này.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`
                @media print {
                    body > *:not(.printable-area) {
                        display: none;
                    }
                    .printable-area {
                        display: block;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default CashLedgerPage;
