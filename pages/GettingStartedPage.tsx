
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { UploadIcon, PencilIcon, PrinterIcon, PlayIcon, UserPlusIcon, ChevronRightIcon, EnvelopeIcon, SendIcon, DownloadIcon } from '../components/icons/Icons';
import { Toast } from '../components/Toast';
import { PricingModel, Customer } from '../types';

// --- HELPER FUNCTIONS (Moved from DataImportPage) ---
const downloadTemplate = (headers: string[], filename: string) => {
    const csvContent = headers.join(',');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if(link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const parseCSV = (content: string): Record<string, string>[] => {
    const lines = content.replace(/\r/g, '').split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const header = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1);

    return rows.map(rowStr => {
        const values = rowStr.split(',');
        return header.reduce((obj, h, i) => {
            obj[h] = values[i]?.trim() || '';
            return obj;
        }, {} as Record<string, string>);
    });
};

// --- REUSABLE IMPORT SECTION COMPONENT ---
interface ImportSectionProps {
    title: string;
    templateHeaders: string[];
    templateFilename: string;
    onImport: (data: Record<string, string>[]) => { successCount: number; errorCount: number; errors: string[] };
}

const ImportSection: React.FC<ImportSectionProps> = ({ title, templateHeaders, templateFilename, onImport }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleImportClick = () => {
        if (!file) {
            alert('Vui lòng chọn một tệp để nhập.');
            return;
        }

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            try {
                const data = parseCSV(content);
                const result = onImport(data);
                alert(`Hoàn tất!\n- Thành công: ${result.successCount} dòng\n- Thất bại: ${result.errorCount} dòng\n\nChi tiết lỗi (nếu có):\n${result.errors.slice(0, 5).join('\n')}`);
            } catch (error) {
                alert(`Đã xảy ra lỗi khi xử lý tệp: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
                setIsImporting(false);
                setFile(null);
            }
        };
        reader.onerror = () => {
             alert('Không thể đọc tệp đã chọn.');
             setIsImporting(false);
        };
        reader.readAsText(file, 'UTF-8');
    };
    
    return (
        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-600 flex flex-col h-full">
            <h4 className="font-bold text-gray-800 dark:text-white mb-2">{title}</h4>
            <div className="space-y-3 flex-1 flex flex-col">
                <button 
                    onClick={() => downloadTemplate(templateHeaders, templateFilename)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
                >
                    <DownloadIcon className="w-3 h-3" /> Tải tệp mẫu
                </button>
                
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-lg p-4 text-center flex-1 flex flex-col justify-center items-center bg-white dark:bg-gray-800 transition hover:border-blue-400">
                    <input
                        type="file"
                        id={`file-upload-${title}`}
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileChange}
                    />
                    <label htmlFor={`file-upload-${title}`} className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                        <UploadIcon className="w-6 h-6 text-gray-400 mb-2" />
                        {file ? <span className="text-xs text-green-600 font-medium truncate max-w-[120px]">{file.name}</span> : <span className="text-xs text-gray-500">Chọn tệp CSV</span>}
                    </label>
                </div>

                <button
                    onClick={handleImportClick}
                    disabled={!file || isImporting}
                    className="w-full py-2 text-xs font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                    {isImporting ? 'Đang xử lý...' : 'Bắt đầu Nhập'}
                </button>
            </div>
        </div>
    );
};

interface ActionButtonProps {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    primary?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, icon, onClick, primary = false }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all border shadow-sm
            ${primary
                ? 'bg-blue-600 text-white border-transparent hover:bg-blue-700'
                : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
            }`
        }
    >
        {icon}
        <span>{label}</span>
    </button>
);

const GettingStartedPage: React.FC = () => {
    const navigate = useNavigate();
    const { addProduct, addCustomer, addMaterialVariant } = useData();
    const [showImport, setShowImport] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // --- IMPORT HANDLERS ---
    const handleProductImport = (data: Record<string, string>[]) => {
        let successCount = 0, errorCount = 0;
        const errors: string[] = [];
        data.forEach((row, index) => {
            try {
                if (!row.name || !row.pricingModel) throw new Error(`Dòng ${index + 2}: Thiếu Tên hoặc Mô hình giá.`);
                const isFixed = row.pricingModel === PricingModel.Fixed;
                if (isFixed && (!row.price || isNaN(Number(row.price)))) throw new Error(`Dòng ${index + 2}: Giá không hợp lệ.`);
                addProduct({
                    name: row.name,
                    sku: row.sku || '',
                    pricingModel: row.pricingModel as PricingModel,
                    price: isFixed ? Number(row.price) : undefined,
                    initialStock: Number(row.initialStock) || 0,
                    lowStockThreshold: Number(row.lowStockThreshold) || 0,
                    unit: row.unit || 'cái'
                });
                successCount++;
            } catch (e: any) {
                errorCount++;
                errors.push(e.message);
            }
        });
        return { successCount, errorCount, errors };
    };

    const handleCustomerImport = (data: Record<string, string>[]) => {
        let successCount = 0, errorCount = 0;
        const errors: string[] = [];
        data.forEach((row, index) => {
            try {
                if (!row.name || !row.phone) throw new Error(`Dòng ${index + 2}: Thiếu Tên hoặc SĐT.`);
                addCustomer({
                    name: row.name,
                    phone: row.phone,
                    email: row.email || '',
                    customerGroupId: row.customerGroupId || undefined,
                    address: { street: row.address_street || '', ward: row.address_ward || '', district: row.address_district || '', province: row.address_province || '' },
                    company: { name: row.company_name || '', taxId: row.company_taxId || '' }
                });
                successCount++;
            } catch (e: any) {
                errorCount++;
                errors.push(e.message);
            }
        });
        return { successCount, errorCount, errors };
    };

    const handleMaterialImport = (data: Record<string, string>[]) => {
        let successCount = 0, errorCount = 0;
        const errors: string[] = [];
         data.forEach((row, index) => {
            try {
                 if (!row.groupId || !row.size || !row.unit || !row.sellingPrice) throw new Error(`Dòng ${index + 2}: Thiếu thông tin bắt buộc.`);
                addMaterialVariant({
                    groupId: row.groupId,
                    size: row.size,
                    unit: row.unit,
                    purchasePrice: Number(row.purchasePrice) || 0,
                    sellingPrice: Number(row.sellingPrice) || 0,
                    initialStock: Number(row.initialStock) || 0,
                    lowStockThreshold: Number(row.lowStockThreshold) || 0,
                });
                successCount++;
            } catch (e: any) {
                errorCount++;
                errors.push(e.message);
            }
        });
        return { successCount, errorCount, errors };
    };

    const steps = [
        {
            number: 1,
            title: 'Khai báo danh mục hàng hóa',
            description: 'Thiết lập danh sách hàng hóa, khách hàng và vật tư để bắt đầu kinh doanh.',
            actions: [
                { label: 'Nhập khẩu từ Excel', icon: <UploadIcon className="w-4 h-4"/>, onClick: () => setShowImport(true) },
                { label: 'Tự khai báo', icon: <PencilIcon className="w-4 h-4"/>, onClick: () => navigate('/catalogs/products') },
            ],
            imageUrl: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
        },
        {
            number: 2,
            title: 'In mã tem',
            description: 'In tem mã vạch dán lên hàng hóa để bán hàng nhanh chóng bằng máy quét.',
            actions: [
                { label: 'In tem mã', icon: <PrinterIcon className="w-4 h-4"/>, onClick: () => navigate('/catalogs/products'), primary: true },
            ],
            imageUrl: "https://images.unsplash.com/photo-1570857502907-bb38b88d4295?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
        },
        {
            number: 3,
            title: 'Khai báo nhân viên',
            description: 'Quản lý danh sách nhân viên và phân quyền sử dụng phần mềm.',
            actions: [
                { label: 'Khai báo nhân viên', icon: <UserPlusIcon />, onClick: () => navigate('/settings/users'), primary: true },
            ],
            imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
        },
        {
            number: 4,
            title: 'Bán hàng trên trình duyệt (Sale Cloud)',
            description: '<ul><li>Không mất thời gian cài đặt, triển khai phần mềm</li><li>Đồng bộ dữ liệu thành công</li><li>Làm việc ngay cả khi không có internet</li></ul>',
            actions: [
                { label: 'Trải nghiệm ngay', icon: <ChevronRightIcon className="w-4 h-4" />, onClick: () => navigate('/pos'), primary: true },
            ],
            badge: 'New',
            imageUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
        },
        {
            number: 5,
            title: 'Cài đặt ứng dụng trên điện thoại, máy tính bảng cho từng bộ phận',
        }
    ];

    return (
        <div className="max-w-5xl mx-auto pt-4 pb-12">
            <p className="text-center text-gray-600 mb-8">Vui lòng khai báo thông tin theo các bước phía dưới để bắt đầu sử dụng chương trình.</p>
            
            <div className="relative">
                <div className="space-y-6">
                    {steps.map((step, stepIdx) => (
                        <div key={step.number} className="relative flex items-start gap-x-6">
                            {stepIdx < steps.length - 1 ? (
                              <div className="absolute left-5 top-8 -ml-px mt-5 h-full w-1 bg-blue-200" aria-hidden="true" />
                            ) : null}

                            <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold ring-4 ring-white mt-8 shadow-sm">
                                {step.number}
                            </div>
                            
                            <div className="bg-white rounded-xl shadow-sm p-6 flex items-start gap-8 flex-grow border border-gray-100 transition-all hover:shadow-md">
                                {step.number === 1 && showImport ? (
                                    <div className="w-full animate-fade-in">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold text-gray-800">{step.title}</h3>
                                            <button onClick={() => setShowImport(false)} className="text-sm text-gray-500 hover:text-blue-600 hover:underline">
                                                &larr; Quay lại
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-6">Tải về tệp mẫu, điền dữ liệu và tải lên để nhập hàng loạt.</p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <ImportSection
                                                title="Sản phẩm"
                                                templateHeaders={['name', 'sku', 'pricingModel', 'price', 'unit', 'initialStock', 'lowStockThreshold']}
                                                templateFilename="Mau_Nhap_San_Pham.csv"
                                                onImport={handleProductImport}
                                            />
                                            <ImportSection
                                                title="Khách hàng"
                                                templateHeaders={['name', 'phone', 'email', 'customerGroupId', 'address_street', 'address_ward', 'address_district', 'address_province', 'company_name', 'company_taxId']}
                                                templateFilename="Mau_Nhap_Khach_Hang.csv"
                                                onImport={handleCustomerImport}
                                            />
                                            <ImportSection
                                                title="Chất liệu In ấn"
                                                templateHeaders={['groupId', 'size', 'unit', 'purchasePrice', 'sellingPrice', 'initialStock', 'lowStockThreshold']}
                                                templateFilename="Mau_Nhap_Chat_Lieu.csv"
                                                onImport={handleMaterialImport}
                                            />
                                        </div>
                                    </div>
                                ) : step.number === 5 ? (
                                    <>
                                        <div className="w-32 flex-shrink-0 hidden lg:block">
                                            <img src="https://i.imgur.com/2a9fQ9f.png" alt="Mobile apps" className="w-full h-auto object-contain opacity-90" />
                                        </div>
                                        <div className="flex-grow w-full">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4">{step.title}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="border rounded-lg p-4 text-center space-y-3 hover:border-blue-400 transition-colors">
                                                    <h4 className="font-bold text-xs uppercase text-gray-500">CHỦ CỬA HÀNG</h4>
                                                    <div className="flex justify-center gap-2 h-6 opacity-70"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-full"/><img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-full"/></div>
                                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=owner-app" alt="QR Code" className="w-20 h-20 mx-auto mix-blend-multiply"/>
                                                </div>
                                                <div className="border rounded-lg p-4 text-center space-y-3 hover:border-blue-400 transition-colors">
                                                    <h4 className="font-bold text-xs uppercase text-gray-500">NHÂN VIÊN THU NGÂN</h4>
                                                    <div className="flex justify-center gap-2 h-6 opacity-70"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-full"/></div>
                                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=cashier-app" alt="QR Code" className="w-20 h-20 mx-auto mix-blend-multiply"/>
                                                </div>
                                                <div className="border rounded-lg p-4 text-center space-y-3 hover:border-blue-400 transition-colors">
                                                    <h4 className="font-bold text-xs uppercase text-gray-500">NHÂN VIÊN BÁN HÀNG</h4>
                                                    <div className="flex justify-center gap-2 h-6 opacity-70"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-full"/><img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-full"/></div>
                                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=sales-app" alt="QR Code" className="w-20 h-20 mx-auto mix-blend-multiply"/>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3 mb-2">
                                                {step.title}
                                                {step.badge && <span className="text-xs bg-red-500 text-white font-semibold px-2 py-0.5 rounded-md">{step.badge}</span>}
                                            </h3>
                                            {step.description && (
                                                <div className="text-sm text-gray-600 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: step.description.replace(/<ul>/g, '<ul class="list-disc list-inside space-y-1 mt-2">') }} />
                                            )}
                                            {step.actions && (
                                                <div className="flex flex-wrap items-center gap-3">
                                                    {step.actions.map((action, idx) => (
                                                        <ActionButton
                                                            key={idx}
                                                            label={action.label}
                                                            icon={action.icon}
                                                            onClick={action.onClick}
                                                            primary={action.primary}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {step.imageUrl && (
                                            <div className="hidden sm:block w-48 h-32 rounded-lg bg-gray-100 relative overflow-hidden flex-shrink-0 border border-gray-200">
                                                <img src={step.imageUrl} alt={step.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </div>
    );
};

export default GettingStartedPage;
