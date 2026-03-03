
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { BankTransactionType, BankTransaction } from '../../types';
import FormattedNumberInput from '../FormattedNumberInput';
import { BankIcon, CloseIcon, CheckCircleIcon, PrinterIcon, LinkIcon, SearchIcon, CalculatorIcon } from '../icons/Icons';

interface BankTransactionModalProps {
    type: BankTransactionType;
    onClose: () => void;
    transactionToEdit?: BankTransaction;
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

export const BankTransactionModal: React.FC<BankTransactionModalProps> = ({ type, onClose, transactionToEdit }) => {
    const { addBankTransaction, companyInfo, currentUser, customers, suppliers, printTemplates } = useData();
    const [formData, setFormData] = useState({
        amount: 0 as number | '',
        bankAccountId: companyInfo.bankAccounts[0]?.id || '',
        subject: '',
        receiverName: '',
        receiverBankAccount: '',
        receiverBankName: '',
        reason: '', 
        internalNote: '', 
        referenceDoc: ''
    });
    const [error, setError] = useState('');

    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const title = type === BankTransactionType.Receipt ? 'Báo Có (Thu tiền gửi)' : 'Ủy Nhiệm Chi (Chi tiền gửi)';
    
    const subjectLabel = 'Đơn vị giao dịch (Khách hàng/NCC)';
    
    useEffect(() => {
        if (transactionToEdit) {
            setFormData({
                amount: transactionToEdit.amount,
                bankAccountId: transactionToEdit.bankAccountId,
                subject: transactionToEdit.subject,
                receiverName: transactionToEdit.receiverName || '',
                receiverBankAccount: transactionToEdit.receiverBankAccount || '',
                receiverBankName: transactionToEdit.receiverBankName || '',
                reason: transactionToEdit.reason,
                internalNote: transactionToEdit.internalNote || '',
                referenceDoc: transactionToEdit.referenceDoc || '',
            });
        }
    }, [transactionToEdit]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const suggestions = useMemo(() => {
        const searchTerm = formData.subject.toLowerCase();
        if (!searchTerm) return [];

        const custs = customers
            .filter(c => c.name.toLowerCase().includes(searchTerm) || c.phone.includes(searchTerm) || c.id.toLowerCase().includes(searchTerm))
            .map(c => ({
                id: c.id,
                name: c.name,
                type: 'KH',
                contact: c.name, 
                address: c.address ? `${c.address.street}, ${c.address.ward}, ${c.address.district}, ${c.address.province}` : '',
                bankAccount: '',
                bankName: ''
            }));
        
        const sups = suppliers
            .filter(s => s.name.toLowerCase().includes(searchTerm) || s.phone.includes(searchTerm) || s.id.toLowerCase().includes(searchTerm))
            .map(s => ({
                id: s.id,
                name: s.name,
                type: 'NCC',
                contact: s.contactPerson || s.name,
                address: s.address || '',
                bankAccount: s.bankAccounts && s.bankAccounts.length > 0 ? s.bankAccounts[0].accountNumber : '',
                bankName: s.bankAccounts && s.bankAccounts.length > 0 ? s.bankAccounts[0].bankName : ''
            }));

        return [...custs, ...sups].slice(0, 5);
    }, [formData.subject, customers, suppliers]);

    const handleSelectSubject = (item: any) => {
        setFormData(prev => ({
            ...prev,
            subject: item.name,
            receiverName: item.contact,
            receiverBankAccount: item.bankAccount || prev.receiverBankAccount,
            receiverBankName: item.bankName || prev.receiverBankName,
        }));
        setShowSuggestions(false);
    };


    const handleSubmit = (shouldPrint: boolean = false) => {
        const numericAmount = Number(formData.amount);
        if (!numericAmount || numericAmount <= 0) {
            setError('Số tiền phải lớn hơn 0.');
            return;
        }
        if (!formData.subject.trim() || !formData.reason.trim()) {
            setError('Vui lòng điền đầy đủ thông tin đối tượng và nội dung.');
            return;
        }
        if (!formData.bankAccountId) {
            setError('Vui lòng chọn tài khoản ngân hàng.');
            return;
        }

        const newTransaction = addBankTransaction({
            type,
            amount: numericAmount,
            subject: formData.subject,
            reason: formData.reason,
            internalNote: formData.internalNote,
            bankAccountId: formData.bankAccountId,
            receiverName: formData.receiverName,
            receiverBankAccount: formData.receiverBankAccount,
            receiverBankName: formData.receiverBankName,
            referenceDoc: formData.referenceDoc,
        });

        if (shouldPrint) {
             const bankAccount = companyInfo.bankAccounts.find(b => b.id === formData.bankAccountId);
             handlePrint(newTransaction, bankAccount);
        }
        onClose();
    };
    
    const handlePrint = (data: BankTransaction, bankAccount: any) => {
        const template = printTemplates.find(t => t.type === 'BankTransaction' && t.isActive);
        if (template) {
            let html = template.content;
            const printReason = data.internalNote || data.reason;
            let qrCodeHtml = '';
            
             const replacements: Record<string, string> = {
                '{bankName}': bankAccount?.bankName || 'Ngân hàng',
                '{title}': type === BankTransactionType.Payment ? 'ỦY NHIỆM CHI' : 'GIẤY BÁO CÓ',
                '{day}': new Date(data.date).getDate().toString(),
                '{month}': (new Date(data.date).getMonth() + 1).toString(),
                '{year}': new Date(data.date).getFullYear().toString(),
                '{payerName}': type === BankTransactionType.Payment ? companyInfo.name : data.subject,
                '{payerAccount}': type === BankTransactionType.Payment ? (bankAccount?.accountNumber || '') : (data.receiverBankAccount || ''),
                '{payerBank}': type === BankTransactionType.Payment ? (bankAccount?.bankName || '') : (data.receiverBankName || ''),
                '{payeeName}': type === BankTransactionType.Payment ? (data.receiverName || data.subject) : companyInfo.name,
                '{payeeAccount}': type === BankTransactionType.Payment ? (data.receiverBankAccount || '') : (bankAccount?.accountNumber || ''),
                '{payeeBank}': type === BankTransactionType.Payment ? (data.receiverBankName || '') : (bankAccount?.bankName || ''),
                '{amount}': data.amount.toLocaleString('vi-VN'),
                '{amountInWords}': readMoney(data.amount),
                '{reason}': printReason,
                '{qrCodeImage}': qrCodeHtml,
            };

             Object.entries(replacements).forEach(([key, value]) => {
                html = html.split(key).join(value);
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
        }
    }

    const inputClass = "w-full p-3 border rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm";
    const labelClass = "block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5";

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 p-0 rounded-3xl shadow-2xl w-full max-w-4xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[95vh] overflow-hidden transform transition-all">
                <div className="flex justify-between items-center px-8 py-5 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-4">
                         <div className={`p-3 rounded-2xl ${type === BankTransactionType.Receipt ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            <BankIcon className="w-7 h-7"/>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-none">{title}</h3>
                            <p className="text-xs text-gray-500 mt-1 font-medium">{transactionToEdit ? `Chi tiết giao dịch: ${transactionToEdit.id}` : 'Nhập thông tin giao dịch mới'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-full"><CloseIcon className="w-7 h-7"/></button>
                </div>
                
                <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-white dark:bg-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="md:col-span-2 bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className={labelClass}>Số tiền giao dịch (VND) <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <FormattedNumberInput
                                            value={formData.amount}
                                            onChange={val => setFormData(prev => ({ ...prev, amount: val }))}
                                            className={`${inputClass} text-2xl font-black text-blue-700 dark:text-blue-400 pr-12`}
                                            placeholder="0"
                                            autoFocus
                                            required
                                            readOnly={!!transactionToEdit}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300"><CalculatorIcon className="w-6 h-6"/></div>
                                    </div>
                                    {Number(formData.amount) > 0 && <p className="text-[11px] text-blue-600 dark:text-blue-300 mt-2.5 font-bold italic">Bằng chữ: {readMoney(Number(formData.amount))}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Tài khoản ngân hàng thụ hưởng <span className="text-rose-500">*</span></label>
                                    <select
                                        value={formData.bankAccountId}
                                        onChange={e => setFormData(prev => ({ ...prev, bankAccountId: e.target.value }))}
                                        className={`${inputClass} h-[52px] font-bold`}
                                        required
                                        disabled={!!transactionToEdit}
                                    >
                                        {companyInfo.bankAccounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumber}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="relative" ref={wrapperRef}>
                            <label className={labelClass}>{subjectLabel} <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon className="w-4 h-4"/></span>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={e => {
                                        setFormData(prev => ({ ...prev, subject: e.target.value }));
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    className={`${inputClass} pl-11`}
                                    placeholder="Tìm theo tên hoặc mã KH/NCC..."
                                    required
                                    autoComplete="off"
                                    readOnly={!!transactionToEdit}
                                />
                            </div>
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-20 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-h-64 overflow-y-auto mt-2 overflow-hidden">
                                    {suggestions.map((item, index) => (
                                        <div 
                                            key={`${item.id}_${index}`}
                                            className="px-5 py-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700/50 text-sm border-b last:border-0 dark:border-gray-700 transition-colors"
                                            onClick={() => handleSelectSubject(item)}
                                        >
                                            <div className="font-black text-gray-900 dark:text-white flex justify-between items-center">
                                                <span>{item.name}</span>
                                                <span className="text-[9px] bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{item.type}</span>
                                            </div>
                                            <div className="text-[11px] text-blue-600 font-bold font-mono mt-1">{item.id}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                         <div>
                            <label className={labelClass}>Mã đơn hàng khớp lệnh (Gạch nợ)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.referenceDoc}
                                    onChange={e => setFormData(prev => ({ ...prev, referenceDoc: e.target.value.toUpperCase() }))}
                                    className={`${inputClass} pl-11 font-black text-blue-600 bg-gray-50/50`}
                                    placeholder="VD: DH00123"
                                    readOnly={!!transactionToEdit}
                                />
                                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1.5 font-medium italic">* Nhập đúng mã đơn để hệ thống tự động cập nhật trạng thái thanh toán.</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>Nội dung giao dịch (Theo sao kê ngân hàng) <span className="text-rose-500">*</span></label>
                             <input
                                value={formData.reason}
                                onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                className={`${inputClass} font-mono font-medium`}
                                placeholder="VD: NGUYEN VAN A THANH TOAN DON HANG DH00123..."
                                required
                                readOnly={!!transactionToEdit}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Ghi chú nội bộ cho kế toán</label>
                            <textarea
                                value={formData.internalNote || ''}
                                onChange={e => setFormData(prev => ({ ...prev, internalNote: e.target.value }))}
                                className={`${inputClass} min-h-[80px] resize-none`}
                                placeholder="Nhập thêm chi tiết nếu cần đối soát..."
                                readOnly={!!transactionToEdit}
                            />
                        </div>
                    </div>
                    {error && <p className="text-rose-500 text-sm bg-rose-50 p-4 rounded-xl border border-rose-100 font-bold">{error}</p>}
                </div>

                 <div className="px-8 py-5 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3 rounded-b-3xl">
                    <button type="button" onClick={onClose} className="px-8 py-3 text-sm font-black rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 transition-all uppercase tracking-wider">Đóng</button>
                    {!transactionToEdit && (
                        <button type="button" onClick={() => handleSubmit(false)} className="px-10 py-3 text-sm font-black text-white bg-blue-600 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 dark:shadow-none transition-all transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider">
                            <CheckCircleIcon className="w-5 h-5"/> Lưu giao dịch
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
