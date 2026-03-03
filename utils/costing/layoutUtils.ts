
export interface LayoutResult {
    items: number;
    rows: number;
    cols: number;
    rotated: boolean; // Item rotation
    paperRotated: boolean; // Paper rotation relative to input
    paperEfficiency: number;
    usedWidth: number;
    usedHeight: number;
    wasteArea: number;
}

export interface LayoutConfig {
    bleed: number;
    gap: number;
    gripper: number;
    safeMargin: number;
}

const EPSILON = 0.0001; // Tolerance for floating point comparisons

// Pure function to calculate how many items fit in a given rectangular area, trying both rotations of the item.
function getBestFitForArea(itemW: number, itemH: number, areaW: number, areaH: number, gap: number): { cols: number, rows: number, count: number, rotated: boolean } {
    if (itemW <= 0 || itemH <= 0 || areaW <= 0 || areaH <= 0) return { cols: 0, rows: 0, count: 0, rotated: false };
    
    // Case 1: Item not rotated (itemW x itemH)
    // Add EPSILON to handle exact fits (e.g. 42 / 42)
    const cols1 = Math.floor((areaW + gap + EPSILON) / (itemW + gap));
    const rows1 = Math.floor((areaH + gap + EPSILON) / (itemH + gap));
    const count1 = Math.max(0, cols1 * rows1);

    // Case 2: Item rotated (itemH x itemW)
    const cols2 = Math.floor((areaW + gap + EPSILON) / (itemH + gap));
    const rows2 = Math.floor((areaH + gap + EPSILON) / (itemW + gap));
    const count2 = Math.max(0, cols2 * rows2);

    // Optimization: Prefer not rotating item if counts are equal (often easier for finishing)
    if (count1 >= count2) {
        return { cols: cols1, rows: rows1, count: count1, rotated: false };
    } else {
        return { cols: cols2, rows: rows2, count: count2, rotated: true };
    }
}

/**
 * Calculates the maximum number of items that can be imposed on a sheet of paper.
 * Logic Update: Prioritize LANDSCAPE paper orientation (Width > Height) by default.
 * @param allowPaperRotation If false, forces the paper to stay in the input orientation (typically Landscape for Offset).
 */
export const calculateOptimalLayout = (
    finishedW: number, 
    finishedH: number, 
    inputPaperW: number, 
    inputPaperH: number,
    config: LayoutConfig = { bleed: 0.2, gap: 0.2, gripper: 1.0, safeMargin: 0.5 },
    allowPaperRotation: boolean = true
): LayoutResult => {
    
    // Calculate the full size of one item, including bleed on all sides
    const itemW = finishedW + (config.bleed * 2);
    const itemH = finishedH + (config.bleed * 2);

    // Determine Long and Short dimensions of the paper regardless of input order
    // Normalized Landscape: Width = Long, Height = Short
    const longDim = Math.max(inputPaperW, inputPaperH);
    const shortDim = Math.min(inputPaperW, inputPaperH);

    // --- Scenario 1: Landscape Paper (Width = Long, Height = Short) ---
    // Standard Offset: Gripper bites the long edge, so it reduces the Height (Short dim)
    const fitLandscape = getBestFitForArea(itemW, itemH, longDim, shortDim - config.gripper, config.gap);
    
    let bestFit = fitLandscape;
    let chosenPaperW = longDim;
    let chosenPaperH = shortDim;

    // --- Scenario 2: Portrait Paper (Width = Short, Height = Long) ---
    // Only check this if rotation is allowed.
    // For Offset, we typically disable this to ensure grain direction and feeding edge are fixed.
    if (allowPaperRotation) {
        // Standard Offset: Gripper bites the short edge (less common for large machines but possible)
        // Here Gripper reduces the Height (Long dim)
        const fitPortrait = getBestFitForArea(itemW, itemH, shortDim, longDim - config.gripper, config.gap);

        // DECISION LOGIC:
        // Only switch to Portrait if it yields STRICTLY MORE items.
        if (fitPortrait.count > fitLandscape.count) {
            bestFit = fitPortrait;
            chosenPaperW = shortDim;
            chosenPaperH = longDim;
        }
    }
    
    if (bestFit.count === 0) {
        return { items: 0, rows: 0, cols: 0, rotated: false, paperRotated: false, paperEfficiency: 0, usedWidth: 0, usedHeight: 0, wasteArea: inputPaperW * inputPaperH };
    }

    // Determine if we rotated the INPUT paper to achieve the chosen orientation
    // If input was 65x86 (Portrait) and we chose Landscape (86x65), then paperRotated = true.
    // If input was 86x65 (Landscape) and we chose Landscape (86x65), then paperRotated = false.
    const paperRotated = (inputPaperW !== chosenPaperW);

    const finalItemW = bestFit.rotated ? itemH : itemW;
    const finalItemH = bestFit.rotated ? itemW : itemH;
    
    const usedLayoutWidth = bestFit.cols > 0 ? (bestFit.cols * finalItemW) + ((bestFit.cols - 1) * config.gap) : 0;
    const usedLayoutHeight = bestFit.rows > 0 ? (bestFit.rows * finalItemH) + ((bestFit.rows - 1) * config.gap) : 0;
    
    // Calculate efficiency based on actual paper area used vs total paper area
    const paperArea = inputPaperW * inputPaperH;
    const itemsArea = bestFit.count * (finishedW * finishedH); // Net area of products (without bleed for efficiency stat)
    const efficiency = paperArea > 0 ? (itemsArea / paperArea) * 100 : 0;

    return {
        items: bestFit.count,
        rows: bestFit.rows,
        cols: bestFit.cols,
        rotated: bestFit.rotated, // Item rotation
        paperRotated: paperRotated, // Paper rotation relative to input
        paperEfficiency: efficiency,
        usedWidth: usedLayoutWidth,
        usedHeight: usedLayoutHeight,
        wasteArea: paperArea - itemsArea
    };
};
