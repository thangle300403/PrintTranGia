


import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { PencilIcon, TrashIcon, PrinterIcon, DocumentTextIcon, CheckIcon, CloseIcon, ChevronDownIcon, EyeIcon, DocumentDuplicateIcon, ZaloIcon } from '../../components/icons/Icons';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';
import { PrintTemplate, ZnsTemplate } from '../../types';
import { MOCK_PRINT_TEMPLATES as DEFAULTS } from '../../constants';
import { ZnsTemplateModal } from '../../components/settings/ZnsTemplateModal';

// --- INTERFACES ---
interface PrinterConfig {
    id: string;
    name: string;
    type: 'LAN' | 'USB' | 'Bluetooth';
    ipAddress?: string;
    status: 'Online' | 'Offline';
}

// --- MOCK DATA & HELPERS ---
const MOCK_PREVIEW_DATA: Record<string, string> = {
    '{companyName}': 'CÔNG TY TNHH IN ẤN TRẦN GIA',
    '{companyAddress}': '52 Đường số 5, Cư Xá Bình Thới, P. Bình Thới, TP.HCM',
    '{companyPhone}': '0898 123 989',
    '{companyEmail}': 'it.inantrangia@gmail.com',
    '{logo}': 'https://inantrangia.vn/upload/in-an-tran-gia-01.png',
    '{orderId}': 'DH00123',
    '{orderDate}': '20/11/2025',
    '{customerId}': 'KH2720',
    '{customerName}': 'Nguyễn Văn Khách',
    '{customerPhone}': '0909 123 456',
    '{customerAddress}': '123 Đường ABC, Quận 1, TP.HCM',
    '{subTotal}': '1.750.000',
    '{vatAmount}': '140.000',
    '{shippingFee}': '0',
    '{totalAmount}': '1.890.000',
    '{depositAmount}': '500.000',
    '{remainingAmount}': '1.390.000',
    '{amountInWords}': 'Một triệu tám trăm chín mươi nghìn đồng',
    '{itemsTableRows}': `
        <tr>
            <td style="text-align: center; padding: 4px;">1</td>
            <td style="padding: 4px;">In Tờ rơi A5 - C150</td>
            <td style="text-align: center; padding: 4px;">tờ</td>
            <td style="text-align: center; padding: 4px;">1000</td>
            <td style="text-align: right; padding: 4px;">1.500</td>
            <td style="text-align: right; padding: 4px;">1.500.000</td>
        </tr>
        <tr>
            <td style="text-align: center; padding: 4px;">2</td>
            <td style="padding: 4px;">Danh thiếp (5 hộp/tên)</td>
            <td style="text-align: center; padding: 4px;">hộp</td>
            <td style="text-align: center; padding: 4px;">5</td>
            <td style="text-align: right; padding: 4px;">50.000</td>
            <td style="text-align: right; padding: 4px;">250.000</td>
        </tr>
    `,
    '{title}': 'HÓA ĐƠN BÁN HÀNG',
    '{countDate}': '20/11/2025 17:30',
    '{totalActual}': '15.000.000',
    '{systemBalance}': '15.050.000',
    '{difference}': '-50.000',
    '{denominationsTableRows}': `
        <tr><td>500.000</td><td style="text-align: center;">10</td><td style="text-align: right;">5.000.000</td></tr>
        <tr><td>200.000</td><td style="text-align: center;">20</td><td style="text-align: right;">4.000.000</td></tr>
        <tr><td>100.000</td><td style="text-align: center;">60</td><td style="text-align: right;">6.000.000</td></tr>
    `,
    '{startDate}': '01/11/2025',
    '{endDate}': '30/11/2025',
    '{bankName}': 'Vietcombank',
    '{accountNumber}': '0071000123456',
    '{openingBalance}': '100.000.000',
    '{closingBalance}': '150.000.000',
    '{ledgerTableRows}': `
        <tr><td>01/11/2025</td><td>PT001</td><td>Thu tiền khách A</td><td style="text-align: right;">50.000.000</td><td style="text-align: right;">0</td><td style="text-align: right;">150.000.000</td></tr>
    `,
    '{id}': 'LSX00001',
    '{relatedOrderId}': 'DH00123',
    '{productName}': 'In Tờ rơi A5 - C150',
    '{quantity}': '5000 tờ',
    '{deliveryDate}': '25/11/2025',
    '{salesperson}': 'Vương Kinh Doanh',
    '{size}': 'A5',
    '{material}': 'Couche 150gsm',
    '{printColor}': '4 màu',
    '{design}': 'File khách',
    '{pages}': '2',
    '{printMethod}': 'In Offset',
    '{finishing}': 'Cán màng mờ',
    '{notes}': 'Giao gấp trước 5h chiều',
    '{expiryDate}': '30/11/2025',
    '{payerName}': 'Nguyễn Văn Khách',
    '{reason}': 'Thanh toán tiền hàng đợt 1',
    '{amount}': '5.000.000',
    '{address}': '123 Đường ABC, Quận 1, TP.HCM',
    '{referenceDoc}': 'HĐ123'
};

const substituteMockData = (content: string, customData?: Record<string, string>) => {
    if (!content) return '';
    let result = content;
    const data = { ...MOCK_PREVIEW_DATA, ...customData };
    Object.entries(data).forEach(([key, value]) => {
        result = result.split(key).join(value || '');
    });
    return result;
};

const sanitizeHtmlForEditor = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const styles = Array.from(doc.querySelectorAll('style')).map(s => s.outerHTML).join('\n');
    const bodyContent = doc.body ? doc.body.innerHTML : '';
    if (!bodyContent && !styles && html) return html;
    return styles + bodyContent;
};

const wrapHtmlForSave = (innerContent: string, paperSize: 'K80' | 'A5' | 'A4') => {
    const pageRule = paperSize === 'K80' 
        ? ''
        : `@page { size: ${paperSize}; }`;
    
    const styleBlock = `<style>${pageRule}</style>`;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
${styleBlock}
</head>
<body>
${innerContent}
</body>
</html>`;
};


const getDefaultContent = (type: string, size: string) => {
    const found = DEFAULTS.find(t => t.type === type && t.paperSize === size);
    return found ? found.content : '';
};

const MOCK_PRINTERS: PrinterConfig[] = [
    { id: 'prt_1', name: 'Máy in văn phòng (Canon 2900)', type: 'USB', status: 'Online' },
    { id: 'prt_2', name: 'Máy in hóa đơn K80 (LAN)', type: 'LAN', ipAddress: '192.168.1.200', status: 'Online' },
];

const MERGE_FIELDS = [
    {
        group: 'Thông tin Cửa hàng',
        fields: [
            { key: '{companyName}', label: 'Tên cửa hàng' },
            { key: '{companyAddress}', label: 'Địa chỉ cửa hàng' },
            { key: '{companyPhone}', label: 'SĐT cửa hàng' },
            { key: '{companyEmail}', label: 'Email cửa hàng' },
            { key: '{logo}', label: 'Logo cửa hàng (Hình ảnh)' },
        ]
    },
    {
        group: 'Thông tin Đơn hàng / Báo giá',
        fields: [
            { key: '{title}', label: 'Tiêu đề phiếu' },
            { key: '{orderId}', label: 'Mã phiếu (ĐH/BG)' },
            { key: '{orderDate}', label: 'Ngày lập' },
            { key: '{expiryDate}', label: 'Ngày hết hạn (Báo giá)' },
            { key: '{subTotal}', label: 'Tổng tiền hàng' },
            { key: '{vatAmount}', label: 'Tiền thuế VAT' },
            { key: '{shippingFee}', label: 'Phí vận chuyển' },
            { key: '{totalAmount}', label: 'Tổng thanh toán' },
            { key: '{depositAmount}', label: 'Số tiền đã cọc' },
            { key: '{remainingAmount}', label: 'Số tiền còn lại' },
            { key: '{amountInWords}', label: 'Số tiền bằng chữ' },
            { key: '{itemsTableRows}', label: 'Dòng sản phẩm (HTML <tr>)' },
        ]
    },
    {
        group: 'Thông tin Khách hàng',
        fields: [
            { key: '{customerName}', label: 'Tên khách hàng' },
            { key: '{customerId}', label: 'Mã khách hàng' },
            { key: '{customerPhone}', label: 'SĐT khách hàng' },
            { key: '{customerAddress}', label: 'Địa chỉ khách hàng' },
        ]
    },
    {
        group: 'Lệnh Sản Xuất (LSX)',
        fields: [
            { key: '{id}', label: 'Mã LSX' },
            { key: '{relatedOrderId}', label: 'Mã Đơn hàng KD' },
            { key: '{productName}', label: 'Tên sản phẩm' },
            { key: '{quantity}', label: 'Số lượng' },
            { key: '{deliveryDate}', label: 'Ngày giao hàng' },
            { key: '{salesperson}', label: 'Nhân viên KD' },
            { key: '{size}', label: 'Kích thước' },
            { key: '{material}', label: 'Chất liệu' },
            { key: '{printColor}', label: 'Màu in' },
            { key: '{design}', label: 'Thiết kế' },
            { key: '{pages}', label: 'Số trang/mặt' },
            { key: '{printMethod}', label: 'Phương thức in' },
            { key: '{finishing}', label: 'Gia công' },
            { key: '{notes}', label: 'Ghi chú' },
        ]
    },
    {
        group: 'Kế toán & Quỹ',
        fields: [
            { key: '{countDate}', label: 'Thời điểm kiểm kê' },
            { key: '{totalActual}', label: 'Tổng tiền thực tế' },
            { key: '{systemBalance}', label: 'Số dư sổ sách' },
            { key: '{difference}', label: 'Chênh lệch' },
            { key: '{denominationsTableRows}', label: 'Bảng chi tiết mệnh giá (HTML <tr>)' },
            { key: '{startDate}', label: 'Ngày bắt đầu' },
            { key: '{endDate}', label: 'Ngày kết thúc' },
            { key: '{openingBalance}', label: 'Số dư đầu kỳ' },
            { key: '{closingBalance}', label: 'Số dư cuối kỳ' },
            { key: '{bankName}', label: 'Tên ngân hàng' },
            { key: '{accountNumber}', label: 'Số tài khoản' },
            { key: '{ledgerTableRows}', label: 'Bảng sổ chi tiết (HTML <tr>)' },
            { key: '{payerName}', label: 'Người nộp tiền (Phiếu thu)' },
            { key: '{receiverName}', label: 'Người nhận tiền (Phiếu chi)' },
            { key: '{reason}', label: 'Lý do thu/chi' },
            { key: '{amount}', label: 'Số tiền thu/chi' },
            { key: '{address}', label: 'Địa chỉ người nộp/nhận' },
            { key: '{referenceDoc}', label: 'Chứng từ kèm theo' },
        ]
    }
];

const VisualEditorToolbar: React.FC<{ onCommand: (command: string, value?: string) => void }> = ({ onCommand }) => {
    return (
        <div className="flex items-center gap-1 p-1 border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <button type="button" onClick={() => onCommand('bold')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 font-bold" title="In đậm">B</button>
            <button type="button" onClick={() => onCommand('italic')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 italic" title="In nghiêng">I</button>
            <button type="button" onClick={() => onCommand('underline')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 underline" title="Gạch chân">U</button>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <button type="button" onClick={() => onCommand('justifyLeft')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Căn trái">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" /></svg>
            </button>
            <button type="button" onClick={() => onCommand('justifyCenter')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Căn giữa">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" /></svg>
            </button>
            <button type="button" onClick={() => onCommand('justifyRight')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Căn phải">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" /></svg>
            </button>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <button type="button" onClick={() => onCommand('undo')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Hoàn tác">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            </button>
             <button type="button" onClick={() => onCommand('redo')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Làm lại">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
            </button>
        </div>
    );
};

// --- COMPONENTS ---

const TemplateModal: React.FC<{
    template: Partial<PrintTemplate> | null;
    onClose: () => void;
    onSave: (data: PrintTemplate) => void;
}> = ({ template, onClose, onSave }) => {
    const { companyInfo } = useData();
    const [formData, setFormData] = useState<Partial<PrintTemplate>>(
        template || { 
            name: '', 
            type: 'Order', 
            paperSize: 'A5', 
            isActive: true, 
            content: getDefaultContent('Order', 'A5') 
        }
    );
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview'); 
    const [isPreviewMode, setIsPreviewMode] = useState(false); 
    const [expandedGroup, setExpandedGroup] = useState<string | null>('Thông tin Đơn hàng / Báo giá');
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const visualEditorRef = useRef<HTMLDivElement>(null);

    const globalStyles = `
        .print-editor-content { box-sizing: border-box; }
        .print-editor-content * { box-sizing: border-box; max-width: 100%; }
        .print-editor-content table { width: 100% !important; table-layout: fixed; border-collapse: collapse; }
        .print-editor-content img { height: auto; max-width: 100%; }
        .print-editor-content td, .print-editor-content th { word-wrap: break-word; overflow-wrap: break-word; }
    `;

    const handlePaperSizeChange = (newSize: 'K80' | 'A4' | 'A5') => {
        const defaultContent = getDefaultContent(formData.type!, newSize);
        setFormData({ ...formData, paperSize: newSize, content: defaultContent || formData.content });
    };

    const handleTypeChange = (newType: PrintTemplate['type']) => {
         const defaultContent = getDefaultContent(newType, formData.paperSize!);
         setFormData(prev => ({ ...prev, type: newType, content: defaultContent || prev.content }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let finalContent = formData.content || '';
        if (activeTab === 'preview' && visualEditorRef.current && !isPreviewMode) {
             const innerContent = visualEditorRef.current.innerHTML;
             finalContent = wrapHtmlForSave(innerContent, formData.paperSize!);
        } else if (activeTab === 'editor' && !finalContent.includes('<html')) {
             finalContent = wrapHtmlForSave(finalContent, formData.paperSize!);
        }

        if (!formData.name) return alert('Vui lòng nhập tên mẫu.');
        
        onSave({ 
            ...formData, 
            id: formData.id || `tpl_${Date.now()}`,
            updatedAt: new Date(),
            content: finalContent || ''
        } as PrintTemplate);
    };

    const insertField = (fieldKey: string) => {
        if (isPreviewMode) return;

        if (activeTab === 'editor' && textareaRef.current) {
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            const text = formData.content || '';
            const newText = text.substring(0, start) + fieldKey + text.substring(end);
            setFormData({ ...formData, content: newText });
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.setSelectionRange(start + fieldKey.length, start + fieldKey.length);
                }
            }, 0);
        } else if (activeTab === 'preview' && visualEditorRef.current) {
            visualEditorRef.current.focus();
            document.execCommand('insertText', false, fieldKey);
        }
    };
    
    const handleTabChange = (tab: 'editor' | 'preview') => {
        if (tab === activeTab) return;
        if (activeTab === 'preview' && visualEditorRef.current && !isPreviewMode) {
             const innerContent = visualEditorRef.current.innerHTML;
             const wrappedContent = wrapHtmlForSave(innerContent, formData.paperSize!);
             setFormData(prev => ({ ...prev, content: wrappedContent }));
        }
        setActiveTab(tab);
    };

    const visualContent = useMemo(() => {
        const content = formData.content || '';
        if (activeTab === 'preview' && isPreviewMode) {
             const dynamicData: Record<string, string> = {};
             if (companyInfo.name) dynamicData['{companyName}'] = companyInfo.name;
             if (companyInfo.address) dynamicData['{companyAddress}'] = companyInfo.address;
             if (companyInfo.phone) dynamicData['{companyPhone}'] = companyInfo.phone;
             if (companyInfo.email) dynamicData['{companyEmail}'] = companyInfo.email;
             if (companyInfo.logoUrl) dynamicData['{logo}'] = companyInfo.logoUrl;

            return substituteMockData(content, dynamicData);
        } else if (activeTab === 'preview' && !isPreviewMode) {
             return sanitizeHtmlForEditor(content);
        }
        return content;
    }, [formData.content, activeTab, isPreviewMode, companyInfo]);

    const toggleGroup = (group: string) => {
        setExpandedGroup(expandedGroup === group ? null : group);
    };
    
    const handleFormat = (command: string, value?: string) => {
        if (activeTab === 'preview' && visualEditorRef.current && !isPreviewMode) {
            document.execCommand(command, false, value);
            visualEditorRef.current.focus();
        }
    };

    const paperStyle = useMemo(() => {
        if (formData.paperSize === 'K80') {
            return { width: '80mm', minHeight: '100mm', padding: '5mm' };
        } else if (formData.paperSize === 'A5') {
            return { width: '148mm', minHeight: '210mm', padding: '7mm 7mm 10mm 7mm' };
        } else { // A4
            return { width: '210mm', minHeight: '297mm', padding: '10mm 10mm 15mm 10mm' };
        }
    }, [formData.paperSize]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{template?.id ? 'Chỉnh sửa Mẫu in' : 'Thêm Mẫu in mới'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>

                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar: Merge Fields */}
                    <div className={`w-72 bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col flex-shrink-0 transition-opacity duration-300 ${isPreviewMode ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="p-4 border-b dark:border-gray-700">
                            <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-1">Trường trộn (Merge Fields)</h4>
                            <p className="text-xs text-gray-500">Nhấn vào trường để chèn vào vị trí con trỏ</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {MERGE_FIELDS.map((group) => (
                                <div key={group.group} className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
                                    <button 
                                        onClick={() => toggleGroup(group.group)}
                                        className="w-full flex justify-between items-center p-3 text-left bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                    >
                                        <span className="font-semibold text-xs text-gray-700 dark:text-gray-200 uppercase">{group.group}</span>
                                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${expandedGroup === group.group ? 'rotate-180' : ''}`} />
                                    </button>
                                    {expandedGroup === group.group && (
                                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {group.fields.map(field => (
                                                <li 
                                                    key={field.key} 
                                                    onClick={() => insertField(field.key)}
                                                    className="px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition group flex justify-between items-center"
                                                >
                                                    <div>
                                                        <div className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">{field.key}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{field.label}</div>
                                                    </div>
                                                    <DocumentDuplicateIcon className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Area: Editor */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 min-w-0">
                        {/* Config Form */}
                        <div className="p-4 grid grid-cols-4 gap-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên mẫu in</label>
                                <input className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="VD: Mẫu hóa đơn bán lẻ..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Khổ giấy</label>
                                <select 
                                    className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" 
                                    value={formData.paperSize} 
                                    onChange={e => handlePaperSizeChange(e.target.value as any)}
                                >
                                    <option value="K80">K80 (Hóa đơn nhiệt)</option>
                                    <option value="A5">A5 (Mặc định)</option>
                                    <option value="A4">A4 (Máy in văn phòng)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loại chứng từ</label>
                                <select className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" value={formData.type} onChange={e => handleTypeChange(e.target.value as any)}>
                                    <option value="Order">Đơn hàng (Receipt)</option>
                                    <option value="PurchaseOrder">Phiếu đặt hàng</option>
                                    <option value="Quote">Báo giá</option>
                                    <option value="Invoice">Hóa đơn</option>
                                    <option value="ProductionOrder">Lệnh sản xuất</option>
                                    <option value="CashCount">Phiếu kiểm kê quỹ</option>
                                    <option value="CashLedger">Sổ quỹ tiền mặt</option>
                                    <option value="BankLedger">Sổ tiền gửi NH</option>
                                    <option value="CashTransaction">Phiếu Thu/Chi (Chung)</option>
                                    <option value="CashReceipt">Phiếu thu tiền mặt</option>
                                    <option value="BankTransaction">Ủy nhiệm chi/Báo có</option>
                                </select>
                            </div>
                        </div>

                        {/* Toolbar & Tabs */}
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-900 border-b dark:border-gray-700">
                             <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                                <button 
                                    onClick={() => handleTabChange('preview')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition flex items-center gap-2 ${activeTab === 'preview' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
                                >
                                    <PencilIcon className="w-4 h-4" /> Thiết kế (Visual)
                                </button>
                                <button 
                                    onClick={() => handleTabChange('editor')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'editor' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
                                >
                                    Mã nguồn (HTML)
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                {activeTab === 'preview' && (
                                    <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                                        <button 
                                            onClick={() => setIsPreviewMode(false)}
                                            className={`px-3 py-1 text-xs font-bold rounded transition ${!isPreviewMode ? 'bg-white dark:bg-gray-600 shadow text-blue-600' : 'text-gray-500'}`}
                                        >
                                            Chỉnh sửa
                                        </button>
                                        <button 
                                            onClick={() => setIsPreviewMode(true)}
                                            className={`px-3 py-1 text-xs font-bold rounded transition flex items-center gap-1 ${isPreviewMode ? 'bg-white dark:bg-gray-600 shadow text-green-600' : 'text-gray-500'}`}
                                        >
                                            <EyeIcon className="w-3 h-3" /> Xem trước
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="h-4 w-4 rounded text-blue-600" />
                                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Kích hoạt sử dụng</label>
                                </div>
                            </div>
                        </div>

                        {activeTab === 'preview' && !isPreviewMode && <VisualEditorToolbar onCommand={handleFormat} />}

                        {/* Editor / Preview Area */}
                        <div className="flex-1 relative overflow-hidden flex flex-col">
                            {activeTab === 'editor' ? (
                                <textarea 
                                    ref={textareaRef}
                                    className="w-full h-full p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none focus:outline-none overflow-y-auto" 
                                    value={formData.content} 
                                    onChange={e => setFormData({...formData, content: e.target.value})}
                                    spellCheck={false}
                                    placeholder="<html>...</html>"
                                />
                            ) : (
                                <div className="flex-1 bg-gray-200 dark:bg-gray-900 overflow-y-auto relative h-full">
                                    <div className="min-h-full w-full grid justify-items-center py-10">
                                        <style>{globalStyles}</style>
                                        <div 
                                            ref={visualEditorRef}
                                            contentEditable={!isPreviewMode}
                                            className={`print-editor-content bg-white shadow-2xl overflow-hidden outline-none transition-all duration-300 ${isPreviewMode ? 'cursor-default' : 'cursor-text'}`}
                                            style={{ 
                                                ...paperStyle, 
                                                margin: 0,
                                                backgroundColor: 'white',
                                                pointerEvents: isPreviewMode ? 'none' : 'auto',
                                                userSelect: isPreviewMode ? 'none' : 'text'
                                            }}
                                            dangerouslySetInnerHTML={{ __html: visualContent }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end items-center px-6 py-4 border-t bg-gray-50 dark:bg-gray-700 dark:border-gray-600 gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 font-semibold text-gray-700 dark:text-gray-200 transition">Hủy</button>
                    <button type="button" onClick={handleSubmit} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-lg transition transform hover:-translate-y-0.5">Lưu mẫu</button>
                </div>
            </div>
        </div>
    );
};

const PrinterModal: React.FC<{
    printer: Partial<PrinterConfig> | null;
    onClose: () => void;
    onSave: (data: PrinterConfig) => void;
}> = ({ printer, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<PrinterConfig>>(printer || { name: '', type: 'LAN', status: 'Online' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return alert('Vui lòng nhập tên máy in.');
        onSave({ ...formData, id: formData.id || `prt_${Date.now()}` } as PrinterConfig);
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{printer?.id ? 'Chỉnh sửa Máy in' : 'Thêm Máy in'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-sm font-medium mb-1">Tên máy in</label><input className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                    <div><label className="block text-sm font-medium mb-1">Loại kết nối</label><select className="w-full p-2 border rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}><option value="LAN">LAN / Wifi</option><option value="USB">USB</option><option value="Bluetooth">Bluetooth</option></select></div>
                    {formData.type === 'LAN' && (<div><label className="block text-sm font-medium mb-1">Địa chỉ IP</label><input className="w-full p-2 border rounded" value={formData.ipAddress || ''} onChange={e => setFormData({...formData, ipAddress: e.target.value})} placeholder="192.168.1.xxx" /></div>)}
                    <div><label className="block text-sm font-medium mb-1">Trạng thái</label><select className="w-full p-2 border rounded" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}><option value="Online">Online</option><option value="Offline">Offline</option></select></div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PrintTemplatePage: React.FC = () => {
    const { 
        currentUser, rolePermissions, 
        printTemplates: contextTemplates, updatePrintTemplate,
        znsTemplates, addZnsTemplate, updateZnsTemplate, deleteZnsTemplate
    } = useData();
    const [activeTab, setActiveTab] = useState<'templates' | 'zns' | 'printers'>('templates');
    const [printers, setPrinters] = useState<PrinterConfig[]>(MOCK_PRINTERS);
    
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<PrintTemplate | null>(null);

    const [isZnsModalOpen, setIsZnsModalOpen] = useState(false);
    const [editingZnsTemplate, setEditingZnsTemplate] = useState<ZnsTemplate | null>(null);
    
    const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
    const [editingPrinter, setEditingPrinter] = useState<PrinterConfig | null>(null);

    const [confirmDelete, setConfirmDelete] = useState<{ type: string, id: string } | null>(null);
    const [toast, setToast] = useState('');
    
    const canManage = useMemo(() => {
        if (!currentUser) return false;
        const perms = rolePermissions[currentUser.roleId] || [];
        return perms.includes('manage_print_templates');
    }, [currentUser, rolePermissions]);

    if (!canManage) {
        return <div className="text-center p-8"><h1 className="text-2xl font-bold text-red-600">Truy cập bị từ chối</h1></div>;
    }
    
    const handleSaveTemplate = (data: PrintTemplate) => {
        updatePrintTemplate(data);
        setToast(editingTemplate ? 'Cập nhật mẫu in thành công' : 'Thêm mẫu in mới thành công');
        setIsTemplateModalOpen(false);
        setEditingTemplate(null);
    };
    
    const handleDeleteTemplate = (id: string) => {
        setConfirmDelete(null);
        setToast('Chức năng xóa chưa được kích hoạt');
    };
    
    const handleSaveZnsTemplate = (data: Omit<ZnsTemplate, 'id'> | ZnsTemplate) => {
        if ('id' in data) {
            updateZnsTemplate(data as ZnsTemplate);
            setToast('Cập nhật mẫu ZNS thành công');
        } else {
            addZnsTemplate(data as Omit<ZnsTemplate, 'id'>);
            setToast('Thêm mẫu ZNS mới thành công');
        }
        setIsZnsModalOpen(false);
        setEditingZnsTemplate(null);
    };
    
    const handleDeleteZnsTemplate = (id: string) => {
        deleteZnsTemplate(id);
        setConfirmDelete(null);
        setToast('Đã xóa mẫu ZNS');
    };

    const handleSavePrinter = (data: PrinterConfig) => {
        if (editingPrinter) {
            setPrinters(prev => prev.map(p => p.id === data.id ? data : p));
            setToast('Cập nhật máy in thành công');
        } else {
            setPrinters(prev => [...prev, data]);
            setToast('Thêm máy in mới thành công');
        }
        setIsPrinterModalOpen(false);
        setEditingPrinter(null);
    };

    const handleDeletePrinter = (id: string) => {
        setPrinters(prev => prev.filter(p => p.id !== id));
        setConfirmDelete(null);
        setToast('Đã xóa máy in');
    };

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mẫu in & Máy in</h1>
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        <button onClick={() => setActiveTab('templates')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'templates' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                           <DocumentTextIcon /> Quản lý Mẫu in
                        </button>
                        <button onClick={() => setActiveTab('zns')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'zns' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                           <ZaloIcon /> Mẫu Zalo ZNS
                        </button>
                        <button onClick={() => setActiveTab('printers')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'printers' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            <PrinterIcon className="w-5 h-5" /> Quản lý Máy in
                        </button>
                    </nav>
                </div>

                {activeTab === 'templates' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button onClick={() => { setEditingTemplate(null); setIsTemplateModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-sm">+ Thêm mẫu mới</button>
                        </div>
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Tên mẫu</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Khổ giấy</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Loại chứng từ</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Ngày cập nhật</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Trạng thái</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {contextTemplates.map(tpl => (
                                        <tr key={tpl.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{tpl.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{tpl.paperSize || 'K80'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{tpl.type}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{new Date(tpl.updatedAt).toLocaleDateString('vi-VN')}</td>
                                            <td className="px-6 py-4 text-sm">{tpl.isActive ? <span className="text-green-600">Đang dùng</span> : <span className="text-gray-500">Tạm ngưng</span>}</td>
                                            <td className="px-6 py-4 text-center space-x-2"><button onClick={() => { setEditingTemplate(tpl); setIsTemplateModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4"/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                    </div>
                )}
                
                {activeTab === 'zns' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button onClick={() => { setEditingZnsTemplate(null); setIsZnsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-sm">+ Thêm mẫu ZNS</button>
                        </div>
                         <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Tên quản lý</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Template ID (Zalo)</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Loại</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {znsTemplates.map(tpl => (
                                        <tr key={tpl.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{tpl.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 font-mono">{tpl.templateId}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{tpl.type}</td>
                                            <td className="px-6 py-4 text-center space-x-2">
                                                <button onClick={() => { setEditingZnsTemplate(tpl); setIsZnsModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4"/></button>
                                                <button onClick={() => setConfirmDelete({ type: 'zns', id: tpl.id })} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                    </div>
                )}
                
                {activeTab === 'printers' && (
                    <div className="space-y-4">
                         <div className="flex justify-end">
                            <button onClick={() => { setEditingPrinter(null); setIsPrinterModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-sm">+ Thêm máy in</button>
                        </div>
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Tên máy in</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Kết nối</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase">IP / Port</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Trạng thái</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {printers.map(prt => (
                                        <tr key={prt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{prt.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{prt.type}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 font-mono">{prt.ipAddress || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm">{prt.status}</td>
                                            <td className="px-6 py-4 text-center space-x-2">
                                                <button onClick={() => { setEditingPrinter(prt); setIsPrinterModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4"/></button>
                                                <button onClick={() => setConfirmDelete({ type: 'printer', id: prt.id })} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                    </div>
                )}
            </div>

            {isTemplateModalOpen && <TemplateModal template={editingTemplate} onClose={() => setIsTemplateModalOpen(false)} onSave={handleSaveTemplate} />}
            {isZnsModalOpen && <ZnsTemplateModal template={editingZnsTemplate} onClose={() => setIsZnsModalOpen(false)} onSave={handleSaveZnsTemplate} />}
            {isPrinterModalOpen && <PrinterModal printer={editingPrinter} onClose={() => setIsPrinterModalOpen(false)} onSave={handleSavePrinter} />}
            
            <ConfirmationModal 
                isOpen={!!confirmDelete} 
                onClose={() => setConfirmDelete(null)} 
                onConfirm={() => {
                    if (confirmDelete?.type === 'printer') handleDeletePrinter(confirmDelete.id);
                    else if (confirmDelete?.type === 'zns') handleDeleteZnsTemplate(confirmDelete.id);
                    else handleDeleteTemplate(confirmDelete!.id);
                }} 
                title="Xác nhận xóa" 
                message={`Bạn có chắc chắn muốn xóa mục này?`} 
            />
            
            {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </>
    );
};

export default PrintTemplatePage;