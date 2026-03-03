
export type IconName = 'DashboardIcon' | 'ReportIcon' | 'StorefrontIcon' | 'ProductionOrderIcon' | 'ContentIcon' | 'BusinessIcon' | 'AccountingIcon' | 'CatalogIcon' | 'SettingsIcon' | 'CashFundIcon' | 'CreditCardIcon' | 'MenuIcon' | 'LinkIcon' | 'BoxIcon' | 'UserGroupIcon' | 'ScissorsIcon' | 'TruckIcon' | 'ChartBarIcon' | 'ChartPieIcon' | 'PlusIcon';

export enum QuoteStatus {
    Draft = 'Mới',
    Sent = 'Đã gửi',
    Approved = 'Đã chốt',
    Cancelled = 'Đã hủy',
    PendingApproval = 'Chờ duyệt'
}

export enum OrderStatus {
    PendingPayment = 'Chờ thanh toán',
    PartialPayment = 'Thanh toán 1 phần',
    Paid = 'Đã thanh toán',
    Shipped = 'Đang giao hàng',
    Delivered = 'Đã giao hàng',
    Cancelled = 'Đã hủy',
    Processing = 'Đang xử lý'
}

export enum ProductionOrderStatus {
    New = 'Mới',
    PendingDesign = 'Chờ thiết kế',
    InProgress = 'Đang sản xuất',
    Completed = 'Hoàn thành',
    Cancelled = 'Đã hủy'
}

export enum ContractStatus {
    Draft = 'Soạn thảo',
    Active = 'Đang hiệu lực',
    Expired = 'Đã hết hạn',
    Terminated = 'Đã thanh lý'
}

export enum SubscriptionStatus {
    Active = 'Active',
    Expired = 'Expired',
    Trial = 'Trial'
}

export enum CashTransactionType {
    Receipt = 'Phiếu thu',
    Payment = 'Phiếu chi'
}

export enum BankTransactionType {
    Receipt = 'Báo có',
    Payment = 'Ủy nhiệm chi'
}

export enum DocumentType {
    Quote = 'Quote',
    Order = 'Order',
    Invoice = 'Invoice',
    ProductionOrder = 'ProductionOrder',
    Contract = 'Contract',
    CashReceipt = 'CashReceipt',
    CashPayment = 'CashPayment',
    BankReceipt = 'BankReceipt',
    BankPayment = 'BankPayment',
    PurchaseOrder = 'PurchaseOrder',
    PaperConversion = 'PaperConversion',
    Supplier = 'Supplier',
    Customer = 'Customer',
    Product = 'Product',
    CustomerGroup = 'CustomerGroup',
    CostingRecord = 'CostingRecord',
    BillOfMaterial = 'BillOfMaterial',
    CashCount = 'CashCount'
}

export enum PricingModel {
    Fixed = 'Giá cố định',
    ByQuote = 'Theo Báo Giá'
}

export enum ProcessCalculationMethod {
    PerSheet = 'theo_to_in',
    PerProduct = 'theo_thanh_pham',
    FixedLot = 'theo_lo'
}

export enum PaymentMethod {
    Cash = 'Tiền mặt',
    BankTransfer = 'Chuyển khoản',
    CreditDebt = 'Công nợ',
    Card = 'Thẻ'
}

export enum PaymentStatus {
    Unpaid = 'Chưa thanh toán',
    Partial = 'Thanh toán 1 phần',
    Paid = 'Đã thanh toán'
}

export enum PurchaseOrderStatus {
    Draft = 'Nháp',
    Ordered = 'Đã đặt hàng',
    Received = 'Đã nhập kho',
    Cancelled = 'Đã hủy'
}

export enum TransactionType {
    ImportPO = 'import_po',
    ImportReturn = 'import_return',
    ExportProduction = 'export_production',
    ExportSale = 'export_sale',
    Adjustment = 'adjustment'
}

export enum OtherCostType {
    Fixed = 'co_dinh',
    Variable = 'bien_doi'
}

export enum Gender {
    Male = 'Nam',
    Female = 'Nữ',
    Other = 'Khác'
}

export enum MaritalStatus {
    Single = 'Độc thân',
    Married = 'Đã kết hôn'
}

export enum EmploymentStatus {
    Official = 'Chính thức',
    Probation = 'Thử việc',
    Resigned = 'Đã nghỉ việc'
}

// Permission
export const PERMISSION_NAMES = {
    // Users
    view_users: 'Xem danh sách nhân viên',
    create_users: 'Thêm nhân viên mới',
    edit_users: 'Chỉnh sửa nhân viên',
    delete_users: 'Xóa nhân viên',
    manage_users: 'Quản lý Nhân viên (Full)',

    // Dashboard & Reports
    view_reports: 'Xem báo cáo',
    
    // POS
    use_pos: 'Sử dụng POS',

    // Production
    manage_production_orders: 'Quản lý Lệnh sản xuất',

    // Quotes
    view_quotes: 'Xem Báo giá',
    create_quotes: 'Tạo Báo giá',
    edit_quotes: 'Sửa Báo giá',
    delete_quotes: 'Xóa Báo giá',
    approve_quotes: 'Duyệt Báo giá',

    // Contracts
    view_contracts: 'Xem Hợp đồng',
    create_contracts: 'Tạo Hợp đồng',
    edit_contracts: 'Sửa Hợp đồng',
    delete_contracts: 'Xóa Hợp đồng',
    manage_contracts: 'Quản lý Hợp đồng (Full)',

    // Orders
    view_orders: 'Xem Đơn hàng',
    create_orders: 'Tạo Đơn hàng',
    edit_orders: 'Sửa Đơn hàng',
    delete_orders: 'Xóa Đơn hàng',
    manage_orders: 'Quản lý Đơn hàng (Full)',

    // Customers
    view_customers: 'Xem Khách hàng',
    create_customers: 'Tạo Khách hàng',
    edit_customers: 'Sửa Khách hàng',
    delete_customers: 'Xóa Khách hàng',
    manage_customers: 'Quản lý Khách hàng (Full)',

    manage_promotions: 'Quản lý Khuyến mãi',

    // Accounting
    manage_invoices: 'Quản lý Hóa đơn',
    view_accounting: 'Xem Kế toán',
    manage_purchasing: 'Quản lý Mua hàng',
    manage_costing_rules: 'Quản lý Quy tắc tính giá',
    manage_cash_fund: 'Quản lý Quỹ tiền',
    view_commissions: 'Xem Hoa hồng',
    manage_profit_rules: 'Quản lý Quy tắc lợi nhuận',

    // Catalogs - Products
    view_products: 'Xem Sản phẩm',
    create_products: 'Tạo Sản phẩm',
    edit_products: 'Sửa Sản phẩm',
    delete_products: 'Xóa Sản phẩm',
    manage_bom: 'Quản lý BOM',

    // Catalogs - Materials
    view_materials: 'Xem Chất liệu',
    create_materials: 'Tạo Chất liệu',
    edit_materials: 'Sửa Chất liệu',
    delete_materials: 'Xóa Chất liệu',

    // Catalogs - Raw Materials
    view_raw_materials: 'Xem Vật tư',
    create_raw_materials: 'Tạo Vật tư',
    edit_raw_materials: 'Sửa Vật tư',
    delete_raw_materials: 'Xóa Vật tư',

    // Catalogs - Processes
    view_processes: 'Xem Gia công',
    create_processes: 'Tạo Gia công',
    edit_processes: 'Sửa Gia công',
    delete_processes: 'Xóa Gia công',

    // Catalogs - Print Methods
    view_print_methods: 'Xem Phương thức in',
    create_print_methods: 'Tạo Phương thức in',
    edit_print_methods: 'Sửa Phương thức in',
    delete_print_methods: 'Xóa Phương thức in',

    // Catalogs - Units
    view_units: 'Xem Đơn vị tính',
    create_units: 'Tạo Đơn vị',
    edit_units: 'Sửa Đơn vị',
    delete_units: 'Xóa Đơn vị',

    manage_inventory_conversion: 'Quản lý Cắt giấy',

    // System
    manage_company_info: 'Quản lý Thông tin công ty',
    manage_numbering_rules: 'Quản lý Đánh số',
    manage_menu: 'Quản lý Menu',
    manage_content: 'Quản lý Nội dung',
    manage_print_templates: 'Quản lý Mẫu in',
    manage_integration: 'Quản lý Kết nối',
    view_logs: 'Xem Nhật ký',
    manage_subscription: 'Quản lý Gói dịch vụ',
    manage_data_import: 'Nhập khẩu dữ liệu',
    manage_zalo_integration: 'Quản lý Zalo',
    manage_einvoice_integration: 'Quản lý Hóa đơn điện tử',
    manage_custom_modules: 'Quản lý Module tùy chỉnh'
} as const;

export type Permission = keyof typeof PERMISSION_NAMES;

export interface MenuItem {
    id: string;
    label: string;
    path: string;
    icon?: IconName;
    order: number;
    permission?: Permission;
    parentId?: string;
    badge?: string;
}

export interface UnitCategory {
    id: string;
    name: string;
}

export interface Unit {
    id: string;
    name: string;
    description?: string;
    categories?: string[];
}

export interface CustomerGroup {
    id: string;
    name: string;
    description?: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    customerGroupId?: string;
    address?: {
        street?: string;
        ward?: string;
        district?: string;
        province?: string;
    };
    company?: {
        name: string;
        taxId: string;
        address?: string;
    };
    gender?: Gender;
    birthday?: string;
    assignedToUserId?: string;
    creditBalance?: number;
    maxDebt?: number;
    dueDays?: number;
    note?: string;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    pricingModel: PricingModel;
    price?: number;
    initialStock: number;
    lowStockThreshold: number;
    unit?: string;
    imageUrl?: string;
}

export type ProductType = 'Tờ rơi' | 'Brochure' | 'Danh thiếp' | 'Túi giấy' | 'Khác' | string;

export interface MaterialGroup {
    id: string;
    name: string;
    description?: string;
}

export interface MaterialVariant {
    id: string;
    groupId: string;
    name: string;
    gsm: number;
    width: number;
    height: number;
    purchaseUnit: string;
    costingUnit: string;
    conversionRate: number;
    purchasePrice: number;
    sellingPrice: number;
    initialStock: number;
    lowStockThreshold: number;
    averageCost?: number;
}

export interface RawMaterialGroup {
    id: string;
    name: string;
    description?: string;
}

export interface RawMaterial {
    id: string;
    groupId: string;
    name: string;
    unit: string;
    purchasePrice: number;
    sellingPrice: number;
    initialStock: number;
    lowStockThreshold?: number;
}

export interface ProcessGroup {
    id: string;
    name: string;
    description?: string;
}

export interface PrintBatchRule {
    id: string;
    maxQuantity: number;
    price: number;
}

export interface ProcessConfiguration {
    id: string;
    groupId: string;
    name: string;
    calculationMethod: ProcessCalculationMethod;
    setupFee: number;
    unitPrice: number;
    pricingUnit: string;
    appliesTo: 'surface' | 'product';
    batchRules?: PrintBatchRule[];
}

export interface PrintMethodGroup {
    id: string;
    name: string;
    description?: string;
}

export interface PrintPriceConfiguration {
    id: string;
    groupId: string;
    name: string;
    numColors?: number;
    maxSheetWidth?: number;
    maxSheetHeight?: number;
    minSheetWidth?: number;
    minSheetHeight?: number;
    gripperEdge?: number;
    platePrice: number;
    setupPrice: number;
    impressionPrice: number;
    fixedWastageSheets: number;
    runningWastagePercent: number;
    batchRules?: PrintBatchRule[];
    purchaseUnit?: string;
    purchaseUnitPrice?: number;
}

export interface QuoteItem {
    id: string;
    productType: ProductType;
    productName: string;
    quantity: number;
    material?: MaterialVariant;
    totalPrice: number;
    details: any;
    processes?: ProcessConfiguration[];
    printPriceConfigurationId?: string;
    sourceProductId?: string;
    note?: string;
    parsedDetails?: any;
    unit?: string;
}

export interface Payment {
    id: string;
    amount: number;
    method: PaymentMethod;
    date: Date;
    recordedByUserId?: string;
    bankAccountId?: string;
}

export interface Quote {
    id: string;
    customer: Customer;
    items: QuoteItem[];
    totalAmount: number;
    vatAmount: number;
    status: QuoteStatus;
    createdAt: Date;
    expiryDate?: Date;
    statusHistory: { status: QuoteStatus; changedAt: Date; changedBy: User }[];
    payments?: Payment[];
}

export interface OrderItem {
    id: string;
    product: Product;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit?: string;
    note?: string;
    parsedDetails?: any;
}

export interface DeliveryInfo {
    recipientName: string;
    phone: string;
    address: string;
    fee: number;
    method: string;
}

export interface Order {
    id: string;
    quoteId?: string;
    customer: Customer;
    items: OrderItem[];
    totalAmount: number;
    vatAmount?: number;
    status: OrderStatus;
    orderDate: Date;
    delivery?: DeliveryInfo;
    promotionCode?: string;
    discountAmount?: number;
}

export interface Invoice {
    id: string;
    orderId: string;
    customer: Customer;
    totalAmount: number;
    payments: Payment[];
    invoiceDate: Date;
    dueDate: Date;
}

export interface ProductionOrder {
    id: string;
    orderId: string;
    productName: string;
    quantity: number;
    notes?: string;
    salespersonId: string;
    orderDate: Date;
    deliveryDate?: Date;
    status: ProductionOrderStatus;
    size?: string;
    material?: string;
    printColor?: string;
    design?: string;
    unit: string;
    finishing?: string;
    pages?: number;
    printMethod?: string;
    category?: string;
}

export interface ContractAttachment {
    id: string;
    name: string;
    url: string;
    size: number;
    uploadedAt: Date;
}

export interface Contract {
    id: string;
    title: string;
    customerId: string;
    contractValue: number;
    signingDate: Date;
    expiryDate?: Date;
    status: ContractStatus;
    content?: string;
    salespersonId?: string;
    attachments?: ContractAttachment[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    roleId: string;
    status: 'Active' | 'Disabled';
    joiningDate?: Date;
    password?: string;
    phone?: string;
    avatarUrl?: string;
    commissionPolicyId?: string;
    cmnd?: string;
    cmndDate?: string;
    cmndPlace?: string;
    birthday?: string;
    gender?: Gender;
    maritalStatus?: MaritalStatus;
    employmentStatus?: EmploymentStatus;
    allowAppAccess?: boolean;
    jobPosition?: string;
    probationDate?: string;
    officialDate?: string;
    salary?: number;
    deposit?: number;
    originalDocuments?: string;
    useCustomPermissions?: boolean;
    customPermissions?: Permission[];
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    isSystem?: boolean;
}

export interface BankAccount {
    id: string;
    accountNumber: string;
    bankName: string;
    accountHolder: string;
    bin?: string;
    openingBalance?: number;
    bankBranch?: string;
}

export interface CompanyInfo {
    name: string;
    taxCode: string;
    address: string;
    phone: string;
    email: string;
    logoUrl?: string;
    vatRate?: number;
    bankAccounts: BankAccount[];
    bankTransferContentTemplate?: string;
    defaultMarkup?: number;
    managementFeePercentage?: number;
    subscriptionPlanId?: string;
    subscriptionStatus?: SubscriptionStatus;
    subscriptionExpiryDate?: Date;
}

export interface CashTransaction {
    id: string;
    type: CashTransactionType;
    date: Date;
    amount: number;
    subject: string;
    reason: string;
    receiverName?: string;
    address?: string;
    referenceDoc?: string;
    sourceInvoiceId?: string;
}

export interface BankTransaction {
    id: string;
    type: BankTransactionType;
    date: Date;
    amount: number;
    subject: string;
    reason: string;
    bankAccountId: string;
    internalNote?: string;
    receiverName?: string;
    receiverBankName?: string;
    receiverBankAccount?: string;
    referenceDoc?: string;
    sourceInvoiceId?: string;
}

export interface NumberingRule {
    type: DocumentType;
    prefix: string;
    numberLength: number;
    suffix: string;
    nextNumber: number;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    billingCycle: string;
    features: { text: string; isNew?: boolean }[];
    subtext: string[];
    description: string;
    popular?: boolean;
}

export interface PrintCostComponent {
    id: string;
    name: string;
}

export interface CostingRecord {
    id: string;
    createdAt: Date;
    inputs: any;
    analysis: any;
    costs: any;
    scenarioComparison?: any[];
}

export type CustomFieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox';

export interface CustomObjectField {
    id: string;
    name: string;
    label: string;
    type: CustomFieldType;
    isRequired?: boolean;
    options?: string[];
}

export interface CustomObjectDefinition {
    id: string;
    name: string;
    pluralName: string;
    slug: string;
    fields: CustomObjectField[];
}

export interface CustomObjectRecord {
    id: string;
    definitionId: string;
    fields: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface WastageRule {
    id: string;
    threshold: number;
    sheets: number;
}

export interface PlatePrice {
    id: string;
    machineSize: string;
    price: number;
}

export interface RunningCostRule {
    id: string;
    threshold: number;
    pricePerSheet: number;
}

export interface PrintTemplate {
    id: string;
    name: string;
    type: string;
    paperSize: 'A4' | 'A5' | 'K80';
    updatedAt: Date;
    isActive: boolean;
    content: string;
}

export interface MeInvoiceConfig {
    taxCode: string;
    username: string;
    password?: string;
    isConnected: boolean;
    signingMethod?: 'esign' | 'usb';
    autoSendEmail?: boolean;
    issueFromPos?: boolean;
    issueTiming?: 'immediate' | 'after_delivery' | 'daily';
    autoIssueRule?: string;
    defaultInvoiceTemplate?: string;
    defaultBuyerName?: string;
    defaultCompanyName?: string;
}

export interface ZaloConfig {
    appId: string;
    secretKey: string;
    accessToken: string;
    isConnected: boolean;
}

export interface IntegrationSettings {
    websiteUrl: string;
    consumerKey: string;
    consumerSecret: string;
    isConnected: boolean;
    enableProductSync: boolean;
    enableInventorySync: boolean;
    enableOrderSync: boolean;
    webhookUrl: string;
    lastSyncAt?: Date;
    zaloSettings: ZaloConfig;
    meInvoiceSettings: MeInvoiceConfig;
}

export interface ProfitRule {
    id: string;
    minCost: number;
    maxCost: number | null;
    markup: number;
}

export type ZnsTemplateType = 'OrderConfirmation' | 'ShippingUpdate' | 'PaymentReminder' | 'DeliveryUpdate' | 'General';

export interface ZnsTemplate {
    id: string;
    name: string;
    templateId: string;
    type: ZnsTemplateType;
    content: string;
}

export interface Promotion {
    id: string;
    code: string;
    description: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderValue?: number;
    startDate: Date;
    endDate: Date | null;
    status: 'active' | 'expired' | 'disabled';
    timesUsed?: number;
    usageLimit?: number | null;
}

export interface AccessLogEntry {
    id: string;
    userId: string;
    timestamp: Date;
    action: string;
    ipAddress: string;
    status: 'Success' | 'Failure';
}

export interface ActivityLogEntry {
    id: string;
    userId: string;
    timestamp: Date;
    action: string;
    targetType: string;
    targetId?: string;
    description: string;
}

export interface SupplierBankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    bankBranch?: string;
}

export interface Supplier {
    id: string;
    name: string;
    type?: 'organization' | 'individual';
    contactPerson?: string;
    contactTitle?: 'Ông' | 'Bà' | 'Anh' | 'Chị';
    phone: string;
    email?: string;
    address?: string;
    taxId?: string;
    supplierGroupId?: string;
    totalDebt?: number;
    bankAccounts?: SupplierBankAccount[];
    avatarUrl?: string;
    contactPhone?: string;
    contactPosition?: string;
    contactAddress?: string;
    maxDebt?: number;
    dueDays?: number;
    status: 'active' | 'inactive';
}

export interface SupplierGroup {
    id: string;
    name: string;
    description?: string;
}

export interface POItem {
    id: string;
    type: 'material' | 'raw_material' | 'print_service';
    materialName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    materialId?: string;
    groupId?: string;
    notes?: string; 
}

export interface PurchaseOrder {
    id: string;
    supplierId: string;
    orderDate: Date;
    expectedDeliveryDate?: Date;
    items: POItem[];
    totalAmount: number;
    status: PurchaseOrderStatus;
    paidAmount?: number;
    paymentStatus: PaymentStatus;
    notes?: string;
}

export interface PaperConversion {
    id: string;
    date: Date;
    sourceMaterialId: string;
    sourceQuantity: number;
    sourceUnit: string;
    outputMaterialId: string;
    outputQuantity: number;
    wastage: number;
    notes: string;
    performedBy: string;
}

export interface InventoryTransaction {
    id: string;
    date: Date;
    itemId: string;
    itemType: 'material' | 'product' | 'raw_material';
    type: TransactionType;
    quantity: number;
    unit: string;
    refId?: string;
    notes?: string;
    performedBy: string;
}

export interface CommissionTier {
    id: string;
    revenueThreshold: number;
    commissionRate: number;
}

export interface CommissionPolicy {
    id: string;
    name: string;
    tiers: CommissionTier[];
}

export interface UserPaymentMethod {
    id: string;
    type: 'card' | 'bank';
    isDefault: boolean;
    card?: {
        brand: string;
        last4: string;
        expiryMonth: number;
        expiryYear: number;
    };
    bank?: {
        bankName: string;
        accountLast4: string;
    };
}

export interface BOMItem {
    id: string;
    itemId: string;
    type: 'material' | 'raw_material';
    quantity: number;
    unit: string;
}

export interface BillOfMaterial {
    id: string;
    productId: string;
    items: BOMItem[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface OtherCost {
    id: string;
    name: string;
    defaultPrice: number;
    unit: string;
    type: OtherCostType;
}

export interface SaleTab {
    id: string;
    name: string;
    cart: OrderItem[];
    selectedCustomerId: string;
    wantsVat: boolean;
    payment: {
        amount: number;
        method: PaymentMethod;
        bankAccountId?: string;
    };
    delivery: DeliveryInfo;
    editingNoteOrderItemId: string | null;
    editingPriceOrderItemId: string | null;
    isSplitLineMode: boolean;
    appliedPromotionCode?: string;
    discountAmount?: number;
}

export interface CashCountRecord {
    id: string;
    date: Date;
    systemBalance: number;
    actualBalance: number;
    difference: number;
    counts: Record<number, number>;
    note?: string;
    performedByUserId: string;
}

export interface DataContextType {
    quotes: Quote[];
    orders: Order[];
    invoices: Invoice[];
    customers: Customer[];
    customerGroups: CustomerGroup[];
    materialGroups: MaterialGroup[];
    materialVariants: MaterialVariant[];
    processGroups: ProcessGroup[];
    processConfigurations: ProcessConfiguration[];
    products: Product[];
    printMethodGroups: PrintMethodGroup[];
    printPriceConfigurations: PrintPriceConfiguration[];
    units: Unit[];
    unitCategories: UnitCategory[];
    productionOrders: ProductionOrder[];
    contracts: Contract[];
    users: User[];
    currentUser: User | null;
    companyInfo: CompanyInfo;
    cashTransactions: CashTransaction[];
    bankTransactions: BankTransaction[];
    numberingRules: NumberingRule[];
    plans: SubscriptionPlan[];
    navigationMenu: MenuItem[];
    roles: Role[];
    printCostComponents: PrintCostComponent[];
    costingRecords: CostingRecord[];
    rawMaterialGroups: RawMaterialGroup[];
    rawMaterials: RawMaterial[];
    customObjectDefinitions: CustomObjectDefinition[];
    customObjectRecords: CustomObjectRecord[];
    printTemplates: PrintTemplate[];
    znsTemplates: ZnsTemplate[];
    promotions: Promotion[];
    integrationSettings: IntegrationSettings;
    accessLogs: AccessLogEntry[];
    activityLogs: ActivityLogEntry[];
    suppliers: Supplier[];
    supplierGroups: SupplierGroup[];
    purchaseOrders: PurchaseOrder[];
    paperConversions: PaperConversion[];
    commissionPolicies: CommissionPolicy[];
    userPaymentMethods: UserPaymentMethod[];
    boms: BillOfMaterial[];
    openingCashBalance: number;
    cashCounts: CashCountRecord[];
    profitRules: ProfitRule[];
    otherCosts: OtherCost[];
    wastageRules: WastageRule[];
    platePrices: PlatePrice[];
    runningCostRules: RunningCostRule[];
    inventoryTransactions: InventoryTransaction[];
    
    // Permission map
    rolePermissions: Record<string, Permission[]>;
    userRoleChangeHistory: any[];

    // Methods
    login: (email: string, password: string) => boolean;
    logout: () => void;
    changePassword: (current: string, newPass: string) => boolean;
    requestPasswordReset: (email: string) => boolean;
    resetPassword: (newPass: string) => boolean;

    addQuote: (q: any) => Quote;
    updateQuote: (q: Quote) => void;
    updateQuoteStatus: (id: string, status: QuoteStatus) => void;
    getQuoteById: (id: string) => Quote | undefined;
    recordPaymentForQuote: (id: string, payment: any) => void;
    
    addOrderFromQuote: (quoteId: string) => Order | undefined;
    createOrderFromQuote: (quoteId: string) => Order | undefined;
    updateOrder: (o: Order) => void;
    getOrderById: (id: string) => Order | undefined;
    updateOrderStatus: (id: string, status: OrderStatus) => void;

    createInvoiceForOrder: (order: Order) => Invoice;
    updateInvoice: (i: Invoice) => void;
    clearPaymentsForInvoice: (id: string) => void;
    recordPayment: (invoiceId: string, payment: any) => void;

    addCustomer: (c: any) => Customer;
    updateCustomer: (c: Customer) => void;
    deleteCustomer: (id: string) => void;

    addCustomerGroup: (g: any) => CustomerGroup;
    updateCustomerGroup: (g: CustomerGroup) => void;
    deleteCustomerGroup: (id: string) => void;
    collectCustomerDebt: (customerId: string, amount: number, method: PaymentMethod, bankAccountId?: string, allocations?: Record<string, number>, details?: any) => void;

    createPosSale: (items: any[], customer: Customer, payment: any, total: number, vat: number, delivery?: any) => void;
    createOrderFromPos: (items: any[], customer: Customer, total: number, vat: number, payment: any, delivery?: any) => Order;
    createInvoiceForOrderPos: (order: Order) => Invoice;
    recordPaymentPos: (invoiceId: string, payment: any) => void;

    createQuoteFromPos: (items: any[], customer: Customer, total: number, vat: number) => Quote;
    updateQuoteFromPos: (id: string, items: any[], customer: Customer, total: number, vat: number) => void;

    addProductionOrder: (data: any) => void;
    updateProductionOrderStatus: (id: string, status: ProductionOrderStatus) => void;
    getProductionOrderById: (id: string) => ProductionOrder | undefined;
    updateProductionOrder: (po: ProductionOrder) => void;
    deleteProductionOrder: (id: string) => void;
    duplicateProductionOrder: (id: string) => void;

    addContract: (c: any) => Contract;
    updateContract: (c: Contract) => void;
    deleteContract: (id: string) => void;
    getContractById: (id: string) => Contract | undefined;
    renewContract: (id: string) => Contract | undefined;

    addUser: (u: any) => void;
    updateUser: (u: User) => void;
    updateRolePermissions: (roleId: string, perm: Permission, has: boolean) => void;
    addRole: (r: any) => void;
    updateRole: (r: Role) => void;
    deleteRole: (id: string) => void;

    updateCompanyInfo: (info: CompanyInfo) => void;
    updateNumberingRule: (rule: NumberingRule) => void;
    updateSubscriptionPlan: (id: string) => void;

    addProduct: (p: any) => Product;
    updateProduct: (p: Product) => void;
    deleteProduct: (id: string) => void;

    addMaterialGroup: (g: any) => MaterialGroup;
    updateMaterialGroup: (g: MaterialGroup) => void;
    deleteMaterialGroup: (id: string) => boolean;

    addMaterialVariant: (v: any) => MaterialVariant;
    updateMaterialVariant: (v: MaterialVariant) => void;
    deleteMaterialVariant: (id: string) => boolean;

    addProcessGroup: (g: any) => ProcessGroup;
    updateProcessGroup: (g: ProcessGroup) => void;
    deleteProcessGroup: (id: string) => boolean;

    addProcessConfiguration: (c: any) => ProcessConfiguration;
    updateProcessConfiguration: (c: ProcessConfiguration) => void;
    deleteProcessConfiguration: (id: string) => boolean;

    addPrintMethodGroup: (g: any) => PrintMethodGroup;
    updatePrintMethodGroup: (g: PrintMethodGroup) => void;
    deletePrintMethodGroup: (id: string) => boolean;

    addPrintPriceConfiguration: (c: any) => PrintPriceConfiguration;
    updatePrintPriceConfiguration: (c: PrintPriceConfiguration) => void;
    deletePrintPriceConfiguration: (id: string) => boolean;

    addUnit: (u: any) => Unit;
    updateUnit: (u: Unit) => void;
    deleteUnit: (id: string) => boolean;
    addUnitCategory: (cat: any) => UnitCategory;
    updateUnitCategory: (cat: UnitCategory) => void;
    deleteUnitCategory: (id: string) => boolean;

    addRawMaterialGroup: (g: any) => RawMaterialGroup;
    updateRawMaterialGroup: (g: RawMaterialGroup) => void;
    deleteRawMaterialGroup: (id: string) => boolean;

    addRawMaterial: (m: any) => RawMaterial;
    updateRawMaterial: (m: RawMaterial) => void;
    deleteRawMaterial: (id: string) => boolean;

    updateOpeningCashBalance: (amount: number) => void;
    updateBankOpeningBalances: (balances: any) => void;
    
    addCashCount: (c: any) => void;
    addCashTransaction: (t: any) => CashTransaction;
    addBankTransaction: (t: any) => BankTransaction;

    addCostingRecord: (r: any) => void;
    deleteCostingRecord: (id: string) => void;
    getCostingRecordById: (id: string) => CostingRecord | undefined;

    getCustomObjectDefinitionBySlug: (slug: string) => CustomObjectDefinition | undefined;
    getCustomObjectRecordById: (id: string) => CustomObjectRecord | undefined;
    addCustomObjectDefinition: (d: any) => CustomObjectDefinition;
    updateCustomObjectDefinition: (d: CustomObjectDefinition) => void;
    deleteCustomObjectDefinition: (id: string) => void;
    addCustomObjectRecord: (r: any) => CustomObjectRecord;
    updateCustomObjectRecord: (r: CustomObjectRecord) => void;
    deleteCustomObjectRecord: (id: string) => void;

    updatePrintTemplate: (t: PrintTemplate) => void;
    
    addProfitRule: (r: any) => ProfitRule;
    updateProfitRule: (r: ProfitRule) => void;
    deleteProfitRule: (id: string) => void;

    updateIntegrationSettings: (s: IntegrationSettings) => void;
    updateNavigationMenu: (m: MenuItem[]) => void;

    addZnsTemplate: (t: any) => ZnsTemplate;
    updateZnsTemplate: (t: ZnsTemplate) => void;
    deleteZnsTemplate: (id: string) => void;

    addPromotion: (p: any) => Promotion;
    updatePromotion: (p: Promotion) => void;
    deletePromotion: (id: string) => void;

    addSupplier: (s: any) => Supplier;
    updateSupplier: (s: Supplier) => void;
    deleteSupplier: (id: string) => void;
    addSupplierGroup: (g: any) => SupplierGroup;
    updateSupplierGroup: (g: SupplierGroup) => void;
    deleteSupplierGroup: (id: string) => void;

    addPurchaseOrder: (po: any) => void;
    updatePurchaseOrder: (po: PurchaseOrder) => void;
    deletePurchaseOrder: (id: string) => void;
    updatePurchaseOrderStatus: (id: string, status: PurchaseOrderStatus) => void;
    payPurchaseOrder: (id: string, amount: number, method: PaymentMethod, bankAccountId?: string) => void;

    addPaperConversion: (pc: any) => void;

    addUserPaymentMethod: (m: any) => void;
    updateUserPaymentMethod: (m: UserPaymentMethod) => void;
    deleteUserPaymentMethod: (id: string) => void;

    addCommissionPolicy: (p: any) => void;
    updateCommissionPolicy: (p: CommissionPolicy) => void;
    deleteCommissionPolicy: (id: string) => void;

    addBOM: (bom: any) => void;
    updateBOM: (bom: BillOfMaterial) => void;
    deleteBOM: (id: string) => void;

    addOtherCost: (c: any) => OtherCost;
    updateOtherCost: (c: OtherCost) => void;
    deleteOtherCost: (id: string) => void;

    addWastageRule: (r: any) => void;
    updateWastageRule: (r: WastageRule) => void;
    deleteWastageRule: (id: string) => void;

    addPlatePrice: (p: any) => void;
    updatePlatePrice: (p: PlatePrice) => void;
    deletePlatePrice: (id: string) => void;

    addRunningCostRule: (r: any) => void;
    updateRunningCostRule: (r: RunningCostRule) => void;
    deleteRunningCostRule: (id: string) => void;
}
