
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Toast } from '../../components/Toast';
import { DownloadIcon, UploadIcon, CheckIcon } from '../../components/icons/Icons';
import { PricingModel, Customer } from '../../types';

// --- HELPER FUNCTIONS ---
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
        // This is a simple parser and will not handle commas within quoted fields.
        // Advise users to ensure their data does not contain commas.
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
    const [toastMessage, setToastMessage] = useState('');

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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{title}</h2>
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sử dụng tệp mẫu CSV để đảm bảo dữ liệu được nhập chính xác.
                </p>
                <button 
                    onClick={() => downloadTemplate(templateHeaders, templateFilename)}
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                    <DownloadIcon className="w-4 h-4" /> Tải về tệp mẫu
                </button>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                        type="file"
                        id={`file-upload-${title}`}
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileChange}
                    />
                    <label htmlFor={`file-upload-${title}`} className="cursor-pointer text-blue-600 font-semibold flex flex-col items-center justify-center">
                        <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                        {file ? <span>Đã chọn: {file.name}</span> : <span>Nhấn để chọn tệp CSV</span>}
                    </label>
                </div>
                <button
                    onClick={handleImportClick}
                    disabled={!file || isImporting}
                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition disabled:bg-gray-400"
                >
                    {isImporting ? 'Đang xử lý...' : 'Bắt đầu Nhập'}
                </button>
            </div>
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </div>
    );
};

const DataImportPage: React.FC = () => {
    const { addProduct, addCustomer, addMaterialVariant, currentUser, rolePermissions } = useData();
    const [toastMessage, setToastMessage] = useState('');

    const hasPermission = useMemo(() => {
        if (!currentUser) return false;
        const permissions = rolePermissions[currentUser.roleId] || [];
        return permissions.includes('manage_data_import');
    }, [currentUser, rolePermissions]);

    if (!hasPermission) {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold text-red-600">Truy cập bị từ chối</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Bạn không có quyền truy cập trang này.</p>
            </div>
        );
    }
    
    const handleProductImport = (data: Record<string, string>[]) => {
        let successCount = 0, errorCount = 0;
        const errors: string[] = [];
        data.forEach((row, index) => {
            try {
                if (!row.name || !row.pricingModel) {
                    throw new Error(`Dòng ${index + 2}: Thiếu Tên sản phẩm hoặc Mô hình giá.`);
                }
                const isFixed = row.pricingModel === PricingModel.Fixed;
                if (isFixed && (!row.price || isNaN(Number(row.price)))) {
                    throw new Error(`Dòng ${index + 2}: Sản phẩm giá cố định phải có cột giá là một con số.`);
                }
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
                if (!row.name || !row.phone) {
                    throw new Error(`Dòng ${index + 2}: Thiếu Tên khách hàng hoặc Số điện thoại.`);
                }
                const customerData: Omit<Customer, 'id'> = {
                    name: row.name,
                    phone: row.phone,
                    email: row.email || '',
                    customerGroupId: row.customerGroupId || undefined,
                    address: {
                        street: row.address_street || '',
                        ward: row.address_ward || '',
                        district: row.address_district || '',
                        province: row.address_province || '',
                    },
                    company: {
                        name: row.company_name || '',
                        taxId: row.company_taxId || ''
                    }
                };
                addCustomer(customerData);
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
                // Validate mandatory fields
                 if (!row.groupId || !row.size || !row.unit || !row.sellingPrice) {
                    throw new Error(`Dòng ${index + 2}: Thiếu các cột bắt buộc (groupId, size, unit, sellingPrice).`);
                }
                
                // Parse dimensions from size string (e.g. "65x86")
                const dimsMatch = row.size.match(/(\d+(\.\d+)?)\s*[xX]\s*(\d+(\.\d+)?)/i);
                const width = dimsMatch ? parseFloat(dimsMatch[1]) : 0;
                const height = dimsMatch ? parseFloat(dimsMatch[3]) : 0;
                
                const purchasePrice = Number(row.purchasePrice) || 0;
                const conversionRate = Number(row.conversionRate) || (row.unit === 'Ram' ? 500 : 1);
                
                addMaterialVariant({
                    groupId: row.groupId,
                    name: row.name || `${row.groupId} ${row.size}`, // Use provided name or construct one
                    gsm: Number(row.gsm) || 0,
                    width: width,
                    height: height,
                    purchaseUnit: row.unit, // Map 'unit' column to purchaseUnit
                    costingUnit: 'tờ', // Default base unit
                    conversionRate: conversionRate,
                    purchasePrice: purchasePrice,
                    averageCost: conversionRate > 0 ? purchasePrice / conversionRate : 0,
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


    return (
        <>
        <div className="max-w-5xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nhập dữ liệu từ Excel/CSV</h1>
            <p className="text-gray-600 dark:text-gray-400">
                Tải về các tệp mẫu, điền dữ liệu của bạn, sau đó tải lên để nhập hàng loạt vào hệ thống.
                <br/>
                Lưu ý: Vui lòng sử dụng định dạng file `.csv` và mã hóa UTF-8 để đảm bảo không lỗi font chữ tiếng Việt.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ImportSection
                    title="Nhập Danh mục Sản phẩm"
                    templateHeaders={['name', 'sku', 'pricingModel', 'price', 'unit', 'initialStock', 'lowStockThreshold']}
                    templateFilename="Mau_Nhap_San_Pham.csv"
                    onImport={handleProductImport}
                />
                <ImportSection
                    title="Nhập Danh sách Khách hàng"
                    templateHeaders={['name', 'phone', 'email', 'customerGroupId', 'address_street', 'address_ward', 'address_district', 'address_province', 'company_name', 'company_taxId']}
                    templateFilename="Mau_Nhap_Khach_Hang.csv"
                    onImport={handleCustomerImport}
                />
                 <ImportSection
                    title="Nhập Chất liệu In ấn"
                    templateHeaders={['groupId', 'name', 'size', 'gsm', 'unit', 'conversionRate', 'purchasePrice', 'sellingPrice', 'initialStock', 'lowStockThreshold']}
                    templateFilename="Mau_Nhap_Chat_Lieu.csv"
                    onImport={handleMaterialImport}
                />
            </div>
        </div>
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </>
    );
};

export default DataImportPage;
