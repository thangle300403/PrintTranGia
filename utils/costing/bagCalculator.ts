

import { MaterialVariant, ProcessConfiguration, CompanyInfo, ProfitRule, ProcessCalculationMethod } from '../../types';
import { calculateOptimalLayout, LayoutResult } from './layoutUtils';

// Interface matching the FormInputs in the Modal
interface BagInputs {
    quantity: number;
    bagN: number; // Ngang
    bagC: number; // Cao
    bagH: number; // Hông
    selectedMaterialVariantId: string;
    selectedMaterialGroupId: string;
    printSides: 1 | 2;
    selectedProcessIds: string[];
}

interface BagAnalysisResult {
    flatWidth: number;
    flatHeight: number;
    layout: LayoutResult & { paperId: string; paperName: string; paperSize: { width: number; height: number } };
    totalSheets: number;
    netSheets: number;
    wastageSheets: number;
    costs: {
        materialCost: number;
        printCost: number;
        processCost: number;
        platesCost: number;
        runningCost: number;
        numberOfPlates: number;
        managementCost: number;
        totalCost: number;
        totalPrice: number;
        pricePerUnit: number;
        finishingCosts: { id: string; name: string; cost: number }[];
        applicableMarkup: number;
    };
}

/**
 * Calculate the Flat Size (Khổ trải) of a paper bag.
 * Formula approximation:
 * Width = (Ngang x 2) + (Hông x 2) + Mép dán (2-3cm)
 * Height = Cao + Nắp trên (4-5cm) + Đáy (0.75 x Hông)
 */
export const calculateBagFlatDimensions = (n: number, c: number, h: number) => {
    const GLUE_FLAP = 2.5; // Mép dán thân
    const TOP_FOLD = 4.5;  // Gấp miệng
    const BOTTOM_FOLD_RATIO = 0.75; // Hệ số đáy (thường 0.7-0.8 tùy kiểu đáy)

    const flatWidth = (n * 2) + (h * 2) + GLUE_FLAP;
    const flatHeight = c + TOP_FOLD + (h * BOTTOM_FOLD_RATIO);

    return { width: flatWidth, height: flatHeight };
};

export const calculateBagCost = (
    inputs: BagInputs,
    materials: MaterialVariant[],
    processes: ProcessConfiguration[],
    companyInfo: CompanyInfo,
    profitRules: ProfitRule[]
): BagAnalysisResult | null => {

    const getApplicableMarkup = (cost: number, rules: ProfitRule[], defaultMarkup: number): number => {
        const sortedRules = [...rules].sort((a, b) => a.minCost - b.minCost);
        let markup = defaultMarkup;
        for (const rule of sortedRules) {
            if (cost >= rule.minCost && (rule.maxCost === null || cost < rule.maxCost)) {
                markup = rule.markup;
                break;
            }
        }
        return markup;
    };
    
    // 1. Determine Flat Size
    const { width: flatWidth, height: flatHeight } = calculateBagFlatDimensions(inputs.bagN, inputs.bagC, inputs.bagH);

    if (flatWidth <= 0 || flatHeight <= 0 || inputs.quantity <= 0) return null;

    // 2. Find Best Paper Layout
    let candidates = materials;
    if (inputs.selectedMaterialGroupId) {
        candidates = candidates.filter(m => m.groupId === inputs.selectedMaterialGroupId);
    }
    if (inputs.selectedMaterialVariantId) {
        candidates = candidates.filter(m => m.id === inputs.selectedMaterialVariantId);
    }

    let bestLayout: BagAnalysisResult['layout'] | null = null;
    let bestMaterial: MaterialVariant | null = null;

    for (const variant of candidates) {
        const paperW = variant.width;
        const paperH = variant.height;

        const layout = calculateOptimalLayout(flatWidth, flatHeight, paperW, paperH);

        if (layout.items > 0) {
            // Optimization strategy: Maximize items per sheet first
            // In real world, we might optimize for Cost per Unit directly.
            if (!bestLayout || layout.items > bestLayout.items) {
                bestLayout = {
                    ...layout,
                    paperId: variant.id,
                    paperName: variant.name,
                    paperSize: { width: paperW, height: paperH }
                };
                bestMaterial = variant;
            }
        }
    }

    if (!bestLayout || !bestMaterial) {
        return null; // Cannot fit on any available paper
    }

    // 3. Calculate Sheets & Wastage
    const netSheets = Math.ceil(inputs.quantity / bestLayout.items);
    
    // Wastage Formula for Bags (More complex processing = more wastage)
    // Base 50 sheets + 3% for printing + 2% per finishing process
    const processCount = inputs.selectedProcessIds.length + 2; // +2 for default bag making (bế + dán)
    const wastageRate = 0.03 + (processCount * 0.01); 
    const wastageSheets = 50 + Math.ceil(netSheets * wastageRate);
    
    const totalSheets = netSheets + wastageSheets;

    // 4. Calculate Costs
    
    // A. Material
    const materialCost = totalSheets * bestMaterial.purchasePrice;

    // B. Printing (Assume Offset)
    // 4 plates for 4 colors (standard)
    const numberOfPlates = 4; 
    const platePrice = 150000; // Mock price
    const platesCost = numberOfPlates * platePrice;
    
    // Running cost (Công in)
    const runningPricePerSheet = totalSheets < 2000 ? 500 : 300; 
    const printCost = (totalSheets + 500) * runningPricePerSheet; // +500 sheets setup

    // C. Processing (Gia công)
    const finishingCosts: { id: string; name: string; cost: number }[] = [];
    
    // 1. Selected processes (Lamination, UV, etc.)
    const selectedProcs = processes.filter(p => inputs.selectedProcessIds.includes(p.id));
    
    selectedProcs.forEach(p => {
        let cost = 0;
        let isBatchApplied = false;

        // Hybrid Pricing Logic for Finishing
        // Special case for lamination (cán màng) where batch rule is based on area (m²)
        if (p.batchRules && p.batchRules.length > 0 && p.name.includes('Cán màng')) {
            const paperAreaSqM = (bestLayout.paperSize.width / 100) * (bestLayout.paperSize.height / 100);
            const totalArea = totalSheets * paperAreaSqM;

            const applicableRule = p.batchRules
                .filter(rule => totalArea < rule.maxQuantity) // Here, maxQuantity is interpreted as maxArea in m²
                .sort((a, b) => a.maxQuantity - b.maxQuantity)[0];

            if (applicableRule) {
                cost = applicableRule.price;
                isBatchApplied = true;
            }
        }

        // Fallback to standard calculation if no batch rule applies
        if (!isBatchApplied) {
            switch (p.calculationMethod) {
                case ProcessCalculationMethod.FixedLot:
                    cost = p.unitPrice;
                    break;
                case ProcessCalculationMethod.PerProduct:
                    cost = p.setupFee + (inputs.quantity * p.unitPrice);
                    break;
                case ProcessCalculationMethod.PerSheet:
                    if (p.pricingUnit === 'm²') {
                        const paperAreaSqM = (bestLayout.paperSize.width / 100) * (bestLayout.paperSize.height / 100);
                        const totalArea = totalSheets * paperAreaSqM;
                        cost = p.setupFee + (totalArea * p.unitPrice);
                    } else {
                        cost = p.setupFee + (totalSheets * p.unitPrice);
                    }
                    break;
            }
        }
        
        finishingCosts.push({ id: p.id, name: p.name, cost });
    });

    // 2. Mandatory Bag Processing (Mock values if not selected explicitly)
    // Die-Cutting (Bế) - Cost per 1000 items + Mold
    const moldCost = 350000 + (flatWidth * flatHeight * 50); // Mock complex formula based on area
    const dieCutRunCost = inputs.quantity * 150; 
    finishingCosts.push({ id: 'mold', name: 'Khuôn bế', cost: moldCost });
    finishingCosts.push({ id: 'diecut', name: 'Công bế', cost: dieCutRunCost });

    // Gluing (Dán thành phẩm)
    const gluingCost = inputs.quantity * 800; // 800d/cái
    finishingCosts.push({ id: 'gluing', name: 'Dán thành phẩm', cost: gluingCost });

    // Strings/Eyelets (Xỏ dây) - Assuming included or standard
    const stringCost = inputs.quantity * 500;
    finishingCosts.push({ id: 'strings', name: 'Dây & Khoen', cost: stringCost });

    const processCost = finishingCosts.reduce((sum, item) => sum + item.cost, 0);

    // D. Management & Total
    const subTotal = materialCost + platesCost + printCost + processCost;
    const managementCost = subTotal * ((companyInfo.managementFeePercentage || 5) / 100);
    
    const totalCost = subTotal + managementCost;
    
    // E. Pricing
    const applicableMarkup = getApplicableMarkup(totalCost, profitRules, companyInfo.defaultMarkup);
    const profitMargin = applicableMarkup / 100;
    const totalPrice = totalCost * (1 + profitMargin);
    const pricePerUnit = totalPrice / inputs.quantity;

    return {
        flatWidth,
        flatHeight,
        layout: bestLayout,
        netSheets,
        wastageSheets,
        totalSheets,
        costs: {
            materialCost,
            printCost,
            platesCost,
            runningCost: printCost,
            numberOfPlates,
            processCost,
            managementCost,
            totalCost,
            totalPrice,
            pricePerUnit,
            finishingCosts,
            applicableMarkup
        }
    };
};
