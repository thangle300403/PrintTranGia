
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { CashTransactionType, CashCountRecord } from '../../types';
import { PrinterIcon, EyeIcon } from '../../components/icons/Icons';

const MOCK_DENOMINATIONS = [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000];

const CashCountDetailModal: React.FC<{
    record: CashCountRecord;
    onClose: () => void;
}> = ({ record, onClose }) => {
    const { companyInfo, users, printTemplates } = useData();
    const performer = users.find(u => u.id === record.performedByUserId);

    const handlePrint = () => {
        // 1. Find the active CashCount template
        const template = printTemplates.find(t => t.type === 'CashCount' && t.isActive);
        
        // 2. Prepare content
        let printContent = '';
        
        if (template) {
            // Use the template
            let html = template.content;
            
            const denominationRows = MOCK_DENOMINATIONS.map(denom => {
                const count = record.counts[denom] || 0;
                if (count === 0) return '';
                return `<tr>
                    <td style="text-align: right; padding: 8px;">${denom.toLocaleString('vi-VN')}</td>
                    <td style="text-align: center; padding: 8px;">${count}</td>
                    <td style="text-align: right; padding: 8px;">${(count * denom).toLocaleString('vi-VN')}</td>
                </tr>`;
            }).join('');

            const replacements: Record<string, string> = {
                '{companyName}': companyInfo.name,
                '{companyAddress}': companyInfo.address,
                '{countDate}': new Date(record.date).toLocaleString('vi-VN'),
                '{totalActual}': record.actualBalance.toLocaleString('vi-VN'),
                '{systemBalance}': record.systemBalance.toLocaleString('vi-VN'),
                '{difference}': record.difference.toLocaleString('vi-VN'),
                '{denominationsTableRows}': denominationRows || '<tr><td colspan="3" style="text-align:center">Không có tiền mặt</td></tr>',
            };

            Object.entries(replacements).forEach(([key, value]) => {
                html = html.split(key).join(value);
            });
            
            printContent = html;
        } else {
            // Fallback to manual HTML construction if no template found (e.g. failsafe)
            // Use the existing hardcoded structure from previous turn
             const denominationRows = MOCK_DENOMINATIONS.map(denom => {
                const count = record.counts[denom] || 0;
                if (count === 0) return null;
                return `<tr>
                    <td style="text-align: right; font-weight: bold; border: 1px solid #ccc; padding: 8px;">${denom.toLocaleString('vi-VN')}</td>
                    <td style="text-align: center; border: 1px solid #ccc; padding: 8px;">${count}</td>
                    <td style="text-align: right; border: 1px solid #ccc; padding: 8px;">${(count * denom).toLocaleString('vi-VN')}</td>
                </tr>`;
            }).filter(Boolean).join('') || '<tr><td colspan="3" style="text-align: center; padding: 8px;">Không có tiền mặt</td></tr>';

            printContent = `
            <html><head><title>In Phiếu Kiểm Kê</title>
            <style>
                body { font-family: 'Roboto', Arial, sans-serif; font-size: 13px; line-height: 1.5; margin: 0; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .title { font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 15px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ccc; padding: 8px; }
                .bold { font-weight: bold; }
            </style>
            </head><body>
                <div class="header">
                    <div style="font-weight: bold; text-transform: uppercase; font-size: 16px;">${companyInfo.name}</div>
                    <div>${companyInfo.address}</div>
                </div>
                <div style="text-align: center;">
                    <div class="title">BIÊN BẢN KIỂM KÊ QUỸ TIỀN MẶT</div>
                    <div>Thời điểm kiểm kê: ${new Date(record.date).toLocaleString('vi-VN')}</div>
                </div>
                <table>
                    <thead><tr><th>Mệnh giá (VND)</th><th>Số lượng</th><th>Thành tiền</th></tr></thead>
                    <tbody>${denominationRows}</tbody>
                </table>
                <div style="margin-top: 20px; border-top: 2px solid #333; padding-top: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Tổng số tiền thực tế:</span><span class="bold">${record.actualBalance.toLocaleString('vi-VN')} VND</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Số dư theo sổ sách:</span><span class="bold">${record.systemBalance.toLocaleString('vi-VN')} VND</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Chênh lệch:</span><span class="bold" style="color: ${record.difference !== 0 ? 'red' : 'green'}">${record.difference.toLocaleString('vi-VN')} VND</span>
                    </div>
                </div>
            </body></html>`;
        }

        const newWindow = window.open('', '', 'height=600,width=800');
        newWindow?.document.write(printContent);
        newWindow?.document.close();
        newWindow?.focus();
        setTimeout(() => {
                newWindow?.print();
                newWindow?.close();
        }, 250);
    };

    // Modal UI remains largely the same, just triggering the new print logic
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-0 rounded-xl shadow-xl w-full max-w-3xl flex flex-col h-[90vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600 rounded-t-xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Chi tiết Phiếu kiểm kê</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900 flex justify-center">
                    <div className="bg-white shadow-lg p-8 w-full max-w-[210mm]">
                        {/* Preview Display - simplified version of the print layout for screen */}
                        <div className="text-center mb-6">
                            <div className="font-bold text-lg uppercase">{companyInfo.name}</div>
                            <div className="text-sm">{companyInfo.address}</div>
                            <h2 className="text-2xl font-bold uppercase mt-4 text-gray-800">Biên bản kiểm kê quỹ</h2>
                            <p className="text-gray-600">Ngày: {new Date(record.date).toLocaleString('vi-VN')}</p>
                        </div>

                        <table className="w-full border-collapse mb-6 text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border p-2 text-right">Mệnh giá</th>
                                    <th className="border p-2 text-center">Số lượng</th>
                                    <th className="border p-2 text-right">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_DENOMINATIONS.map(denom => {
                                    const count = record.counts[denom] || 0;
                                    if (count === 0) return null;
                                    return (
                                        <tr key={denom}>
                                            <td className="border p-2 text-right font-medium">{denom.toLocaleString('vi-VN')}</td>
                                            <td className="border p-2 text-center">{count}</td>
                                            <td className="border p-2 text-right">{(count * denom).toLocaleString('vi-VN')}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="border-t-2 border-gray-800 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Tổng thực tế:</span>
                                <span className="font-bold">{record.actualBalance.toLocaleString('vi-VN')} đ</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Sổ sách:</span>
                                <span className="font-bold">{record.systemBalance.toLocaleString('vi-VN')} đ</span>
                            </div>
                            <div className="flex justify-between text-base">
                                <span>Chênh lệch:</span>
                                <span className={`font-bold ${record.difference !== 0 ? 'text-red-600' : 'text-green-600'}`}>{record.difference.toLocaleString('vi-VN')} đ</span>
                            </div>
                        </div>
                        
                        {record.note && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded text-sm">
                                <strong>Ghi chú:</strong> {record.note}
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 font-semibold transition">Đóng</button>
                    <button onClick={handlePrint} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold flex items-center gap-2 transition shadow-sm">
                        <PrinterIcon className="w-4 h-4" /> In phiếu
                    </button>
                </div>
            </div>
        </div>
    );
};

const CashCountPage: React.FC = () => {
    const { openingCashBalance, cashTransactions, addCashCount, currentUser, cashCounts } = useData();
    const [counts, setCounts] = useState<Record<number, number>>({});
    const [note, setNote] = useState('');
    const [viewingRecord, setViewingRecord] = useState<CashCountRecord | null>(null);

    // Calculate System Balance
    const systemBalance = useMemo(() => {
        const totalReceipts = cashTransactions
            .filter(tx => tx.type === CashTransactionType.Receipt)
            .reduce((sum, tx) => sum + tx.amount, 0);
        const totalPayments = cashTransactions
            .filter(tx => tx.type === CashTransactionType.Payment)
            .reduce((sum, tx) => sum + tx.amount, 0);
        return openingCashBalance + totalReceipts - totalPayments;
    }, [cashTransactions, openingCashBalance]);

    const handleCountChange = (denomination: number, count: number) => {
        setCounts(prev => ({ ...prev, [denomination]: count }));
    };

    const totalActual = useMemo(() => {
        return MOCK_DENOMINATIONS.reduce((sum, denom) => sum + (denom * (counts[denom] || 0)), 0);
    }, [counts]);

    const difference = totalActual - systemBalance;

    const handleSave = () => {
        if (!currentUser) {
            alert("Vui lòng đăng nhập để thực hiện.");
            return;
        }
        
        const record: Omit<CashCountRecord, 'id'> = {
            date: new Date(),
            systemBalance,
            actualBalance: totalActual,
            difference,
            counts: { ...counts },
            note,
            performedByUserId: currentUser.id
        };
        
        addCashCount(record);
        alert("Đã lưu kết quả kiểm kê thành công!");
        
        // Reset form
        setCounts({});
        setNote('');
    };

    return (
        <>
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kiểm kê tiền mặt</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-bold">Số dư trên sổ sách</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{systemBalance.toLocaleString('vi-VN')} đ</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-bold">Thực tế kiểm kê</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{totalActual.toLocaleString('vi-VN')} đ</p>
                </div>
                <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${difference !== 0 ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                    <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-bold">Chênh lệch</p>
                    <p className={`text-2xl font-bold mt-2 ${difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {difference > 0 ? '+' : ''}{difference.toLocaleString('vi-VN')} đ
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">Chi tiết mệnh giá</h2>
                    <div className="space-y-3">
                        {MOCK_DENOMINATIONS.map(denom => (
                            <div key={denom} className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32">
                                    {denom.toLocaleString('vi-VN')}
                                </label>
                                <div className="flex items-center gap-4 flex-1 justify-end">
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={counts[denom] === 0 ? '' : counts[denom]}
                                        onChange={e => handleCountChange(denom, parseInt(e.target.value) || 0)}
                                        className="w-24 p-1.5 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-right text-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="w-32 text-right font-medium text-gray-900 dark:text-gray-100">
                                        {((counts[denom] || 0) * denom).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                        ))}
                        
                        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600 dark:text-gray-400">Tổng thực tế:</span>
                                <span className="font-bold text-lg text-blue-600">{totalActual.toLocaleString('vi-VN')} đ</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Chênh lệch:</span>
                                <span className={`font-bold ${difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {difference > 0 ? '+' : ''}{difference.toLocaleString('vi-VN')} đ
                                </span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ghi chú / Giải trình</label>
                            <textarea 
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
                                rows={3}
                                placeholder="Nhập ghi chú nếu có chênh lệch..."
                            ></textarea>
                        </div>
                    </div>
                    <div className="mt-6">
                        <button onClick={handleSave} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm">
                            Lưu kết quả kiểm kê
                        </button>
                    </div>
                </div>

                {/* History Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Lịch sử kiểm kê</h2>
                    <div className="overflow-y-auto flex-1 max-h-[600px]">
                        {cashCounts.length > 0 ? (
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-300">Ngày</th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-300">Thực tế</th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-300">Chênh lệch</th>
                                        <th className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-300">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {cashCounts.map(record => (
                                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                                                <div>{new Date(record.date).toLocaleDateString('vi-VN')}</div>
                                                <div className="text-xs text-gray-500">{new Date(record.date).toLocaleTimeString('vi-VN')}</div>
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium">{record.actualBalance.toLocaleString('vi-VN')}</td>
                                            <td className={`px-3 py-2 text-right font-bold ${record.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {record.difference.toLocaleString('vi-VN')}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <button onClick={() => setViewingRecord(record)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition" title="In phiếu">
                                                    <PrinterIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center text-gray-500 py-10">Chưa có lịch sử kiểm kê.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
        {viewingRecord && (
            <CashCountDetailModal record={viewingRecord} onClose={() => setViewingRecord(null)} />
        )}
        </>
    );
};

export default CashCountPage;
