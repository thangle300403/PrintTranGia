
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { BankTransaction, BankTransactionType, BankAccount } from '../../types';
import { BankTransactionModal } from '../../components/accounting/BankTransactionModal';
import { RefreshIcon, BoxIcon, SearchIcon } from '../../components/icons/Icons';
import { Toast } from '../../components/Toast';

const BankConnectionCard: React.FC<{ 
    account: BankAccount; 
    onSync: () => void; 
    isSyncing: boolean;
}> = ({ account, onSync, isSyncing }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-lg">
                    {account.bankName.substring(0, 3).toUpperCase()}
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{account.bankName}</h4>
                    <p className="text-xs text-gray-500 font-mono">{account.accountNumber}</p>
                </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 uppercase">Live Sync</span>
        </div>
        <div className="my-4">
            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Số dư</p>
            <p className="text-2xl font-black text-gray-800 dark:text-white">
                {(account.openingBalance || 0).toLocaleString('vi-VN')} <span className="text-sm font-normal">đ</span>
            </p>
        </div>
        <button onClick={onSync} disabled={isSyncing} className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold disabled:bg-gray-300">
            <RefreshIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ sao kê'}
        </button>
    </div>
);

const BankFlowPage: React.FC = () => {
    const { bankTransactions, companyInfo } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<BankTransactionType>(BankTransactionType.Receipt);
    const [isSyncing, setIsSyncing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState('');

    const filteredTx = useMemo(() => {
        return bankTransactions.filter((tx) => 
            !searchTerm || tx.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
            tx.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.subject.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [bankTransactions, searchTerm]);

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setToast('Đồng bộ hoàn tất. Hệ thống đã khớp 1 giao dịch mới.');
            setIsSyncing(false);
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <h1 className="text-3xl font-black">Tài chính & Ngân hàng</h1>
                <div className="flex gap-3">
                    <button onClick={() => { setModalType(BankTransactionType.Payment); setIsModalOpen(true); }} className="px-4 py-2 border rounded-lg font-bold bg-white hover:bg-gray-50">- Tạo UNC</button>
                    <button onClick={() => { setModalType(BankTransactionType.Receipt); setIsModalOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition transform active:scale-95">+ Báo Có</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {companyInfo.bankAccounts.map((acc) => (
                    <BankConnectionCard key={acc.id} account={acc} onSync={handleSync} isSyncing={isSyncing} />
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border flex flex-col overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center gap-6">
                    <h3 className="font-bold text-lg flex items-center gap-3"><BoxIcon className="w-6 h-6 text-blue-600" /> Biến động số dư</h3>
                    <div className="relative w-72">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon className="w-4 h-4"/></span>
                        <input type="text" placeholder="Tìm giao dịch..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">Thời gian</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">Chứng từ</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">Nội dung</th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase text-gray-500">Số tiền</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredTx.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm">
                                        <div className="font-bold">{new Date(tx.date).toLocaleDateString('vi-VN')}</div>
                                        <div className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleTimeString('vi-VN')}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-blue-600">{tx.id}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <p className="font-bold text-gray-800">{tx.subject}</p>
                                        <p className="text-xs text-gray-500 italic">{tx.reason}</p>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-black ${tx.type === BankTransactionType.Receipt ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {tx.type === BankTransactionType.Receipt ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <BankTransactionModal type={modalType} onClose={() => setIsModalOpen(false)} />}
            {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </div>
    );
};

export default BankFlowPage;
