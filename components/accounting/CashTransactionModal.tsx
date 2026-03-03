
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { CashTransactionType, CashTransaction } from '../../types';
import FormattedNumberInput from '../FormattedNumberInput';
import { PrinterIcon, CloseIcon, CashFundIcon, CheckCircleIcon } from '../icons/Icons';

interface CashTransactionModalProps {
    type: CashTransactionType;
    onClose: () => void;
    transactionToEdit?: CashTransaction;
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

const getTypeClass = (type: CashTransactionType) => {
    return type === CashTransactionType.Receipt
        ? 'bg-green-100 text-green-600'
        : 'bg-red-100 text-red-600';
};

export const CashTransactionModal: React.FC<CashTransactionModalProps> = ({ type, onClose, transactionToEdit }) => {
    const { addCashTransaction, companyInfo, currentUser, customers, suppliers, printTemplates } = useData();
    const [formData, setFormData] = useState({
        amount: 0 as number | '',
        subject: '', // Object (Company)
        receiverName: '', // Specific Person
        address: '',
        reason: '',
        referenceDoc: '',
    });
    const [error, setError] = useState('');
    
    // Autocomplete state
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const title = type === CashTransactionType.Receipt ? 'Phiếu Thu Tiền Mặt' : 'Phiếu Chi Tiền Mặt';
    const subjectLabel = type === CashTransactionType.Receipt ? 'Đơn vị nộp tiền' : 'Đơn vị nhận tiền';
    const receiverLabel = type === CashTransactionType.Receipt ? 'Người nộp tiền' : 'Người nhận tiền';

    useEffect(() => {
        if (transactionToEdit) {
            setFormData({
                amount: transactionToEdit.amount,
                subject: transactionToEdit.subject,
                receiverName: transactionToEdit.receiverName || '',
                address: transactionToEdit.address || '',
                reason: transactionToEdit.reason,
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

    // Combine customers and suppliers for suggestion
    const suggestions = useMemo(() => {
        const searchTerm = formData.subject.toLowerCase();
        if (!searchTerm) return [];

        const custs = customers
            .filter(c => c.name.toLowerCase().includes(searchTerm) || c.phone.includes(searchTerm) || c.id.toLowerCase().includes(searchTerm))
            .map(c => ({
                id: c.id,
                name: c.name,
                type: 'KH',
                contact: c.name, // Customer is usually the contact themselves
                address: c.address ? `${c.address.street}, ${c.address.ward}, ${c.address.district}, ${c.address.province}` : ''
            }));
        
        const sups = suppliers
            .filter(s => s.name.toLowerCase().includes(searchTerm) || s.phone.includes(searchTerm) || s.id.toLowerCase().includes(searchTerm))
            .map(s => ({
                id: s.id,
                name: s.name,
                type: 'NCC',
                contact: s.contactPerson || s.name,
                address: s.address || ''
            }));

        return [...custs, ...sups].slice(0, 5);
    }, [formData.subject, customers, suppliers]);

    const handleSelectSubject = (item: any) => {
        setFormData(prev => ({
            ...prev,
            subject: item.name,
            receiverName: item.contact,
            address: item.address
        }));
        setShowSuggestions(false);
    };

    const handleSave = (shouldPrint: boolean = false) => {
        const numericAmount = Number(formData.amount);
        if (numericAmount === 0 || numericAmount < 0) {
            setError('Số tiền phải lớn hơn 0.');
            return;
        }
        if (!formData.subject.trim() || !formData.reason.trim()) {
            setError('Vui lòng điền đầy đủ thông tin đơn vị và lý do.');
            return;
        }

        const newTransactionData = {
            type,
            amount: numericAmount,
            subject: formData.subject,
            receiverName: formData.receiverName,
            address: formData.address,
            reason: formData.reason,
            referenceDoc: formData.referenceDoc,
        };

        const newTransaction = addCashTransaction(newTransactionData);
        
        if (shouldPrint) {
            handlePrint(newTransaction);
        }

        onClose();
    };

    const handlePrint = (data: CashTransaction) => {
        const template = printTemplates.find(t => t.type === 'CashTransaction' && t.isActive);
        if (template) {
            let html = template.content;
             const replacements: Record<string, string> = {
                '{companyName}': companyInfo.name,
                '{companyAddress}': companyInfo.address,
                '{id}': data.id,
                '{day}': new Date(data.date).getDate().toString(),
                '{month}': (new Date(data.date).getMonth() + 1).toString(),
                '{year}': new Date(data.date).getFullYear().toString(),
                '{title}': type === CashTransactionType.Receipt ? 'PHIẾU THU' : 'PHIẾU CHI',
                '{actionType}': type === CashTransactionType.Receipt ? 'nộp' : 'nhận',
                '{receiverName}': data.receiverName || '',
                '{subject}': data.subject,
                '{address}': data.address || '',
                '{reason}': data.reason,
                '{amount}': data.amount.toLocaleString('vi-VN'),
                '{amountInWords}': readMoney(data.amount),
                '{referenceDoc}': data.referenceDoc ? `(${data.referenceDoc})` : '',
                '{formNumber}': type === CashTransactionType.Receipt ? '01' : '02'
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
            // Fallback to default HTML if no template
            const printContent = `
                <html><head><title>${title}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; font-size: 13px; margin: 0; padding: 20px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .company-info { font-size: 11px; }
                    .company-name { font-weight: bold; font-size: 13px; text-transform: uppercase; }
                    .voucher-title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
                    .voucher-date { text-align: center; font-style: italic; margin-bottom: 20px; }
                    .content-row { margin-bottom: 10px; }
                    .label { min-width: 120px; display: inline-block; }
                    .value { font-weight: bold; }
                    .money-text { font-style: italic; }
                    .signatures { display: flex; justify-content: space-between; margin-top: 40px; text-align: center; }
                    .sig-block { width: 20%; }
                    .sig-title { font-weight: bold; font-size: 12px; }
                    .sig-note { font-style: italic; font-size: 11px; margin-bottom: 60px; }
                </style>
                </head><body>
                    <div class="header">
                        <div class="company-info">
                            <div class="company-name">${companyInfo.name}</div>
                            <div>${companyInfo.address}</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-weight: bold;">Mẫu số 0${type === CashTransactionType.Receipt ? '1' : '2'}-TT</div>
                            <div style="font-style: italic; font-size: 11px;">(Ban hành theo TT số 200/2014/TT-BTC)</div>
                            <div style="margin-top: 5px;">Quyển số: .......</div>
                            <div>Số: ${data.id}</div>
                        </div>
                    </div>

                    <div class="voucher-title">${type === CashTransactionType.Receipt ? 'PHIẾU THU' : 'PHIẾU CHI'}</div>
                    <div class="voucher-date">Ngày ${new Date(data.date).getDate()} tháng ${new Date(data.date).getMonth() + 1} năm ${new Date(data.date).getFullYear()}</div>

                    <div class="content-row">
                        <span class="label">${receiverLabel}:</span>
                        <span class="value">${data.receiverName || data.subject}</span>
                    </div>
                    <div class="content-row">
                        <span class="label">Đơn vị:</span>
                        <span>${data.subject}</span>
                    </div>
                    <div class="content-row">
                        <span class="label">Địa chỉ:</span>
                        <span>${data.address || '...'}</span>
                    </div>
                    <div class="content-row">
                        <span class="label">Lý do ${type === CashTransactionType.Receipt ? 'nộp' : 'chi'}:</span>
                        <span>${data.reason}</span>
                    </div>
                    <div class="content-row">
                        <span class="label">Số tiền:</span>
                        <span class="value">${data.amount.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div class="content-row">
                        <span class="label">Bằng chữ:</span>
                        <span class="money-text">${readMoney(data.amount)}</span>
                    </div>
                    <div class="content-row">
                        <span class="label">Kèm theo:</span>
                        <span>${data.referenceDoc || '...................'} chứng từ gốc.</span>
                    </div>

                    <div class="signatures">
                        <div class="sig-block">
                            <div class="sig-title">Giám đốc</div>
                            <div class="sig-note">(Ký, họ tên, đóng dấu)</div>
                        </div>
                        <div class="sig-block">
                            <div class="sig-title">Kế toán trưởng</div>
                            <div class="sig-note">(Ký, họ tên)</div>
                        </div>
                        <div class="sig-block">
                            <div class="sig-title">Thủ quỹ</div>
                            <div class="sig-note">(Ký, họ tên)</div>
                        </div>
                        <div class="sig-block">
                            <div class="sig-title">Người lập phiếu</div>
                            <div class="sig-note">(Ký, họ tên)</div>
                            <div style="margin-top: 50px;">${currentUser?.name || ''}</div>
                        </div>
                        <div class="sig-block">
                            <div class="sig-title">Người ${type === CashTransactionType.Receipt ? 'nộp' : 'nhận'} tiền</div>
                            <div class="sig-note">(Ký, họ tên)</div>
                        </div>
                    </div>
                </body>
                </html>
            `;
            const newWindow = window.open('', '', 'height=600,width=800');
            if (newWindow) {
                newWindow.document.write(printContent);
                newWindow.document.close();
                newWindow.focus();
                setTimeout(() => {
                    newWindow.print();
                    newWindow.close();
                }, 250);
            }
        }
    };
    
    const inputClass = "w-full p-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-0 rounded-xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getTypeClass(type)}`}>
                            <CashFundIcon className="w-6 h-6"/>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl"><CloseIcon className="w-6 h-6"/></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className={labelClass}>Số tiền (VND) <span className="text-red-500">*</span></label>
                            <FormattedNumberInput
                                value={formData.amount}
                                onChange={(val) => setFormData(prev => ({ ...prev, amount: val }))}
                                className={`${inputClass} text-lg font-bold ${type === CashTransactionType.Receipt ? 'text-green-600' : 'text-red-600'}`}
                                placeholder="0"
                                autoFocus
                                required
                                readOnly={!!transactionToEdit}
                            />
                            {Number(formData.amount) > 0 && <p className="text-xs text-gray-500 mt-1 italic">{readMoney(Number(formData.amount))}</p>}
                        </div>

                        <div className="relative" ref={wrapperRef}>
                            <label className={labelClass}>{subjectLabel} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={e => {
                                    setFormData(prev => ({ ...prev, subject: e.target.value }));
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                className={inputClass}
                                placeholder="Nhập tên hoặc mã để tìm..."
                                required
                                autoComplete="off"
                                readOnly={!!transactionToEdit}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                                    {suggestions.map((item, index) => (
                                        <div 
                                            key={`${item.id}_${index}`}
                                            className="px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 text-sm border-b last:border-0 border-gray-100 dark:border-gray-600"
                                            onClick={() => handleSelectSubject(item)}
                                        >
                                            <div className="font-medium text-gray-900 dark:text-gray-100 flex justify-between">
                                                <span>{item.name}</span>
                                                <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">{item.type}</span>
                                            </div>
                                            <div className="text-xs text-blue-600 font-mono">{item.id}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>{receiverLabel}</label>
                            <input
                                type="text"
                                value={formData.receiverName}
                                onChange={e => setFormData(prev => ({ ...prev, receiverName: e.target.value }))}
                                className={inputClass}
                                placeholder="Tên người cụ thể..."
                                readOnly={!!transactionToEdit}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Địa chỉ</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                className={inputClass}
                                readOnly={!!transactionToEdit}
                            />
                        </div>
                         <div className="md:col-span-2">
                            <label className={labelClass}>Lý do {type === CashTransactionType.Receipt ? 'nộp' : 'chi'} <span className="text-red-500">*</span></label>
                            <textarea
                                value={formData.reason}
                                onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                className={inputClass}
                                rows={3}
                                placeholder="VD: Thu tiền hàng, Chi tạm ứng..."
                                required
                                readOnly={!!transactionToEdit}
                            />
                        </div>
                         <div className="md:col-span-2">
                            <label className={labelClass}>Chứng từ gốc kèm theo</label>
                            <input
                                type="text"
                                value={formData.referenceDoc}
                                onChange={e => setFormData(prev => ({ ...prev, referenceDoc: e.target.value }))}
                                className={inputClass}
                                placeholder="VD: HĐGTGT số 00123..."
                                readOnly={!!transactionToEdit}
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 flex justify-end gap-3 rounded-b-xl">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Hủy</button>
                    {transactionToEdit ? (
                        <button type="button" onClick={() => handlePrint(transactionToEdit)} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
                            <PrinterIcon className="w-4 h-4"/> In phiếu
                        </button>
                    ) : (
                        <>
                            <button type="button" onClick={() => handleSave(false)} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4"/> Lưu phiếu
                            </button>
                            <button type="button" onClick={() => handleSave(true)} className="px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition shadow-sm flex items-center gap-2">
                                <PrinterIcon className="w-4 h-4"/> Lưu & In
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
