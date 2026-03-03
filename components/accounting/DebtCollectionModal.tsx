import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Customer, PaymentMethod } from '../../types';
import FormattedNumberInput from '../FormattedNumberInput';
import DatePicker from '../DatePicker';
import { CloseIcon, CalculatorIcon, ClockIcon } from '../icons/Icons';
import CustomSelect from '../CustomSelect';

interface DebtCollectionModalProps {
    customer: Customer;
    onClose: () => void;
}

const readMoney = (amount: number): string => {
    if (amount === 0) return "Không đồng";
    const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
    let s = "";
    let groups = [];
    let temp = Math.abs(Math.round(amount));
    while (temp > 0) { groups.push(temp % 1000); temp = Math.floor(temp / 1000); }
    for (let i = groups.length - 1; i >= 0; i--) {
        const g = groups[i];
        const isHighest = i === groups.length - 1;
        if (g === 0) continue;
        const readZeroHundred = !isHighest;
        let res = "";
        const h = Math.floor(g / 100);
        const t = Math.floor((g % 100) / 10);
        const o = g % 10;
        if (h > 0 || readZeroHundred) { res += digits[h] + " trăm "; }
        if (t === 0 && o > 0 && (h > 0 || readZeroHundred)) { res += "lẻ "; } else if (t === 1) { res += "mười "; } else if (t > 1) { res += digits[t] + " mươi "; }
        if (t > 0 && o === 1 && t !== 1) { res += "mốt"; } else if (t > 0 && o === 5) { res += "lăm"; } else if (o > 0) { res += digits[o]; }
        res = res.trim();
        if (res) { s += res + " " + units[i] + " "; }
    }
    s = s.trim();
    if (!s) return "Không đồng";
    return s.charAt(0).toUpperCase() + s.slice(1) + " đồng chẵn";
};

export const DebtCollectionModal: React.FC<DebtCollectionModalProps> = ({ customer, onClose }) => {
    const { collectCustomerDebt, companyInfo, invoices, printTemplates } = useData();
    const currentTotalDebt = customer.creditBalance || 0;

    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
    const [bankAccountId, setBankAccountId] = useState<string>(companyInfo.bankAccounts[0]?.id || '');
    const [totalReceiveAmount, setTotalReceiveAmount] = useState<number | ''>(currentTotalDebt > 0 ? currentTotalDebt : '');
    const [description, setDescription] = useState(`Thu nợ khách hàng ${customer.name}`);
    const [referenceDoc, setReferenceDoc] = useState('');
    const [isPrintReceipt, setIsPrintReceipt] = useState(false);
    
    // State for invoice selection
    const [selectedInvoices, setSelectedInvoices] = useState<Record<string, number>>({});

    const methodOptions = [
        { value: PaymentMethod.Cash, label: 'Tiền mặt' },
        { value: PaymentMethod.BankTransfer, label: 'Chuyển khoản' }
    ];

    const bankAccountOptions = useMemo(() => companyInfo.bankAccounts.map(acc => ({
        value: acc.id,
        label: `${acc.bankName} - ${acc.accountNumber}`
    })), [companyInfo.bankAccounts]);

    const debtHistory = useMemo(() => {
        return invoices
            .filter(inv => inv.customer.id === customer.id)
            .flatMap(inv => inv.payments.filter(p => p.method === PaymentMethod.CreditDebt).map(p => ({
                invoiceId: inv.id,
                date: p.date,
                amount: p.amount,
                orderId: inv.orderId
            })))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [invoices, customer.id]);

    const handleSelectInvoice = (invoiceId: string, amount: number) => {
        setSelectedInvoices(prev => {
            const newSelection = { ...prev };
            if (newSelection[invoiceId]) {
                delete newSelection[invoiceId];
            } else {
                newSelection[invoiceId] = amount;
            }
            return newSelection;
        });
    };

    useEffect(() => {
        const selectedIds = Object.keys(selectedInvoices);
        if (selectedIds.length > 0) {
            const totalSelectedAmount = Object.values(selectedInvoices).reduce((sum: number, amount: number) => sum + amount, 0);
            setTotalReceiveAmount(totalSelectedAmount);
            setReferenceDoc(selectedIds.join(', '));
        } else {
            // Revert to default when no selection
            setTotalReceiveAmount(currentTotalDebt > 0 ? currentTotalDebt : '');
            setReferenceDoc('');
        }
    }, [selectedInvoices, currentTotalDebt]);

    const handlePrint = () => {
        const template = printTemplates.find(t => t.type === 'CashReceipt' && t.isActive);
        
        if (template) {
            let html = template.content;
            const amount = Number(totalReceiveAmount) || 0;
            const dateObj = new Date(paymentDate);

            const replacements: Record<string, string> = {
                '{companyName}': companyInfo.name,
                '{companyAddress}': companyInfo.address,
                '{companyPhone}': companyInfo.phone,
                '{id}': 'Tự động',
                '{day}': dateObj.getDate().toString(),
                '{month}': (dateObj.getMonth() + 1).toString(),
                '{year}': dateObj.getFullYear().toString(),
                '{payerName}': customer.name,
                '{customerName}': customer.company?.name || customer.name,
                '{address}': customer.address ? `${customer.address.street}, ${customer.address.district}, ${customer.address.province}` : '',
                '{reason}': description,
                '{amount}': amount.toLocaleString('vi-VN'),
                '{amountInWords}': readMoney(amount),
                '{referenceDoc}': referenceDoc
            };

            Object.entries(replacements).forEach(([key, value]) => {
                html = html.split(key).join(value || '');
            });

            const newWindow = window.open('', '', 'height=600,width=800');
            if (newWindow) {
                newWindow.document.write(html);
                newWindow.document.close();
                newWindow.focus();
                setTimeout(() => {
                    newWindow.print();
                    newWindow.close();
                }, 250);
            }
        } else {
            alert("Chưa cấu hình mẫu in Phiếu thu (CashReceipt). Vui lòng kiểm tra cài đặt.");
        }
    };

    const handleSubmit = () => {
        const numericTotal = Number(totalReceiveAmount) || 0;
        if (numericTotal <= 0) {
            alert('Vui lòng nhập số tiền thu lớn hơn 0.');
            return;
        }
        
        const isSelectingInvoices = Object.keys(selectedInvoices).length > 0;
        
        if (!isSelectingInvoices && numericTotal > currentTotalDebt) {
             if (!confirm(`Số tiền thu (${numericTotal.toLocaleString('vi-VN')}) lớn hơn tổng nợ (${currentTotalDebt.toLocaleString('vi-VN')}). Bạn có chắc chắn muốn tiếp tục không?`)) {
                 return;
             }
        }
        if (method === PaymentMethod.BankTransfer && !bankAccountId) {
            alert('Vui lòng chọn tài khoản ngân hàng.');
            return;
        }

        const allocations = isSelectingInvoices ? selectedInvoices : undefined;

        collectCustomerDebt(
            customer.id,
            numericTotal,
            method,
            method === PaymentMethod.BankTransfer ? bankAccountId : undefined,
            allocations,
            { description, referenceDoc }
        );

        if (isPrintReceipt) {
            handlePrint();
        }
        onClose();
    };

    const isSelectionMode = Object.keys(selectedInvoices).length > 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[70] p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Thu nợ khách hàng</h3>
                        <p className="text-blue-600 font-semibold text-sm mt-1">{customer.name} - {customer.id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-1 rounded-full"><CloseIcon className="w-6 h-6"/></button>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Left Column: Payment Input */}
                    <div className="w-full lg:w-1/2 flex-shrink-0 p-6 border-r dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
                        <div className="space-y-5">
                            <div className="bg-gradient-to-br from-red-500 to-red-700 p-6 rounded-xl text-white shadow-lg text-center mb-6">
                                <p className="text-sm font-medium uppercase tracking-wider opacity-80">Tổng nợ hiện tại</p>
                                <p className="text-4xl font-extrabold mt-2">{currentTotalDebt.toLocaleString('vi-VN')} <span className="text-2xl opacity-80">đ</span></p>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Số tiền thu</label>
                                    {!isSelectionMode && (
                                        <button type="button" onClick={() => setTotalReceiveAmount(currentTotalDebt)} className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                                            Thu hết
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <FormattedNumberInput 
                                        value={totalReceiveAmount} 
                                        onChange={setTotalReceiveAmount} 
                                        className="w-full text-center pl-4 pr-10 py-3 border-2 border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-2xl font-bold text-blue-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" 
                                        autoFocus 
                                        placeholder="0"
                                        disabled={isSelectionMode}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><CalculatorIcon className="w-6 h-6" /></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Số tiền này sẽ được trừ trực tiếp vào dư nợ của khách hàng.</p>
                            </div>
                            <hr className="border-gray-200 dark:border-gray-700 border-dashed" />
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày thu</label><DatePicker value={paymentDate} onChange={setPaymentDate} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:bg-white" /></div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phương thức</label>
                                    <CustomSelect 
                                        options={methodOptions} 
                                        value={method} 
                                        onChange={val => setMethod(val as PaymentMethod)} 
                                        className="w-full" 
                                    />
                                </div>
                            </div>
                            {method === PaymentMethod.BankTransfer && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tài khoản nhận</label>
                                    <CustomSelect 
                                        options={bankAccountOptions} 
                                        value={bankAccountId} 
                                        onChange={val => setBankAccountId(val as string)} 
                                        className="w-full shadow-sm" 
                                    />
                                </div>
                            )}
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nội dung phiếu thu</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:bg-white border-gray-300 dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500" rows={3}></textarea></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chứng từ gốc (Tham chiếu)</label><input type="text" value={referenceDoc} onChange={e => setReferenceDoc(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:bg-white border-gray-300 dark:border-gray-600 text-sm" placeholder="VD: UNC123, Bill-001..." /></div>
                        </div>
                    </div>

                    {/* Right Column: History */}
                    <div className="w-full lg:w-1/2 flex flex-col bg-gray-50 dark:bg-gray-900/50 h-full overflow-hidden">
                        <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-2 shadow-sm z-10">
                             <ClockIcon className="w-5 h-5 text-gray-500"/>
                             <h4 className="font-bold text-gray-800 dark:text-white">Lịch sử ghi nợ gần đây</h4>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 w-12 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Chọn</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Ngày ghi</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Mã Hóa đơn</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Số tiền ghi nợ</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700">
                                    {debtHistory.map((record, index) => (
                                        <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${selectedInvoices[record.invoiceId] ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`} onClick={() => handleSelectInvoice(record.invoiceId, record.amount)}>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={!!selectedInvoices[record.invoiceId]}
                                                    onChange={() => {}} // Controlled by row click
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{new Date(record.date).toLocaleDateString('vi-VN')}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                                                {record.invoiceId}
                                                {record.orderId && <span className="text-xs text-gray-400 ml-1">({record.orderId})</span>}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800 dark:text-gray-200">
                                                {record.amount.toLocaleString('vi-VN')} đ
                                            </td>
                                        </tr>
                                    ))}
                                    {debtHistory.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                                Chưa có lịch sử ghi nợ.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-between items-center z-20">
                    <div className="flex items-center">
                        <label className="flex items-center cursor-pointer select-none group">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5 transition" checked={isPrintReceipt} onChange={(e) => setIsPrintReceipt(e.target.checked)} />
                            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600">In phiếu thu ngay</span>
                        </label>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-200 shadow-sm">Đóng</button>
                        <button type="button" onClick={handleSubmit} disabled={Number(totalReceiveAmount) <= 0} className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            Xác nhận Thu ({(Number(totalReceiveAmount) || 0).toLocaleString('vi-VN')}đ)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
