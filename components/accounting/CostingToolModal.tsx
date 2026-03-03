import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { CostingRecord, MaterialVariant, ProfitRule, PrintPriceConfiguration, ProcessCalculationMethod, ProcessGroup } from '../../types';
import FormattedNumberInput from '../FormattedNumberInput';
import { RefreshIcon, ChevronDownIcon, CloseIcon, ScissorsIcon, BoxIcon, CheckCircleIcon, CalculatorIcon, WarningIcon, PlusCircleIcon, TrashIcon } from '../icons/Icons';
import CustomSelect from '../CustomSelect';
import { calculateOptimalLayout, LayoutConfig, LayoutResult } from '../../utils/costing/layoutUtils';
import { calculateBagCost } from '../../utils/costing/bagCalculator';

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(Math.round(value));

// --- NEW TYPES FOR FINISHING SCOPE ---
type ProcessScope = 'front' | 'back' | 'both';

export interface SelectedProcess {
    id: string;
    scope: ProcessScope;
}

// Updated Inputs to match specific Print Method logic
export type FormInputs = Omit<CostingRecord['inputs'], 'quantity' | 'width' | 'height' | 'bagN' | 'bagC' | 'bagH' | 'boxL' | 'boxW' | 'boxH' | 'pages' | 'printSides' | 'selectedMaterialVariantId' | 'selectedProcessIds'> & {
    quantity: number | '';
    width: number | '';
    height: number | '';
    bagN: number | '';
    bagC: number | '';
    bagH: number | '';
    boxL: number | '';
    boxW: number | '';
    boxH: number | '';
    pages: number | '';
    
    // New specific print specs
    printMethod: '1_mat' | 'tu_tro' | 'tro_nhip' | 'in_ab';
    colorFront: number;
    colorBack: number;

    notes: string;
    selectedPaperTypeKey: string; 
    selectedMaterialGroupId: string;
    selectedMaterialVariantId?: string;
    selectedPrintPriceConfigId?: string; // Machine selection
    selectedPrintMethodGroupId?: string; // Machine Group selection
    coverMaterialGroupId?: string;
    coverPaperTypeKey?: string;
    innerMaterialGroupId?: string;
    innerPaperTypeKey?: string;
    
    // Updated Finishing Logic
    selectedProcesses: SelectedProcess[]; // Replaces string[]
    
    // Added missing properties to match usage
    productType: 'sheet' | 'box' | 'bag' | 'catalogue';
    productName: string;
    markup: number;
    sourceProductId?: string;
};

// Updated configuration based on user request
const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
    bleed: 0.2, // Default base value, will be dynamic
    gap: 0.2,
    gripper: 1.0, // Fixed at 1.0cm
    safeMargin: 0.5
};

export interface AnalysisResults {
    inputs: FormInputs;
    generalInfo: {
        productName: string;
        dimensions: string;
        quantity: string;
        printColor: string;
        pagesPerItem: string;
        printMethod: string;
        finishing: string;
        notes: string;
    };
    analysis: {
        itemsPerSheet: number;
        netSheets: number;
        bestLayout: {
            paperId: string;
            paperName: string;
            paperSize: { width: number; height: number };
            machineSize: string; // Updated to reflect actual machine
            items: number;
            rows: number;
            cols: number;
            printConfigId: string;
            rotated: boolean;
            usedWidth: number;
            usedHeight: number;
            paperRotated?: boolean;
        };
        impositionType: string;
        totalSheets: number;
        wastageSheets: number;
        finalWidth: number; 
        finalHeight: number;
        flatWidth: number;
        flatHeight: number;
        paperEfficiency?: number;
        usedBleed?: number; // New field to show calculated bleed
        isBleedOptimized?: boolean; // Flag to indicate bleed was removed to fit
    };
    costs: {
        materialCost: number;
        printCost: number;
        processCost: number;
        totalCost: number;
        totalPrice: number;
        pricePerUnit: number;
        platesCost: number;
        runningCost: number;
        numberOfPlates: number;
        managementCost: number;
        finishingCosts: { id: string, name: string, cost: number }[];
        applicableMarkup?: number;
        isBatchCalculation?: boolean; // New flag to indicate batch pricing used
    };
    // DEBUGGING INFO
    scenarioComparison?: {
        rank: number;
        machineName: string;
        paperSize: string;
        ups: number;
        totalCost: number;
        reason: string;
    }[];
}

// --- HELPER: Generate Paper Cuts (V1, V2, V4) ---
// Automatically creates virtual paper variants for smaller cuts
const generatePaperCuts = (originalPaper: MaterialVariant): (MaterialVariant & { cutDescription: string })[] => {
    const cuts = [];
    
    // 1. Original (Full Sheet - V1)
    cuts.push({ ...originalPaper, cutDescription: 'Khổ nguyên (V1)' });

    // Dimensions
    // Normalize for calculation: Long Edge vs Short Edge
    const w = Math.max(originalPaper.width, originalPaper.height);
    const h = Math.min(originalPaper.width, originalPaper.height);
    
    // 2. Half Cut (V2) - Cut the longer edge in half
    // e.g. 86x65 -> 43x65
    const v2_w = w / 2;
    const v2_h = h;
    
    // Create V2 Variant
    // We keep the object structure but adjust price and dimensions
    cuts.push({ 
        ...originalPaper, 
        width: Math.max(v2_w, v2_h), 
        height: Math.min(v2_w, v2_h),
        // Adjust purchase price proportionally for calculation
        // (Cost per V2 sheet = Cost per V1 sheet / 2)
        purchasePrice: originalPaper.purchasePrice / 2, 
        cutDescription: 'Cắt đôi (V2)'
    });

    // 3. Quarter Cut (V4) - Cut the longer edge of V2
    // e.g. 43x65 -> 43x32.5
    const v4_w = Math.max(v2_w, v2_h) / 2; // Cut the long edge of V2
    const v4_h = Math.min(v2_w, v2_h); // Keep short edge of V2
    
    cuts.push({ 
        ...originalPaper, 
        width: Math.max(v4_w, v4_h), 
        height: Math.min(v4_w, v4_h), 
        purchasePrice: originalPaper.purchasePrice / 4, 
        cutDescription: 'Cắt tư (V4)'
    });

    return cuts;
}

const VisualLayout: React.FC<{ 
    rows: number; 
    cols: number; 
    paperSize: { width: number, height: number };
    itemSize: { width: number, height: number };
    rotated: boolean;
    usedWidth: number;
    usedHeight: number;
    showPaper?: boolean;
    showItems?: boolean;
    bleed?: number;
}> = ({ rows, cols, paperSize, itemSize, rotated, usedWidth, usedHeight, showPaper = true, showItems = true, bleed = 0.2 }) => {
    if (!rows || !cols) return (
        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <BoxIcon className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm">Chưa có dữ liệu bình trang</span>
        </div>
    );

    const maxWidth = 320; 
    const scale = maxWidth / paperSize.width;
    const svgHeight = paperSize.height * scale;
    
    const displayItemW = (rotated ? itemSize.height : itemSize.width);
    const displayItemH = (rotated ? itemSize.width : itemSize.height);

    const gripperH = DEFAULT_LAYOUT_CONFIG.gripper;

    // Center the block of items on the paper (considering gripper area)
    const availableH = paperSize.height - gripperH; 
    const availableW = paperSize.width;

    const startX = (availableW - usedWidth) / 2;
    const startY = (availableH - usedHeight) / 2; 

    return (
        <div className="flex flex-col items-center w-full">
            <div className="relative shadow-md rounded-sm overflow-hidden border border-gray-300 bg-white">
                <svg width="100%" height="100%" viewBox={`0 0 ${maxWidth} ${svgHeight}`} style={{ maxHeight: '300px' }}>
                    <rect x="0" y="0" width={maxWidth} height={svgHeight} fill="white" />
                    {showPaper && (
                        <>
                            <rect x="0" y={0} width={maxWidth} height={(paperSize.height - gripperH) * scale} fill="none" stroke="#f3f4f6" strokeWidth="0.5" strokeDasharray="2 2" />
                            <rect x="0" y={svgHeight - (gripperH * scale)} width={maxWidth} height={gripperH * scale} fill="url(#gripperPattern)" stroke="#d1d5db" strokeWidth="0.5" />
                             <defs><pattern id="gripperPattern" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="2" y1="0" x2="2" y2="4" stroke="#e5e7eb" strokeWidth="1" /></pattern></defs>
                            <text x={maxWidth / 2} y={svgHeight - (gripperH * scale / 2) + 3} fontSize="9" textAnchor="middle" fill="#6b7280" fontWeight="bold">NHÍP {gripperH}cm</text>
                        </>
                    )}
                    {showItems && Array.from({ length: rows }).map((_, r) => (
                        Array.from({ length: cols }).map((_, c) => {
                            const x = (startX + c * (displayItemW + DEFAULT_LAYOUT_CONFIG.gap)) * scale;
                            const y = (startY + r * (displayItemH + DEFAULT_LAYOUT_CONFIG.gap)) * scale;
                            const w = displayItemW * scale;
                            const h = displayItemH * scale;
                            return (
                                <g key={`${r}-${c}`}>
                                    <rect x={x} y={y} width={w} height={h} fill="#dbeafe" stroke="#93c5fd" strokeWidth="0.5" />
                                    <rect 
                                        x={x + (bleed * scale)} 
                                        y={y + (bleed * scale)} 
                                        width={w - (bleed * 2 * scale)} 
                                        height={h - (bleed * 2 * scale)} 
                                        fill="#eff6ff" 
                                        stroke="#2563eb" 
                                        strokeWidth="1" 
                                        strokeDasharray="2,1"
                                    />
                                    <text x={x + w/2} y={y + h/2 + 3} fontSize="8" textAnchor="middle" fill="#1e40af" fontWeight="600">{r*cols + c + 1}</text>
                                </g>
                            );
                        })
                    ))}
                </svg>
            </div>
        </div>
    );
};

const SmartProductionInfo: React.FC<{ data?: AnalysisResults, materialName: string }> = ({ data, materialName }) => {
    if (!data) return <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex items-center justify-center text-gray-400">Vui lòng nhập thông tin và nhấn "Phân tích".</div>;

    return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
        <div className="px-5 py-3 border-b border-gray-100 bg-blue-50/50 rounded-t-xl">
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide">1. Thông số Kỹ thuật Đề xuất</h2>
        </div>
        <div className="p-5 grid grid-cols-1 gap-y-4 text-sm flex-1">
            <div className="border-b border-dashed border-gray-200 pb-3">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Máy in đề xuất</p>
                <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-blue-800">{data.analysis.bestLayout.machineSize}</span>
                </div>
            </div>
            <div className="border-b border-dashed border-gray-200 pb-3">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Giấy in sử dụng</p>
                <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-800">{materialName}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                         Khổ: {data.analysis.bestLayout.paperSize.width} x {data.analysis.bestLayout.paperSize.height} cm
                    </span>
                </div>
            </div>
            <div className="border-b border-dashed border-gray-200 pb-3">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Quy cách in</p>
                <div className="grid grid-cols-2 gap-2">
                     <div><span className="text-gray-600 block text-xs">Số lượng tờ in:</span><span className="font-bold text-blue-600 text-base">{data.analysis.totalSheets.toLocaleString('vi-VN')} tờ</span></div>
                     <div><span className="text-gray-600 block text-xs">Phương thức:</span><span className="font-bold text-gray-800">{data.analysis.impositionType}</span></div>
                     <div><span className="text-gray-600 block text-xs">Màu in:</span><span className="font-bold text-gray-800">{data.generalInfo.printColor}</span></div>
                </div>
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Gia công sau in</p>
                {data.generalInfo.finishing ? (
                    <ul className="list-disc list-inside space-y-1">{data.generalInfo.finishing.split(',').map((process, idx) => (<li key={idx} className="text-gray-800 font-medium">{process.trim()}</li>))}</ul>
                ) : (<span className="text-gray-400 italic">Không có gia công</span>)}
            </div>
        </div>
    </div>
    );
};

const ProductionPlanCard: React.FC<{ analysis?: AnalysisResults['analysis'] }> = ({ analysis }) => {
    const usedBleed = analysis?.usedBleed ?? 0.2; // Allow 0
    const flatWWithBleed = (analysis?.flatWidth || 0) + (usedBleed * 2);
    const flatHWithBleed = (analysis?.flatHeight || 0) + (usedBleed * 2);
    
    const itemSize = { width: flatWWithBleed, height: flatHWithBleed };
    const [showPaper, setShowPaper] = useState(true);
    const [showItems, setShowItems] = useState(true);
    
    const efficiency = analysis?.paperEfficiency || 0;
    let effColor = 'bg-red-500';
    if (efficiency > 85) effColor = 'bg-green-500';
    else if (efficiency > 70) effColor = 'bg-blue-500';
    else if (efficiency > 50) effColor = 'bg-yellow-500';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">2. Mô hình Bình trang</h2>
                {analysis && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-700 border border-green-200">Smart Layout</span>}
            </div>
            <div className="p-5 flex flex-col lg:flex-row gap-6 h-full">
                <div className="lg:w-5/12 flex-shrink-0 flex flex-col">
                    <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 border border-gray-200 min-h-[250px]">
                        <VisualLayout 
                            rows={analysis?.bestLayout.rows || 0} cols={analysis?.bestLayout.cols || 0} 
                            paperSize={analysis?.bestLayout.paperSize || { width: 1, height: 1 }} itemSize={itemSize}
                            rotated={analysis?.bestLayout.rotated || false}
                            usedWidth={analysis?.bestLayout.usedWidth || 0} usedHeight={analysis?.bestLayout.usedHeight || 0}
                            showPaper={showPaper} showItems={showItems}
                            bleed={usedBleed}
                        />
                    </div>
                    <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-gray-600 bg-gray-50 rounded-md px-3 py-2 w-full border border-gray-200">
                        <label className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900"><input type="checkbox" checked={showPaper} onChange={(e) => setShowPaper(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"/><span>Khổ giấy: <strong>{analysis?.bestLayout.paperSize.width} x {analysis?.bestLayout.paperSize.height}</strong></span></label>
                        <label className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900"><input type="checkbox" checked={showItems} onChange={(e) => setShowItems(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"/><span>Khổ thành phẩm: <strong>{analysis?.finalWidth} x {analysis?.finalHeight}</strong> {analysis?.bestLayout.rotated && '(Xoay)'}</span></label>
                        <div className="flex items-center gap-1.5 text-gray-500 w-full justify-center pt-1 border-t border-gray-200 mt-1">
                            <span>Nhíp: <strong>{DEFAULT_LAYOUT_CONFIG.gripper}cm</strong></span><span>•</span>
                            {/* Dynamic Bleed Display */}
                            <span>Tràn lề (Auto): <strong className={analysis?.isBleedOptimized ? 'text-orange-600' : 'text-gray-800'}>{usedBleed}cm {analysis?.isBleedOptimized && '(Tối ưu khổ)'}</strong></span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-xs text-blue-600 uppercase font-bold mb-1">Khổ giấy in (Tối ưu)</p>
                            <p className="text-lg font-bold text-gray-800 leading-tight">{analysis?.bestLayout.paperName}</p>
                            <p className="text-xs text-gray-500 mt-1">{analysis?.bestLayout.paperSize.width} x {analysis?.bestLayout.paperSize.height} cm</p>
                        </div>
                        <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
                            <p className="text-xs text-purple-600 uppercase font-bold mb-1">Số con / tờ</p>
                            <div className="flex items-baseline gap-1"><p className="text-2xl font-bold text-gray-800 leading-none">{analysis?.itemsPerSheet}</p><span className="text-xs text-gray-500">con</span></div>
                            <p className="text-xs text-gray-500 truncate mt-1">{analysis?.impositionType}</p>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-1"><span className="text-xs font-medium text-gray-500">Hiệu suất giấy</span><span className="text-xs font-bold text-gray-700">{efficiency.toFixed(1)}%</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5"><div className={`h-2.5 rounded-full transition-all duration-1000 ${effColor}`} style={{ width: `${efficiency}%` }}></div></div>
                    </div>
                    <div className="mt-auto border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase">Tính toán số lượng giấy</div>
                        <div className="p-3 space-y-2 bg-white text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">Giấy in (Net):</span><span className="font-medium">{analysis?.netSheets} tờ</span></div>
                            <div className="flex justify-between text-red-600"><span className="flex items-center gap-1"><ScissorsIcon className="w-3 h-3"/> Bù hao:</span><span className="font-medium">+{analysis?.wastageSheets} tờ</span></div>
                            <div className="border-t border-dashed border-gray-300 my-1 pt-1 flex justify-between items-center"><span className="font-bold text-gray-800">TỔNG GIÁ XUẤT:</span><span className="text-xl font-bold text-blue-700">{analysis?.totalSheets} <span className="text-sm font-normal text-gray-500">tờ</span></span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CALCULATION LOGIC HELPERS ---
const calculateSheet = (inputs: FormInputs) => ({ width: Number(inputs.width), height: Number(inputs.height) });
const calculateBox = (inputs: FormInputs) => {
    const l = Number(inputs.boxL), w = Number(inputs.boxW), h = Number(inputs.boxH);
    return { width: 2 * (l + w) + 2, height: h + 2 * (w + 3) };
};
const calculateCatalogueCover = (inputs: FormInputs) => {
    const w = Number(inputs.width), h = Number(inputs.height), spine = Math.max(0.2, (Number(inputs.pages)/200));
    return { width: (w * 2) + spine, height: h };
};
const calculateCatalogueInner = (inputs: FormInputs) => {
    const w = Number(inputs.width), h = Number(inputs.height);
    return { width: (w * 2), height: h };
};

// --- MAIN COMPONENT ---
interface CostingToolModalProps { onClose: () => void; onApply?: (data: AnalysisResults) => void; }

export const CostingToolModal: React.FC<CostingToolModalProps> = ({ onClose, onApply }) => {
    const [analysisResult, setAnalysisResult] = useState<AnalysisResults | null>(null);
    const [enabledCosts, setEnabledCosts] = useState<Record<string, boolean>>({});
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [catalogueLamination, setCatalogueLamination] = useState<'none' | 'cover_1_side' | 'cover_2_sides' | 'full'>('none');
    const productDropdownRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const { companyInfo, materialGroups, materialVariants, processConfigurations, printMethodGroups, printPriceConfigurations, products, profitRules, addCostingRecord, processGroups } = useData();

    const initialFormState: FormInputs = {
        productType: 'sheet', productName: '', quantity: '', width: '', height: '',
        boxL: '', boxW: '', boxH: '', bagN: '', bagC: '', bagH: '', pages: '',
        printMethod: '1_mat',
        colorFront: 4,
        colorBack: 0,
        selectedMaterialGroupId: '', selectedPaperTypeKey: '', 
        selectedPrintMethodGroupId: '', selectedPrintPriceConfigId: '',
        selectedProcesses: [], // New Array of Objects
        notes: '', sourceProductId: undefined,
        markup: 0, 
        coverMaterialGroupId: '', coverPaperTypeKey: '', 
        innerMaterialGroupId: '', innerPaperTypeKey: '', 
    };
    
    const [formInputs, setFormInputs] = useState<FormInputs>(initialFormState);
    const [tempProcessId, setTempProcessId] = useState('');

    useEffect(() => {
        setFormInputs(prev => {
            const method = prev.printMethod;
            let newBack = prev.colorBack;
            if (method === '1_mat' || method === 'tu_tro' || method === 'tro_nhip') {
                newBack = 0;
            }
            return { ...prev, colorBack: newBack };
        });
    }, [formInputs.printMethod]);

    // --- SMART PAPER GROUPING LOGIC ---
    const getPaperTypes = (groupId: string) => {
        if (!groupId) return [];
        const variants = materialVariants.filter(v => v.groupId === groupId);
        const types: Record<string, { label: string, key: string, variants: MaterialVariant[] }> = {};
        variants.forEach(v => {
            const gsm = v.gsm;
            const key = `${groupId}_${gsm}`;
            if (!types[key]) {
                const group = materialGroups.find(g => g.id === groupId);
                types[key] = {
                    label: `${group?.name} ${gsm}gsm`,
                    key: key,
                    variants: []
                };
            }
            types[key].variants.push(v);
        });
        return Object.values(types);
    };

    const paperTypes = useMemo(() => getPaperTypes(formInputs.selectedMaterialGroupId), [formInputs.selectedMaterialGroupId, materialVariants]);
    const coverPaperTypes = useMemo(() => getPaperTypes(formInputs.coverMaterialGroupId || ''), [formInputs.coverMaterialGroupId, materialVariants]);
    const innerPaperTypes = useMemo(() => getPaperTypes(formInputs.innerMaterialGroupId || ''), [formInputs.innerMaterialGroupId, materialVariants]);

    const getApplicableMarkup = (cost: number) => {
        const sortedRules = [...profitRules].sort((a, b) => a.minCost - b.minCost);
        let markup = companyInfo.defaultMarkup;
        for (const rule of sortedRules) {
            if (cost >= rule.minCost && (rule.maxCost === null || cost < rule.maxCost)) {
                markup = rule.markup;
                break;
            }
        }
        return markup;
    };

    useEffect(() => { setFormInputs(prev => ({ ...prev, markup: companyInfo.defaultMarkup || 0 })); }, [companyInfo.defaultMarkup]);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) setIsProductDropdownOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormInputs(prev => ({ ...prev, [name]: value }));
    };
    
    const handleProductSelect = (product: any) => {
        setFormInputs(prev => ({ ...prev, sourceProductId: product.id, productName: product.name }));
        setIsProductDropdownOpen(false);
    };
    
    const handleNumberChange = (name: keyof FormInputs, value: number | '') => {
        setFormInputs(prev => ({ ...prev, [name]: value }));
    };

    // --- NEW FINISHING HANDLERS ---
    const handleAddProcess = () => {
        if (!tempProcessId) return;
        // Prevent duplicates
        if (formInputs.selectedProcesses.some(p => p.id === tempProcessId)) return;

        setFormInputs(prev => ({
            ...prev,
            selectedProcesses: [...prev.selectedProcesses, { id: tempProcessId, scope: 'front' }] // Default scope
        }));
        setTempProcessId('');
    };

    const handleRemoveProcess = (id: string) => {
        setFormInputs(prev => ({
            ...prev,
            selectedProcesses: prev.selectedProcesses.filter(p => p.id !== id)
        }));
    };

    const handleProcessScopeChange = (id: string, scope: ProcessScope) => {
        setFormInputs(prev => ({
            ...prev,
            selectedProcesses: prev.selectedProcesses.map(p => p.id === id ? { ...p, scope } : p)
        }));
    };
    
    const handleMaterialGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const groupId = e.target.value;
        setFormInputs(prev => ({ ...prev, selectedMaterialGroupId: groupId, selectedPaperTypeKey: '' }));
    };

    const handleCoverMaterialGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const groupId = e.target.value;
        setFormInputs(prev => ({ ...prev, coverMaterialGroupId: groupId, coverPaperTypeKey: '' }));
    };

    const handleInnerMaterialGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const groupId = e.target.value;
        setFormInputs(prev => ({ ...prev, innerMaterialGroupId: groupId, innerPaperTypeKey: '' }));
    };

    const availableProcesses = useMemo(() => {
        if (formInputs.productType === 'catalogue') return processConfigurations.filter(p => p.name && !p.name.toLowerCase().includes('cán màng'));
        return processConfigurations;
    }, [processConfigurations, formInputs.productType]);

    const costItems = useMemo(() => {
        if (!analysisResult) return [];
        const { costs, analysis } = analysisResult;
        const material = materialVariants.find(m => m.id === analysis.bestLayout.paperId);

        const items = [
            { id: 'giay', label: `Giấy ${material?.name || 'Không xác định'} (${analysis.totalSheets} tờ x ${formatCurrency(costs.materialCost / analysis.totalSheets)}đ)`, value: costs.materialCost },
        ];

        if (costs.isBatchCalculation) {
             items.push({ id: 'print_batch', label: 'Chi phí in (Khoán theo lô)', value: costs.printCost });
        } else {
             items.push({ id: 'kem', label: `Phí Kẽm (${costs.numberOfPlates} tấm)`, value: costs.platesCost });
             items.push({ id: 'setup', label: `Phí ra bài/Setup`, value: costs.printCost - costs.platesCost - costs.runningCost });
             items.push({ id: 'congin', label: 'Công in', value: costs.runningCost });
        }
        
        items.push(...costs.finishingCosts.map(item => ({ id: item.id, label: item.name, value: item.cost })));
        items.push({ id: 'quanly', label: `Chi phí quản lý (${companyInfo.managementFeePercentage || 5}%)`, value: costs.managementCost });

        return items;
    }, [analysisResult, materialVariants, companyInfo.managementFeePercentage]);


    useEffect(() => {
        if (analysisResult) {
            setEnabledCosts(costItems.reduce((acc, item) => ({ ...acc, [item.id]: true }), {}));
        }
    }, [analysisResult, costItems]);

    const { totalSellPrice, vatAmount, grandTotal, appliedMarkup } = useMemo(() => {
        if (!analysisResult) return { totalSellPrice: 0, vatAmount: 0, grandTotal: 0, appliedMarkup: companyInfo.defaultMarkup };
        
        const enabledBaseCost = costItems.reduce((sum, item) => enabledCosts[item.id] ? sum + item.value : sum, 0);
        const applicableMarkup = getApplicableMarkup(enabledBaseCost);
        
        const finalPrice = { totalSellPrice: 0, vatAmount: 0, grandTotal: 0, appliedMarkup: 0 };
        if (analysisResult) {
            const profit = enabledBaseCost * (applicableMarkup / 100);
            finalPrice.totalSellPrice = enabledBaseCost + profit;
            finalPrice.vatAmount = finalPrice.totalSellPrice * ((companyInfo.vatRate || 0) / 100);
            finalPrice.grandTotal = finalPrice.totalSellPrice + finalPrice.vatAmount;
            finalPrice.appliedMarkup = applicableMarkup;
        }
        return finalPrice;
    }, [enabledCosts, costItems, analysisResult, companyInfo.vatRate, profitRules]);


    // --- MAIN CALCULATION HANDLER (UPDATED) ---
    const handleAnalyzeClick = () => {
        const quantity = Number(formInputs.quantity) || 0;
        if (quantity <= 0) {
          alert('Vui lòng nhập số lượng hợp lệ.');
          return;
        }
    
        if (formInputs.productType === 'bag') {
            return;
        }
    
        let flatSize = { width: 0, height: 0 };
        switch (formInputs.productType) {
          case 'box': flatSize = calculateBox(formInputs); break;
          case 'catalogue': alert('Tính năng tự động cho Catalogue đang cập nhật.'); return;
          case 'sheet': default: flatSize = calculateSheet(formInputs); break;
        }
    
        if (flatSize.width <= 0 || flatSize.height <= 0) {
          alert('Vui lòng nhập đầy đủ kích thước sản phẩm.');
          return;
        }
    
        // 1. Candidates
        let candidatePrinters = printPriceConfigurations;
        if (formInputs.selectedPrintMethodGroupId) {
            candidatePrinters = candidatePrinters.filter(p => p.groupId === formInputs.selectedPrintMethodGroupId);
        }

        const selectedTypeObj = paperTypes.find(t => t.key === formInputs.selectedPaperTypeKey);
        const candidatePapers = selectedTypeObj ? selectedTypeObj.variants : [];
        
        if (candidatePrinters.length === 0 || candidatePapers.length === 0) {
            alert('Vui lòng chọn loại giấy và đảm bảo có máy in phù hợp.');
            return;
        }

        // 2. EXPAND CANDIDATE PAPERS WITH VIRTUAL CUTS (V2, V4)
        const virtualPapers = candidatePapers.flatMap(p => generatePaperCuts(p));

        const allScenarios: AnalysisResults[] = [];

        for (const printer of candidatePrinters) {
            const validBatchRule = printer.batchRules
                ?.filter(r => r.maxQuantity >= quantity)
                .sort((a, b) => a.maxQuantity - b.maxQuantity)[0];

            for (const paper of virtualPapers) { // Loop through CUTS now
                // 1. Dimensions
                const paperW_cm = Math.max(paper.width, paper.height);
                const paperH_cm = Math.min(paper.width, paper.height);

                // 2. Machine Fit Check
                if (paperW_cm > printer.maxSheetWidth || paperH_cm > printer.maxSheetHeight) continue;
                if (paperW_cm < printer.minSheetWidth || paperH_cm < printer.minSheetHeight) continue;
                
                // 3. Layout with SMART BLEED OPTIMIZATION (Double Calculation)
                let dynamicBleed = 0.2;
                // Special case for tiny items
                if (Math.max(flatSize.width, flatSize.height) < 10) dynamicBleed = 0.1;

                // SCENARIO A: Standard (Safe Mode)
                // Includes Bleed + Gap + Gripper + Tail Trim (Safety)
                const layoutConfigStandard: LayoutConfig = {
                    ...DEFAULT_LAYOUT_CONFIG,
                    bleed: dynamicBleed,
                    gap: 0.2, // Standard gap
                    gripper: printer.gripperEdge + 0.5, // Gripper + 0.5cm Safety Tail
                };
                const layoutStandard = calculateOptimalLayout(flatSize.width, flatSize.height, paperW_cm, paperH_cm, layoutConfigStandard, false);
                
                // SCENARIO B: Optimized (Aggressive Mode - "Cheating")
                // Removes Bleed, Removes Gap, Removes Tail Trim (Exact Gripper only)
                // Used when Standard fit is poor but an Exact Fit is physically possible
                const layoutConfigOptimized: LayoutConfig = {
                    ...DEFAULT_LAYOUT_CONFIG,
                    bleed: 0,
                    gap: 0,
                    // User Logic: "vừa đủ nhíp 1cm" implies we can push gripper to 1cm for optimization
                    gripper: 1.0, // Force 1cm for optimized check (Standard Offset Min)
                    safeMargin: 0 // Minimal margins
                };
                const layoutOptimized = calculateOptimalLayout(flatSize.width, flatSize.height, paperW_cm, paperH_cm, layoutConfigOptimized, false);

                // Decision Logic:
                // If Optimized layout fits MORE items, use it.
                let finalLayout = layoutStandard;
                let isBleedOptimized = false;
                let usedBleed = dynamicBleed;

                if (layoutOptimized.items > layoutStandard.items) {
                    finalLayout = layoutOptimized;
                    isBleedOptimized = true;
                    usedBleed = 0;
                }

                if (finalLayout.items === 0) continue; 

                // --- NEW: VALIDATE WORK & TURN LOGIC ---
                const isWorkAndTurn = formInputs.printMethod === 'tu_tro';
                const isWorkAndTumble = formInputs.printMethod === 'tro_nhip';

                if ((isWorkAndTurn || isWorkAndTumble) && finalLayout.items < 2) {
                    continue; // Skip this scenario as invalid for the selected method
                }
                // ---------------------------------------
                
                const netSheets = Math.ceil(quantity / finalLayout.items);
                
                const wastageSheets = printer.fixedWastageSheets + Math.ceil(netSheets * (printer.runningWastagePercent / 100));
                const totalSheets = netSheets + wastageSheets;

                let materialCost = 0;
                let printCost = 0;
                let platesCost = 0;
                let runningCost = 0;
                let numberOfPlates = 0;
                let isBatchCalculation = false;
                
                // 4. Plate Calc
                const isAB = formInputs.printMethod === 'in_ab';
                const isOneSide = formInputs.printMethod === '1_mat';
                const numColorsFront = formInputs.colorFront;
                const numColorsBack = formInputs.colorBack;
                
                if (isOneSide) numberOfPlates = numColorsFront;
                else if (isWorkAndTurn || isWorkAndTumble) numberOfPlates = numColorsFront; 
                else if (isAB) numberOfPlates = numColorsFront + numColorsBack;
                
                // 5. Costs
                // A. Material Cost
                const conversionRate = (paper.conversionRate && paper.conversionRate > 0) ? paper.conversionRate : 1;
                const pricePerSheet = paper.purchasePrice / conversionRate;
                materialCost = totalSheets * pricePerSheet;

                // B. Print Cost
                if (validBatchRule) {
                    printCost = validBatchRule.price;
                    isBatchCalculation = true;
                } else {
                    platesCost = numberOfPlates * printer.platePrice;
                    
                    let setupCost = printer.setupPrice;
                    if(isAB) setupCost *= 2; 

                    const machineColors = printer.numColors || 4;
                    const passMultiplierFront = Math.ceil(numColorsFront / machineColors);
                    const passMultiplierBack = Math.ceil(numColorsBack / machineColors);
                    
                    let totalImpressions = 0;
                    if (isOneSide) totalImpressions = totalSheets * passMultiplierFront;
                    else if (isWorkAndTurn || isWorkAndTumble) totalImpressions = totalSheets * 2 * passMultiplierFront; 
                    else if (isAB) totalImpressions = (totalSheets * passMultiplierFront) + (totalSheets * passMultiplierBack);

                    runningCost = totalImpressions * printer.impressionPrice;
                    printCost = platesCost + setupCost + runningCost;
                }
                
                const finishingCosts = formInputs.selectedProcesses.map((proc) => {
                    const procConfig = processConfigurations.find((p) => p.id === proc.id);
                    if (!procConfig) return { id: proc.id, name: 'Lỗi', cost: 0 };
                
                    const isSurfaceProcess = procConfig.appliesTo === 'surface';
                
                    const scopeLabel = isSurfaceProcess
                        ? (proc.scope === 'both' ? ' (2 mặt)' : (proc.scope === 'front' ? ' (Mặt trước)' : ' (Mặt sau)'))
                        : '';
                
                    const scopeMultiplier = isSurfaceProcess && proc.scope === 'both' ? 2 : 1;
                
                    let cost = 0;
                    let isBatchApplied = false;
                
                    if (procConfig.batchRules && procConfig.batchRules.length > 0 && procConfig.name.includes('Cán màng')) {
                        const paperAreaSqM = (paperW_cm / 100) * (paperH_cm / 100);
                        const totalArea = totalSheets * paperAreaSqM;
                
                        const applicableRule = procConfig.batchRules
                            .filter(rule => totalArea < rule.maxQuantity)
                            .sort((a, b) => a.maxQuantity - b.maxQuantity)[0];
                        
                        if (applicableRule) {
                            cost = applicableRule.price * scopeMultiplier;
                            isBatchApplied = true;
                        }
                    }
                
                    if (!isBatchApplied) {
                        switch (procConfig.calculationMethod) {
                            case ProcessCalculationMethod.PerSheet:
                                if (procConfig.pricingUnit === 'm²') {
                                    const paperAreaSqM = (paperW_cm / 100) * (paperH_cm / 100);
                                    const totalArea = totalSheets * paperAreaSqM;
                                    cost = (procConfig.setupFee * scopeMultiplier) + (totalArea * procConfig.unitPrice * scopeMultiplier);
                                } else {
                                    cost = (procConfig.setupFee * scopeMultiplier) + (totalSheets * procConfig.unitPrice * scopeMultiplier);
                                }
                                break;
                            case ProcessCalculationMethod.PerProduct:
                                cost = (procConfig.setupFee * scopeMultiplier) + (quantity * procConfig.unitPrice * scopeMultiplier);
                                break;
                            case ProcessCalculationMethod.FixedLot:
                                cost = procConfig.unitPrice * scopeMultiplier;
                                break;
                        }
                    }
                
                    return { id: procConfig.id, name: procConfig.name + scopeLabel, cost };
                });

                const totalProcessCost = finishingCosts.reduce((sum, item) => sum + item.cost, 0);

                const baseCost = materialCost + printCost + totalProcessCost;
                const managementCost = baseCost * ((companyInfo.managementFeePercentage || 5) / 100);
                const totalCost = baseCost + managementCost;

                const markupPercentage = getApplicableMarkup(totalCost);
                const profitMargin = markupPercentage / 100;
                const totalPrice = totalCost * (1 + profitMargin);
                const pricePerUnit = totalPrice / quantity;
                
                let finalPaperW = paperW_cm; let finalPaperH = paperH_cm;
                if (finalLayout.paperRotated) { [finalPaperW, finalPaperH] = [finalPaperH, finalPaperW]; }

                const methodLabel = isWorkAndTurn ? 'In Tự trở' : formInputs.printMethod === 'tro_nhip' ? 'In Trở nhíp' : isAB ? 'In AB (2 mặt)' : 'In 1 mặt';
                const colorLabel = isOneSide ? `${numColorsFront} màu` : `${numColorsFront}/${numColorsBack} màu`;

                const displayPaperName = paper['cutDescription'] && paper['cutDescription'] !== 'Khổ nguyên (V1)' 
                    ? `${paper.name} (${paper['cutDescription']})` 
                    : paper.name;

                allScenarios.push({
                    inputs: { ...formInputs, markup: markupPercentage, selectedMaterialVariantId: paper.id, selectedPrintPriceConfigId: printer.id },
                    generalInfo: { 
                        productName: formInputs.productName || 'Sản phẩm mới', 
                        dimensions: `${formInputs.width}x${formInputs.height} cm`,
                        quantity: `${formInputs.quantity}`, 
                        printColor: colorLabel, 
                        pagesPerItem: `${formInputs.pages}`, 
                        printMethod: methodLabel, 
                        finishing: finishingCosts.map(f => f.name).join(', '), 
                        notes: formInputs.notes 
                    },
                    analysis: { 
                        itemsPerSheet: finalLayout.items, netSheets, totalSheets, wastageSheets,
                        bestLayout: { 
                            paperId: paper.id, paperName: displayPaperName,
                            paperSize: { width: finalPaperW, height: finalPaperH }, 
                            machineSize: printer.name, items: finalLayout.items, rows: finalLayout.rows, cols: finalLayout.cols, 
                            printConfigId: printer.id, rotated: finalLayout.rotated, usedWidth: finalLayout.usedWidth, usedHeight: finalLayout.usedHeight, paperRotated: finalLayout.paperRotated,
                        }, 
                        impositionType: methodLabel,
                        finalWidth: Number(formInputs.width) || 0, finalHeight: Number(formInputs.height) || 0,
                        flatWidth: flatSize.width, flatHeight: flatSize.height,
                        paperEfficiency: finalLayout.paperEfficiency, 
                        usedBleed, 
                        isBleedOptimized 
                    },
                    costs: { 
                        materialCost, printCost, processCost: totalProcessCost, totalCost, totalPrice, pricePerUnit, 
                        platesCost, runningCost, 
                        numberOfPlates, managementCost, finishingCosts,
                        applicableMarkup: markupPercentage,
                        isBatchCalculation
                    }
                });
            }
        }
        
        if (allScenarios.length > 0) {
            // Sort ascending (Cheapest first)
            allScenarios.sort((a, b) => a.costs.totalCost - b.costs.totalCost);
            
            const bestScenario = allScenarios[0];

            bestScenario.scenarioComparison = allScenarios.slice(0, 5).map((s, idx) => {
                const printer = candidatePrinters.find(p => p.id === s.analysis.bestLayout.printConfigId);
                const matchedBatchRule = printer?.batchRules?.filter(r => r.maxQuantity >= quantity)?.sort((a, b) => a.maxQuantity - b.maxQuantity)[0];
                const isBatch = !!matchedBatchRule;

                const explanation = isBatch 
                    ? `Giá lô in (< ${matchedBatchRule.maxQuantity} cái)`
                    : `${s.analysis.bestLayout.items} ups, Kẽm: ${formatCurrency(s.costs.platesCost)}, Giấy: ${formatCurrency(s.costs.materialCost)}`;

                return {
                    rank: idx + 1,
                    machineName: s.analysis.bestLayout.machineSize,
                    paperSize: `${s.analysis.bestLayout.paperSize.width}x${s.analysis.bestLayout.paperSize.height}`,
                    ups: s.analysis.bestLayout.items,
                    totalCost: s.costs.totalCost,
                    reason: explanation
                };
            });

            addCostingRecord(bestScenario);
            setAnalysisResult(bestScenario);
        } else {
            alert('Không tìm thấy phương án sản xuất nào phù hợp (Không máy nào in vừa hoặc không đủ khổ giấy).');
        }
    };

    const handleReset = () => { setFormInputs({ ...initialFormState, markup: companyInfo.defaultMarkup || 0 }); setAnalysisResult(null); setIsProductDropdownOpen(false); };
    
    const handleSaveAndQuote = () => {
        if (!analysisResult) return;
        if (onApply) {
            onApply({ ...analysisResult, costs: { ...analysisResult.costs, totalPrice: totalSellPrice } });
            onClose();
        } else {
            // Fix: Ensure quantity is treated as string property, not method, to avoid "Type 'String' has no call signatures" error.
            navigate('/quotes/new', { 
                state: { 
                    prefillItems: [{ 
                        productName: analysisResult.generalInfo.productName, 
                        quantity: Number(analysisResult.generalInfo.quantity), 
                        totalPrice: totalSellPrice 
                    }] 
                } 
            });
        }
    };
    
    const inputClass = "w-full mt-1 p-2 border rounded-lg bg-white text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500";
    const quoteProducts = products.filter(p => p.pricingModel === 'Theo Báo Giá');
    
    const isOneSided = formInputs.printMethod === '1_mat';
    const isAB = formInputs.printMethod === 'in_ab';
    const frontLabel = isAB ? 'Số màu mặt trước' : 'Số màu in';
    
    return (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 w-full max-w-[90vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3"><div className="bg-blue-100 p-2 rounded-lg text-blue-600"><CalculatorIcon className="w-5 h-5"/></div><h1 className="text-xl font-bold text-gray-800 dark:text-white">Tạo báo giá in Offset</h1></div>
                    <div className="flex items-center gap-3"><button type="button" onClick={handleReset} className="text-sm font-medium text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"><RefreshIcon className="w-4 h-4" /><span>Làm mới</span></button><button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><CloseIcon className="w-6 h-6"/></button></div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    <div className="w-full lg:w-[450px] flex-shrink-0 border-r border-gray-200 overflow-y-auto p-6 bg-gray-50/50 space-y-6">
                        
                        {/* SECTION A: Product Info */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                             <h2 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide border-b pb-2">A. Thông tin sản phẩm</h2>
                             <div className="space-y-3">
                                <div className="relative" ref={productDropdownRef}>
                                    <label className="font-medium text-sm text-gray-700">Tên sản phẩm</label>
                                    <div className="relative mt-1"><input type="text" name="productName" value={formInputs.productName} onChange={handleInputChange} className={`${inputClass} pr-10 mt-0`} placeholder="Nhập tên..." autoComplete="off" onFocus={() => setIsProductDropdownOpen(true)} /><button type="button" onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)} className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-blue-600"><ChevronDownIcon className={`w-4 h-4 transition-transform ${isProductDropdownOpen ? 'rotate-180' : ''}`} /></button></div>
                                    {isProductDropdownOpen && (<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"><ul><li className="px-3 py-2 text-xs text-gray-400 bg-gray-50 uppercase font-semibold">Sản phẩm mẫu</li>{quoteProducts.map(p => (<li key={p.id} onClick={() => handleProductSelect(p)} className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer text-gray-700">{p.name}</li>))}{quoteProducts.length === 0 && <li className="px-3 py-2 text-sm text-gray-400 italic">Không có sản phẩm mẫu</li>}</ul></div>)}
                                </div>
                                <div><label className="font-medium text-sm text-gray-700">Số lượng</label><FormattedNumberInput value={formInputs.quantity} onChange={v => handleNumberChange('quantity', v)} className={inputClass} placeholder="VD: 5000" /></div>
                                <div className="grid grid-cols-2 gap-4"> 
                                    <div><label className="font-medium text-sm text-gray-700">Rộng (cm)</label><input type="number" step="0.1" value={formInputs.width} onChange={e => handleNumberChange('width', e.target.value === '' ? '' : parseFloat(e.target.value))} className={inputClass} placeholder="W" /></div> 
                                    <div><label className="font-medium text-sm text-gray-700">Cao (cm)</label><input type="number" step="0.1" value={formInputs.height} onChange={e => handleNumberChange('height', e.target.value === '' ? '' : parseFloat(e.target.value))} className={inputClass} placeholder="H" /></div> 
                                </div>
                             </div>
                        </div>

                        {/* SECTION B: Print Spec */}
                        <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
                            <h2 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wide border-b border-blue-200 pb-2">B. Quy cách in</h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="font-medium text-sm text-gray-700">Phương thức in</label>
                                    <select name="printMethod" value={formInputs.printMethod} onChange={handleInputChange} className={inputClass}>
                                        <option value="1_mat">In 1 mặt</option>
                                        <option value="tu_tro">In Tự trở (Work & Turn)</option>
                                        <option value="tro_nhip">In Trở nhíp (Work & Tumble)</option>
                                        <option value="in_ab">In AB (2 mặt riêng)</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-medium text-sm text-gray-700 truncate" title={frontLabel}>{frontLabel}</label>
                                        <input type="number" name="colorFront" value={formInputs.colorFront} onChange={e => handleNumberChange('colorFront', parseInt(e.target.value))} className={inputClass} min="1" max="10"/>
                                    </div>
                                    <div>
                                        <label className="font-medium text-sm text-gray-700">Máy in (Tùy chọn)</label>
                                        <select name="selectedPrintMethodGroupId" value={formInputs.selectedPrintMethodGroupId} onChange={handleInputChange} className={inputClass}>
                                            <option value="">(Tự động)</option>
                                            {printMethodGroups.map(g => (<option key={g.id} value={g.id}>{g.name}</option>))}
                                        </select>
                                    </div>
                                    {isAB && (
                                        <div className="col-span-2">
                                            <label className="font-medium text-sm text-gray-700">Số màu mặt sau</label>
                                            <input type="number" name="colorBack" value={formInputs.colorBack} onChange={e => handleNumberChange('colorBack', parseInt(e.target.value))} className={inputClass} min="1" max="10"/>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* SECTION C: Material & Finishing */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                             <h2 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide border-b pb-2">C. Vật tư & Gia công</h2>
                             <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4"> 
                                    <div>
                                        <label className="font-medium text-sm text-gray-700">Nhóm giấy</label>
                                        <select name="selectedMaterialGroupId" value={formInputs.selectedMaterialGroupId} onChange={handleMaterialGroupChange} className={inputClass}>
                                            <option value="">Chọn nhóm...</option>
                                            {materialGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                        </select>
                                    </div> 
                                    <div>
                                        <label className="font-medium text-sm text-gray-700">Loại giấy</label>
                                        <select name="selectedPaperTypeKey" value={formInputs.selectedPaperTypeKey} onChange={e => setFormInputs(p => ({...p, selectedPaperTypeKey: e.target.value}))} className={inputClass} disabled={!formInputs.selectedMaterialGroupId}>
                                            <option value="">Chọn loại...</option>
                                            {paperTypes.map(t => (<option key={t.key} value={t.key}>{t.label}</option>))}
                                        </select>
                                    </div> 
                                </div>
                                
                                {/* IMPROVED FINISHING SELECTION */}
                                <div>
                                    <label className="font-medium text-sm text-gray-700">Gia công sau in</label>
                                    <div className="flex gap-2 mt-1">
                                        <select 
                                            value={tempProcessId} 
                                            onChange={e => setTempProcessId(e.target.value)} 
                                            className="w-full p-2 border rounded text-sm bg-white"
                                        >
                                            <option value="">-- Chọn gia công --</option>
                                            {processGroups.map(group => (
                                                <optgroup key={group.id} label={group.name}>
                                                    {availableProcesses.filter(p => p.groupId === group.id).map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        <button 
                                            type="button" 
                                            onClick={handleAddProcess} 
                                            disabled={!tempProcessId}
                                            className="bg-blue-100 text-blue-700 px-3 py-2 rounded font-bold text-sm hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            +
                                        </button>
                                    </div>
                                    {/* Selected List */}
                                    <div className="mt-2 space-y-2">
                                        {formInputs.selectedProcesses.map((item, idx) => {
                                            const process = processConfigurations.find(p => p.id === item.id);
                                            return (
                                                <div key={item.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                                                    <span className="text-sm font-medium text-gray-700">{process?.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        {process?.appliesTo === 'surface' && (
                                                            <select 
                                                                value={item.scope} 
                                                                onChange={e => handleProcessScopeChange(item.id, e.target.value as ProcessScope)}
                                                                className="text-xs p-1 border rounded bg-white focus:ring-1 focus:ring-blue-500"
                                                            >
                                                                <option value="front">1 mặt (Trước)</option>
                                                                <option value="back">1 mặt (Sau)</option>
                                                                <option value="both">2 mặt</option>
                                                            </select>
                                                        )}
                                                        <button onClick={() => handleRemoveProcess(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"><TrashIcon className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                             </div>
                        </div>

                        <div><label className="font-medium text-sm text-gray-700">Ghi chú thêm</label><textarea name="notes" value={formInputs.notes} onChange={handleInputChange} className={inputClass} placeholder="Ghi chú..." rows={2}/></div>
                        
                        <button type="button" onClick={handleAnalyzeClick} className="w-full mt-2 px-6 py-3 font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:shadow-lg transition-all transform active:scale-[0.99]">
                            Phân tích & Tính giá
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
                         <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><CheckCircleIcon className="w-6 h-6 text-green-600"/> Kết quả Phân tích</h2>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                                <div className="xl:col-span-4 h-full">
                                    <SmartProductionInfo 
                                        data={analysisResult || undefined} 
                                        materialName={
                                            analysisResult 
                                            ? (paperTypes.find(t => t.key === formInputs.selectedPaperTypeKey)?.label || 'Giấy in') 
                                            : ''
                                        }
                                    />
                                </div>
                                <div className="xl:col-span-8 h-full">
                                    <ProductionPlanCard analysis={analysisResult?.analysis} />
                                </div>
                            </div>
                            
                            {/* COMPARISON TABLE - NEW */}
                            {analysisResult?.scenarioComparison && (
                                <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
                                    <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-3">So sánh Phương án (Tự động tối ưu)</h2>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium">Xếp hạng</th>
                                                    <th className="px-4 py-2 text-left font-medium">Máy in</th>
                                                    <th className="px-4 py-2 text-left font-medium">Khổ giấy</th>
                                                    <th className="px-4 py-2 text-center font-medium">Bình (Ups)</th>
                                                    <th className="px-4 py-2 text-right font-medium">Tổng chi phí</th>
                                                    <th className="px-4 py-2 text-left font-medium">Chi tiết</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analysisResult.scenarioComparison.map((scen, idx) => (
                                                    <tr key={idx} className={idx === 0 ? "bg-green-50" : "hover:bg-gray-50"}>
                                                        <td className="px-4 py-2 font-bold">#{scen.rank} {idx===0 && '🏆'}</td>
                                                        <td className="px-4 py-2 font-semibold">{scen.machineName}</td>
                                                        <td className="px-4 py-2">{scen.paperSize} cm</td>
                                                        <td className="px-4 py-2 text-center">{scen.ups}</td>
                                                        <td className="px-4 py-2 text-right font-bold text-blue-600">{formatCurrency(scen.totalCost)}</td>
                                                        <td className="px-4 py-2 text-xs text-gray-500 italic">{scen.reason}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white rounded-xl shadow p-6 border">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Bóc tách Chi phí</h2>
                                <div className="space-y-2">
                                    {costItems.length > 0 ? costItems.map(item => (
                                        <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-dashed border-gray-100 last:border-0">
                                            <label className="flex items-center cursor-pointer select-none"><input type="checkbox" checked={enabledCosts[item.id] || false} onChange={() => setEnabledCosts(prev => ({...prev, [item.id]: !prev[item.id]}))} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><span className="ml-3 text-gray-700">{item.label}</span></label>
                                            <span className="font-semibold text-gray-900">{formatCurrency(item.value)} đ</span>
                                        </div>
                                    )) : ( [1,2,3,4,5].map(i => (<div key={i} className="flex justify-between py-2 border-b border-dashed border-gray-100"><div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse"></div><div className="h-4 bg-gray-100 rounded w-20 animate-pulse"></div></div>)))}
                                    <div className="mt-6 pt-4 border-t-2 border-gray-100 space-y-2">
                                        <div className="flex justify-between items-baseline"><span className="text-base font-bold text-gray-600">THÀNH TIỀN (Giá bán đề xuất):</span>{analysisResult ? (<span className="text-lg font-bold text-gray-800">{formatCurrency(totalSellPrice)} đ</span>) : (<span className="text-lg font-bold text-gray-200">---</span>)}</div>
                                         <div className="flex justify-between items-baseline text-sm"><span className="text-gray-500">Lợi nhuận áp dụng:</span>{analysisResult ? (<span className="font-semibold text-gray-700">{appliedMarkup}%</span>) : (<span className="font-semibold text-gray-300">---</span>)}</div>
                                        <div className="flex justify-between items-baseline"><span className="text-base font-bold text-gray-600">VAT ({companyInfo.vatRate || 0}%):</span>{analysisResult ? (<span className="text-lg font-bold text-gray-800">{formatCurrency(vatAmount)} đ</span>) : (<span className="text-lg font-bold text-gray-200">---</span>)}</div>
                                         <div className="flex justify-between items-baseline border-t border-gray-200 pt-2"><span className="text-xl font-extrabold text-gray-800">TỔNG TIỀN:</span>{analysisResult ? (<span className="text-3xl font-extrabold text-blue-600">{formatCurrency(grandTotal)} đ</span>) : (<span className="text-3xl font-bold text-gray-200">---</span>)}</div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4 mt-6 pt-4 border-t"><button onClick={() => setAnalysisResult(null)} className="px-6 py-2.5 font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition" disabled={!analysisResult}>Điều chỉnh</button><button onClick={handleSaveAndQuote} className="px-6 py-2.5 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={!analysisResult}>{onApply ? 'ÁP DỤNG VÀO BÁO GIÁ' : 'LƯU BÁO GIÁ'}</button></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
