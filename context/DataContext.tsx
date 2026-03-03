
import React, { createContext, useState, useContext, useEffect, useMemo, ReactNode } from 'react';
import {
    Quote, Order, Invoice, Customer, CustomerGroup, MaterialGroup, MaterialVariant,
    ProcessGroup, ProcessConfiguration, Product, PrintMethodGroup, PrintPriceConfiguration,
    Unit, UnitCategory, ProductionOrder, Contract, User, CompanyInfo, CashTransaction, BankTransaction,
    NumberingRule, SubscriptionPlan, MenuItem, PrintCostComponent, CostingRecord,
    RawMaterialGroup, RawMaterial, CustomObjectDefinition, CustomObjectRecord,
    WastageRule, PlatePrice, RunningCostRule, PrintTemplate, IntegrationSettings, ProfitRule,
    ZnsTemplate, Promotion, AccessLogEntry, ActivityLogEntry, Role, Supplier, SupplierGroup,
    PurchaseOrder, PaperConversion, PurchaseOrderStatus, PaymentMethod, PaymentStatus,
    InventoryTransaction, TransactionType, CommissionPolicy, CommissionTier, UserPaymentMethod,
    BillOfMaterial, OtherCost, PricingModel, QuoteStatus, OrderStatus,
    ProductionOrderStatus, ContractStatus, SubscriptionStatus, CashTransactionType,
    BankTransactionType, DocumentType, Permission, DataContextType,
    Payment,
    OtherCostType,
    OrderItem
} from '../types';

import {
    MOCK_QUOTES, MOCK_ORDERS, MOCK_INVOICES, MOCK_CUSTOMERS, MOCK_CUSTOMER_GROUPS,
    MOCK_MATERIAL_GROUPS, MOCK_MATERIAL_VARIANTS, MOCK_PROCESS_GROUPS, MOCK_PROCESS_CONFIGURATIONS,
    MOCK_PRODUCTS, MOCK_PRINT_METHOD_GROUPS, MOCK_PRINT_PRICE_CONFIGURATIONS, MOCK_UNITS,
    MOCK_UNIT_CATEGORIES, MOCK_PRODUCTION_ORDERS, MOCK_CONTRACTS, MOCK_USERS, MOCK_COMPANY_INFO,
    MOCK_CASH_TRANSACTIONS, MOCK_BANK_TRANSACTIONS, MOCK_NUMBERING_RULES, MOCK_PLANS,
    MOCK_NAVIGATION_MENU, MOCK_ROLES, MOCK_PRINT_COST_COMPONENTS, MOCK_COSTING_RECORDS,
    MOCK_RAW_MATERIAL_GROUPS, MOCK_RAW_MATERIALS, MOCK_CUSTOM_OBJECT_DEFINITIONS,
    MOCK_CUSTOM_OBJECT_RECORDS, MOCK_PRINT_TEMPLATES, MOCK_INTEGRATION_SETTINGS,
    MOCK_ZNS_TEMPLATES, MOCK_PROMOTIONS, MOCK_ACCESS_LOGS, MOCK_ACTIVITY_LOGS,
    MOCK_SUPPLIERS, MOCK_SUPPLIER_GROUPS, MOCK_PURCHASE_ORDERS, MOCK_PAPER_CONVERSIONS,
    MOCK_COMMISSION_POLICIES, MOCK_USER_PAYMENT_METHODS, MOCK_BOMS, MOCK_OTHER_COSTS,
    MOCK_WASTAGE_RULES, MOCK_PLATE_PRICES, MOCK_RUNNING_COST_RULES, MOCK_PROFIT_RULES
} from '../constants';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- State Initialization ---
    const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
    const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
    const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
    const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
    const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>(MOCK_CUSTOMER_GROUPS);
    const [materialGroups, setMaterialGroups] = useState<MaterialGroup[]>(MOCK_MATERIAL_GROUPS);
    const [materialVariants, setMaterialVariants] = useState<MaterialVariant[]>(MOCK_MATERIAL_VARIANTS);
    const [processGroups, setProcessGroups] = useState<ProcessGroup[]>(MOCK_PROCESS_GROUPS);
    const [processConfigurations, setProcessConfigurations] = useState<ProcessConfiguration[]>(MOCK_PROCESS_CONFIGURATIONS);
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [printMethodGroups, setPrintMethodGroups] = useState<PrintMethodGroup[]>(MOCK_PRINT_METHOD_GROUPS);
    const [printPriceConfigurations, setPrintPriceConfigurations] = useState<PrintPriceConfiguration[]>(MOCK_PRINT_PRICE_CONFIGURATIONS);
    const [units, setUnits] = useState<Unit[]>(MOCK_UNITS);
    const [unitCategories, setUnitCategories] = useState<UnitCategory[]>(MOCK_UNIT_CATEGORIES);
    const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(MOCK_PRODUCTION_ORDERS);
    const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]); 
    const [companyInfo, setCompanyInfoState] = useState<CompanyInfo>(MOCK_COMPANY_INFO);
    const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(MOCK_CASH_TRANSACTIONS);
    const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(MOCK_BANK_TRANSACTIONS);
    const [numberingRules, setNumberingRules] = useState<NumberingRule[]>(MOCK_NUMBERING_RULES);
    const [plans, setPlans] = useState<SubscriptionPlan[]>(MOCK_PLANS);
    const [navigationMenu, setNavigationMenu] = useState<MenuItem[]>(MOCK_NAVIGATION_MENU);
    const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
    const [printCostComponents, setPrintCostComponents] = useState<PrintCostComponent[]>(MOCK_PRINT_COST_COMPONENTS);
    const [costingRecords, setCostingRecords] = useState<CostingRecord[]>(MOCK_COSTING_RECORDS);
    const [rawMaterialGroups, setRawMaterialGroups] = useState<RawMaterialGroup[]>(MOCK_RAW_MATERIAL_GROUPS);
    const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(MOCK_RAW_MATERIALS);
    const [customObjectDefinitions, setCustomObjectDefinitions] = useState<CustomObjectDefinition[]>(MOCK_CUSTOM_OBJECT_DEFINITIONS);
    const [customObjectRecords, setCustomObjectRecords] = useState<CustomObjectRecord[]>(MOCK_CUSTOM_OBJECT_RECORDS);
    const [printTemplates, setPrintTemplates] = useState<PrintTemplate[]>(MOCK_PRINT_TEMPLATES);
    const [znsTemplates, setZnsTemplates] = useState<ZnsTemplate[]>(MOCK_ZNS_TEMPLATES);
    const [promotions, setPromotions] = useState<Promotion[]>(MOCK_PROMOTIONS);
    const [integrationSettings, setIntegrationSettingsState] = useState<IntegrationSettings>(MOCK_INTEGRATION_SETTINGS);
    const [accessLogs, setAccessLogs] = useState<AccessLogEntry[]>(MOCK_ACCESS_LOGS);
    const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(MOCK_ACTIVITY_LOGS);
    const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
    const [supplierGroups, setSupplierGroups] = useState<SupplierGroup[]>(MOCK_SUPPLIER_GROUPS);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
    const [paperConversions, setPaperConversions] = useState<PaperConversion[]>(MOCK_PAPER_CONVERSIONS);
    const [commissionPolicies, setCommissionPolicies] = useState<CommissionPolicy[]>(MOCK_COMMISSION_POLICIES);
    const [userPaymentMethods, setUserPaymentMethods] = useState<UserPaymentMethod[]>(MOCK_USER_PAYMENT_METHODS);
    const [boms, setBoms] = useState<BillOfMaterial[]>(MOCK_BOMS);
    const [openingCashBalance, setOpeningCashBalanceState] = useState<number>(100000000);
    const [cashCounts, setCashCounts] = useState<any[]>([]); 
    const [profitRules, setProfitRules] = useState<ProfitRule[]>(MOCK_PROFIT_RULES);
    const [otherCosts, setOtherCosts] = useState<OtherCost[]>(MOCK_OTHER_COSTS);
    const [wastageRules, setWastageRules] = useState<WastageRule[]>(MOCK_WASTAGE_RULES);
    const [platePrices, setPlatePrices] = useState<PlatePrice[]>(MOCK_PLATE_PRICES);
    const [runningCostRules, setRunningCostRules] = useState<RunningCostRule[]>(MOCK_RUNNING_COST_RULES);
    const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
    
    const [userRoleChangeHistory, setUserRoleChangeHistory] = useState<any[]>([]);

    // Computed Role Permissions
    const rolePermissions = useMemo(() => {
        const perms: Record<string, Permission[]> = {};
        roles.forEach(r => perms[r.id] = r.permissions);
        return perms;
    }, [roles]);

    // --- Actions ---

    const login = (email: string, password: string) => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentUser(user);
            setAccessLogs([...accessLogs, { id: `log_${Date.now()}`, userId: user.id, timestamp: new Date(), action: 'Login', ipAddress: '127.0.0.1', status: 'Success' }]);
            return true;
        }
        setAccessLogs([...accessLogs, { id: `log_${Date.now()}`, userId: 'unknown', timestamp: new Date(), action: 'Failed Login', ipAddress: '127.0.0.1', status: 'Failure' }]);
        return false;
    };

    const logout = () => {
        if (currentUser) {
            setAccessLogs([...accessLogs, { id: `log_${Date.now()}`, userId: currentUser.id, timestamp: new Date(), action: 'Logout', ipAddress: '127.0.0.1', status: 'Success' }]);
        }
        setCurrentUser(null);
    };

    const changePassword = (currentPassword: string, newPassword: string) => {
        if (!currentUser) return false;
        if (currentUser.password === currentPassword) {
            const updatedUser = { ...currentUser, password: newPassword };
            updateUser(updatedUser);
            return true;
        }
        return false;
    };

    const requestPasswordReset = (email: string) => {
        console.log(`Password reset requested for ${email}`);
        return true;
    };

    const resetPassword = (newPassword: string) => {
        if (currentUser) {
            updateUser({...currentUser, password: newPassword});
            return true;
        }
        const admin = users.find(u => u.roleId === 'role_admin');
        if (admin) {
            updateUser({...admin, password: newPassword});
            return true;
        }
        return false;
    };

    const generateId = (prefix: string) => `${prefix}${Date.now()}`;
    
    // Centralized Document ID Generator based on Numbering Rules
    const generateDocumentId = (type: DocumentType): string => {
        // Find the rule for this document type
        const ruleIndex = numberingRules.findIndex(r => r.type === type);
        
        // Fallback if rule not found: Try to find any rule that matches or use timestamp
        if (ruleIndex === -1) {
            console.warn(`No numbering rule found for type: ${type}. Using timestamp.`);
             const prefixMap: Record<string, string> = {
                [DocumentType.Order]: 'DH',
                [DocumentType.Quote]: 'BG',
                [DocumentType.Invoice]: 'HD',
                [DocumentType.ProductionOrder]: 'LSX',
                [DocumentType.Contract]: 'HDG',
                [DocumentType.CashReceipt]: 'PT',
                [DocumentType.CashPayment]: 'PC',
                [DocumentType.BankReceipt]: 'NT',
                [DocumentType.BankPayment]: 'NC',
                [DocumentType.PurchaseOrder]: 'PO',
                [DocumentType.Supplier]: 'NCC',
                [DocumentType.Customer]: 'KH',
                [DocumentType.Product]: 'SP',
                [DocumentType.BillOfMaterial]: 'BOM',
            };
            const prefix = prefixMap[type] || 'DOC';
            return `${prefix}${Date.now()}`;
        }

        const rule = numberingRules[ruleIndex];
        // Construct ID: Prefix + Padded Number + Suffix
        const numberPart = String(rule.nextNumber).padStart(rule.numberLength, '0');
        const newId = `${rule.prefix}${numberPart}${rule.suffix || ''}`;

        // Update the rule for next time (using functional update to ensure no race conditions in state)
        setNumberingRules(prevRules => {
            const newRules = [...prevRules];
            const idx = newRules.findIndex(r => r.type === type);
            if (idx !== -1) {
                newRules[idx] = { ...newRules[idx], nextNumber: newRules[idx].nextNumber + 1 };
            }
            return newRules;
        });

        return newId;
    };


    // --- Quotes ---
    const addQuote = (quoteData: any) => {
        const newQuote: Quote = { 
            ...quoteData, 
            id: generateDocumentId(DocumentType.Quote), 
            status: QuoteStatus.Draft, 
            createdAt: new Date() 
        };
        setQuotes([newQuote, ...quotes]);
        return newQuote;
    };
    const updateQuote = (quote: Quote) => setQuotes(quotes.map(q => q.id === quote.id ? quote : q));
    const updateQuoteStatus = (id: string, status: QuoteStatus) => {
        setQuotes(quotes.map(q => q.id === id ? { ...q, status, statusHistory: [...q.statusHistory, { status, changedAt: new Date(), changedBy: currentUser! }] } : q));
    };
    const getQuoteById = (id: string) => quotes.find(q => q.id === id);
    const recordPaymentForQuote = (quoteId: string, paymentData: any) => {
        const quote = quotes.find(q => q.id === quoteId);
        if (quote) {
            const newPayment = { ...paymentData, id: generateId('PAY'), date: new Date() };
            const updatedPayments = [...(quote.payments || []), newPayment];
            updateQuote({ ...quote, payments: updatedPayments });
            addCashTransaction({ type: CashTransactionType.Receipt, amount: paymentData.amount, subject: quote.customer.name, reason: `Thu tiền cọc BG ${quote.id}`, sourceInvoiceId: quote.id });
        }
    };

    // --- Orders ---
    const addOrderFromQuote = (quoteId: string) => {
        const quote = quotes.find(q => q.id === quoteId);
        if (!quote) return undefined;
        const newOrder: Order = {
            id: generateDocumentId(DocumentType.Order),
            quoteId: quote.id,
            customer: quote.customer,
            items: quote.items.map(i => ({
                id: generateId('OI'),
                product: { id: i.productName, name: i.productName, sku: '', pricingModel: PricingModel.ByQuote, initialStock: 0, lowStockThreshold: 0 },
                quantity: i.quantity,
                unitPrice: i.totalPrice / i.quantity,
                totalPrice: i.totalPrice,
                unit: (i.details as any).unit || i.material?.costingUnit || 'cái',
            })),
            totalAmount: quote.totalAmount,
            vatAmount: quote.vatAmount,
            status: OrderStatus.PendingPayment,
            orderDate: new Date()
        };
        setOrders([newOrder, ...orders]);
        return newOrder;
    };
    const updateOrder = (order: Order) => setOrders(orders.map(o => o.id === order.id ? order : o));
    const getOrderById = (id: string) => orders.find(o => o.id === id);
    const updateOrderStatus = (id: string, status: OrderStatus) => setOrders(orders.map(o => o.id === id ? { ...o, status } : o));

    // --- Invoices ---
    const createInvoiceForOrder = (order: Order) => {
        const existingInvoice = invoices.find(inv => inv.orderId === order.id);
        if (existingInvoice) return existingInvoice;

        const newInvoice: Invoice = {
            id: generateDocumentId(DocumentType.Invoice),
            orderId: order.id,
            customer: order.customer,
            totalAmount: order.totalAmount,
            payments: [],
            invoiceDate: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + (order.customer.dueDays || 0)))
        };
        setInvoices([newInvoice, ...invoices]);
        return newInvoice;
    };
    const updateInvoice = (inv: Invoice) => setInvoices(invoices.map(i => i.id === inv.id ? inv : i));
    const clearPaymentsForInvoice = (id: string) => {
        setInvoices(invoices.map(i => i.id === id ? { ...i, payments: [] } : i));
    };
    const recordPayment = (invoiceId: string, paymentData: Omit<Payment, 'id' | 'date'>) => {
        const newPayment: Payment = { ...paymentData, id: generateId('PAY'), date: new Date() };
        setInvoices(invoices.map(i => i.id === invoiceId ? { ...i, payments: [...i.payments, newPayment] } : i));
        
        const invoice = invoices.find(i => i.id === invoiceId);
        if (invoice) {
            const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + newPayment.amount;
            if (totalPaid >= invoice.totalAmount) {
                updateOrderStatus(invoice.orderId, OrderStatus.Paid);
            } else if (totalPaid > 0) {
                updateOrderStatus(invoice.orderId, OrderStatus.PartialPayment);
            }
            
            if (paymentData.method === PaymentMethod.Cash) {
                addCashTransaction({ type: CashTransactionType.Receipt, amount: paymentData.amount, subject: invoice.customer.name, reason: `Thu tiền HD ${invoice.id}`, sourceInvoiceId: invoice.id });
            } else if (paymentData.method === PaymentMethod.BankTransfer && paymentData.bankAccountId) {
                addBankTransaction({ type: BankTransactionType.Receipt, amount: paymentData.amount, subject: invoice.customer.name, reason: `Thu tiền HD ${invoice.id} CK`, bankAccountId: paymentData.bankAccountId, sourceInvoiceId: invoice.id });
            }
        }
    };

    // --- Customers ---
    const addCustomer = (c: any) => {
        const newCustomer = { ...c, id: generateDocumentId(DocumentType.Customer) };
        setCustomers([...customers, newCustomer]);
        return newCustomer;
    };
    const updateCustomer = (c: Customer) => setCustomers(customers.map(cust => cust.id === c.id ? c : cust));
    const deleteCustomer = (id: string) => setCustomers(customers.filter(c => c.id !== id));
    const addCustomerGroup = (g: any) => { const newG = { ...g, id: generateDocumentId(DocumentType.CustomerGroup) }; setCustomerGroups([...customerGroups, newG]); return newG; };
    const updateCustomerGroup = (g: CustomerGroup) => setCustomerGroups(customerGroups.map(grp => grp.id === g.id ? g : grp));
    const deleteCustomerGroup = (id: string) => setCustomerGroups(customerGroups.filter(g => g.id !== id));
    const collectCustomerDebt = (customerId: string, amount: number, method: PaymentMethod, bankAccountId?: string, allocations?: Record<string, number>, details?: { description: string, referenceDoc: string }) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer && customer.creditBalance) {
            updateCustomer({ ...customer, creditBalance: customer.creditBalance - amount });
            if (method === PaymentMethod.Cash) {
                addCashTransaction({ type: CashTransactionType.Receipt, amount, subject: customer.name, reason: details?.description || 'Thu nợ', referenceDoc: details?.referenceDoc });
            } else if (method === PaymentMethod.BankTransfer && bankAccountId) {
                addBankTransaction({ type: BankTransactionType.Receipt, amount, subject: customer.name, reason: details?.description || 'Thu nợ CK', bankAccountId, referenceDoc: details?.referenceDoc });
            }
        }
    };

    // --- POS ---
    const createPosSale = (items: OrderItem[], customer: Customer, payment: any, total: number, vat: number, delivery?: any) => {
        createOrderFromPos(items, customer, total, vat, payment, delivery);
    };
    const createOrderFromPos = (items: OrderItem[], customer: Customer, total: number, vat: number, payment: any, delivery?: any) => {
        const newOrder: Order = {
            id: generateDocumentId(DocumentType.Order),
            items,
            customer,
            totalAmount: total,
            vatAmount: vat,
            status: payment.amount >= total ? OrderStatus.Paid : (payment.amount > 0 ? OrderStatus.PartialPayment : OrderStatus.PendingPayment),
            orderDate: new Date(),
            delivery
        };
        setOrders([newOrder, ...orders]);
        const invoice = createInvoiceForOrder(newOrder);
        if (payment.amount > 0) {
            recordPayment(invoice.id, { amount: payment.amount, method: payment.method, bankAccountId: payment.bankAccountId, recordedByUserId: currentUser?.id || '' });
        }
        return newOrder;
    };
    const createQuoteFromPos = (items: OrderItem[], customer: Customer, total: number, vat: number) => {
        const newQuote: Quote = {
             id: generateDocumentId(DocumentType.Quote),
             customer,
             items: items.map(i => ({
                 id: i.id,
                 productName: i.product.name,
                 productType: 'Khác',
                 quantity: i.quantity,
                 totalPrice: i.totalPrice,
                 details: { unitPrice: i.unitPrice },
                 sourceProductId: i.product.id
             })),
             totalAmount: total,
             vatAmount: vat,
             status: QuoteStatus.Draft,
             createdAt: new Date(),
             statusHistory: []
        };
        setQuotes([newQuote, ...quotes]);
        return newQuote;
    };
    const updateQuoteFromPos = (id: string, items: OrderItem[], customer: Customer, total: number, vat: number) => {
        const updatedQuote: Quote = {
            id,
            customer,
             items: items.map(i => ({
                 id: i.id,
                 productName: i.product.name,
                 productType: 'Khác',
                 quantity: i.quantity,
                 totalPrice: i.totalPrice,
                 details: { unitPrice: i.unitPrice },
                 sourceProductId: i.product.id
             })),
             totalAmount: total,
             vatAmount: vat,
             status: QuoteStatus.Draft,
             createdAt: new Date(),
             statusHistory: []
        };
        updateQuote(updatedQuote);
    };

    // --- Production ---
    const addProductionOrder = (data: Partial<ProductionOrder>) => {
        const newId = generateDocumentId(DocumentType.ProductionOrder);
        setProductionOrders([...productionOrders, { 
            id: newId, 
            orderId: data.orderId || '',
            productName: data.productName || 'Sản phẩm mới',
            quantity: data.quantity || 0,
            status: ProductionOrderStatus.New, 
            orderDate: data.orderDate || new Date(),
            salespersonId: data.salespersonId || currentUser?.id || '',
            unit: data.unit || 'cái',
            // Copy optional fields
            notes: data.notes,
            size: data.size,
            material: data.material,
            printColor: data.printColor,
            design: data.design,
            finishing: data.finishing,
            pages: data.pages,
            printMethod: data.printMethod,
        }]);
    };
    const updateProductionOrderStatus = (id: string, status: ProductionOrderStatus) => setProductionOrders(productionOrders.map(p => p.id === id ? { ...p, status } : p));
    const getProductionOrderById = (id: string) => productionOrders.find(p => p.id === id);
    const updateProductionOrder = (order: ProductionOrder) => setProductionOrders(productionOrders.map(p => p.id === order.id ? order : p));
    const deleteProductionOrder = (id: string) => setProductionOrders(productionOrders.filter(p => p.id !== id));
    const duplicateProductionOrder = (id: string) => {
        const original = getProductionOrderById(id);
        if (original) {
            // Use 'addProductionOrder' to ensure new ID generation
            addProductionOrder({ ...original, orderDate: new Date(), status: ProductionOrderStatus.New });
        }
    };

    // --- Contracts ---
    const addContract = (data: any) => { 
        const c = { 
            ...data, 
            id: generateDocumentId(DocumentType.Contract) 
        }; 
        setContracts([c, ...contracts]); 
        return c; 
    };
    const updateContract = (data: Contract) => setContracts(contracts.map(c => c.id === data.id ? data : c));
    const deleteContract = (id: string) => setContracts(contracts.filter(c => c.id !== id));
    const getContractById = (id: string) => contracts.find(c => c.id === id);
    const renewContract = (id: string) => {
        const oldContract = getContractById(id);
        if (!oldContract) return undefined;
        const newContract = { 
            ...oldContract, 
            id: generateDocumentId(DocumentType.Contract), 
            title: `${oldContract.title} (Gia hạn)`, 
            signingDate: new Date(), 
            status: ContractStatus.Draft 
        };
        setContracts([newContract, ...contracts]);
        return newContract;
    };

    // --- Users & Roles ---
    const addUser = (data: any) => setUsers([...users, { ...data, id: generateId('NV'), joiningDate: new Date() }]);
    const updateUser = (data: User) => setUsers(users.map(u => u.id === data.id ? data : u));
    const updateRolePermissions = (roleId: string, perm: Permission, has: boolean) => {
        setRoles(roles.map(r => {
            if (r.id === roleId) {
                const newPerms = has ? [...r.permissions, perm] : r.permissions.filter(p => p !== perm);
                return { ...r, permissions: newPerms };
            }
            return r;
        }));
    };
    const addRole = (r: any) => setRoles([...roles, { ...r, id: generateId('ROLE'), permissions: [] }]);
    const updateRole = (role: Role) => setRoles(roles.map(r => r.id === role.id ? role : r));
    const deleteRole = (id: string) => setRoles(roles.filter(r => r.id !== id));

    // --- Settings ---
    const updateCompanyInfo = (info: CompanyInfo) => setCompanyInfoState(info);
    const updateNumberingRule = (rule: NumberingRule) => setNumberingRules(numberingRules.map(r => r.type === rule.type ? rule : r));
    const updateSubscriptionPlan = (planId: string) => setCompanyInfoState({ ...companyInfo, subscriptionPlanId: planId });
    
    // --- Products & Catalogs ---
    const addProduct = (p: any) => { const prod = { ...p, id: generateDocumentId(DocumentType.Product) }; setProducts([...products, prod]); return prod; };
    const updateProduct = (p: Product) => setProducts(products.map(prod => prod.id === p.id ? p : prod));
    const deleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));
    
    const addMaterialGroup = (g: any) => { const ng = { ...g, id: generateId('MG') }; setMaterialGroups([...materialGroups, ng]); return ng; };
    const updateMaterialGroup = (g: MaterialGroup) => setMaterialGroups(materialGroups.map(grp => grp.id === g.id ? g : grp));
    const deleteMaterialGroup = (id: string) => { setMaterialGroups(materialGroups.filter(g => g.id !== id)); return true; };
    
    const addMaterialVariant = (v: any) => { const nv = { ...v, id: generateId('MV') }; setMaterialVariants([...materialVariants, nv]); return nv; };
    const updateMaterialVariant = (v: MaterialVariant) => setMaterialVariants(materialVariants.map(mv => mv.id === v.id ? v : mv));
    const deleteMaterialVariant = (id: string) => { setMaterialVariants(materialVariants.filter(v => v.id !== id)); return true; };
    
    const addProcessGroup = (g: any) => { const ng = { ...g, id: generateId('PG') }; setProcessGroups([...processGroups, ng]); return ng; };
    const updateProcessGroup = (g: ProcessGroup) => setProcessGroups(processGroups.map(pg => pg.id === g.id ? g : pg));
    const deleteProcessGroup = (id: string) => { setProcessGroups(processGroups.filter(g => g.id !== id)); return true; };

    const addProcessConfiguration = (c: any) => { const nc = { ...c, id: generateId('PC') }; setProcessConfigurations([...processConfigurations, nc]); return nc; };
    const updateProcessConfiguration = (c: ProcessConfiguration) => setProcessConfigurations(processConfigurations.map(pc => pc.id === c.id ? c : pc));
    const deleteProcessConfiguration = (id: string) => { setProcessConfigurations(processConfigurations.filter(c => c.id !== id)); return true; };

    const addPrintMethodGroup = (g: any) => { const ng = { ...g, id: generateId('PMG') }; setPrintMethodGroups([...printMethodGroups, ng]); return ng; };
    const updatePrintMethodGroup = (g: PrintMethodGroup) => setPrintMethodGroups(printMethodGroups.map(pg => pg.id === g.id ? g : pg));
    const deletePrintMethodGroup = (id: string) => { setPrintMethodGroups(printMethodGroups.filter(g => g.id !== id)); return true; };

    const addPrintPriceConfiguration = (c: any) => { const nc = { ...c, id: generateId('PPC') }; setPrintPriceConfigurations([...printPriceConfigurations, nc]); return nc; };
    const updatePrintPriceConfiguration = (c: PrintPriceConfiguration) => setPrintPriceConfigurations(printPriceConfigurations.map(pc => pc.id === c.id ? c : pc));
    const deletePrintPriceConfiguration = (id: string) => { setPrintPriceConfigurations(printPriceConfigurations.filter(c => c.id !== id)); return true; };

    const addUnit = (u: any) => { const nu = { ...u, id: generateId('U') }; setUnits([...units, nu]); return nu; };
    const updateUnit = (u: Unit) => setUnits(units.map(unit => unit.id === u.id ? u : unit));
    const deleteUnit = (id: string) => { setUnits(units.filter(u => u.id !== id)); return true; };
    
    const addUnitCategory = (cat: Omit<UnitCategory, 'id'>) => { const newCat = { ...cat, id: generateId('UC') }; setUnitCategories([...unitCategories, newCat]); return newCat; };
    const updateUnitCategory = (cat: UnitCategory) => setUnitCategories(unitCategories.map(c => c.id === cat.id ? cat : c));
    const deleteUnitCategory = (id: string) => { setUnitCategories(unitCategories.filter(c => c.id !== id)); return true; };
    
    const addRawMaterialGroup = (g: any) => { const ng = { ...g, id: generateId('RMG') }; setRawMaterialGroups([...rawMaterialGroups, ng]); return ng; };
    const updateRawMaterialGroup = (g: RawMaterialGroup) => setRawMaterialGroups(rawMaterialGroups.map(rg => rg.id === g.id ? g : rg));
    const deleteRawMaterialGroup = (id: string) => { setRawMaterialGroups(rawMaterialGroups.filter(g => g.id !== id)); return true; };

    const addRawMaterial = (m: any) => { const nm = { ...m, id: generateId('RM') }; setRawMaterials([...rawMaterials, nm]); return nm; };
    const updateRawMaterial = (m: RawMaterial) => setRawMaterials(rawMaterials.map(rm => rm.id === m.id ? m : rm));
    const deleteRawMaterial = (id: string) => { setRawMaterials(rawMaterials.filter(m => m.id !== id)); return true; };

    // --- Cash & Bank ---
    const updateOpeningCashBalance = (amt: number) => setOpeningCashBalanceState(amt);
    const updateBankOpeningBalances = (balances: any) => {
        const newAccounts = companyInfo.bankAccounts.map(acc => ({ ...acc, openingBalance: balances[acc.id] || acc.openingBalance }));
        setCompanyInfoState({ ...companyInfo, bankAccounts: newAccounts });
    };
    const addCashCount = (count: any) => setCashCounts([...cashCounts, { ...count, id: generateDocumentId(DocumentType.CashCount) }]);
    const addCashTransaction = (data: Omit<CashTransaction, 'id' | 'date'>) => {
        const type = data.type === CashTransactionType.Receipt ? DocumentType.CashReceipt : DocumentType.CashPayment;
        const newTx = { ...data, id: generateDocumentId(type), date: new Date() };
        setCashTransactions([...cashTransactions, newTx]);
        return newTx;
    };
    const addBankTransaction = (data: Omit<BankTransaction, 'id' | 'date'>) => {
        const type = data.type === BankTransactionType.Receipt ? DocumentType.BankReceipt : DocumentType.BankPayment;
        const newTx = { ...data, id: generateDocumentId(type), date: new Date() };
        setBankTransactions([...bankTransactions, newTx]);
        return newTx;
    };

    // --- Costing & Custom Modules ---
    const addCostingRecord = (r: any) => setCostingRecords([...costingRecords, { ...r, id: generateDocumentId(DocumentType.CostingRecord), createdAt: new Date() }]);
    const deleteCostingRecord = (id: string) => setCostingRecords(costingRecords.filter(r => r.id !== id));
    const getCostingRecordById = (id: string) => costingRecords.find(r => r.id === id);
    
    const getCustomObjectDefinitionBySlug = (slug: string) => customObjectDefinitions.find(d => d.slug === slug);
    const getCustomObjectRecordById = (id: string) => customObjectRecords.find(r => r.id === id);
    const addCustomObjectDefinition = (def: any) => { const nd = { ...def, id: generateId('MOD') }; setCustomObjectDefinitions([...customObjectDefinitions, nd]); return nd; };
    const updateCustomObjectDefinition = (def: CustomObjectDefinition) => setCustomObjectDefinitions(customObjectDefinitions.map(d => d.id === def.id ? def : d));
    const deleteCustomObjectDefinition = (id: string) => setCustomObjectDefinitions(customObjectDefinitions.filter(d => d.id !== id));
    const addCustomObjectRecord = (rec: any) => { const nr = { ...rec, id: generateId('REC'), createdAt: new Date(), updatedAt: new Date() }; setCustomObjectRecords([...customObjectRecords, nr]); return nr; };
    const updateCustomObjectRecord = (rec: CustomObjectRecord) => setCustomObjectRecords(customObjectRecords.map(r => r.id === rec.id ? rec : r));
    const deleteCustomObjectRecord = (id: string) => setCustomObjectRecords(customObjectRecords.filter(r => r.id !== id));

    // --- Settings & Utils ---
    const updatePrintTemplate = (t: PrintTemplate) => setPrintTemplates(printTemplates.map(tpl => tpl.id === t.id ? t : tpl));
    const addProfitRule = (r: any) => { const nr = { ...r, id: generateId('PR') }; setProfitRules([...profitRules, nr]); return nr; };
    const updateProfitRule = (r: ProfitRule) => setProfitRules(profitRules.map(rule => rule.id === r.id ? r : rule));
    const deleteProfitRule = (id: string) => setProfitRules(profitRules.filter(r => r.id !== id));
    const updateIntegrationSettings = (s: IntegrationSettings) => setIntegrationSettingsState(s);
    const updateNavigationMenu = (m: MenuItem[]) => setNavigationMenu(m);

    const addZnsTemplate = (t: Omit<ZnsTemplate, 'id'>) => { const nt = { ...t, id: generateId('ZNS') }; setZnsTemplates([...znsTemplates, nt]); return nt; };
    const updateZnsTemplate = (t: ZnsTemplate) => setZnsTemplates(znsTemplates.map(tpl => tpl.id === t.id ? t : tpl));
    const deleteZnsTemplate = (id: string) => setZnsTemplates(znsTemplates.filter(t => t.id !== id));

    const addPromotion = (p: Omit<Promotion, 'id' | 'timesUsed'>) => { const np = { ...p, id: generateId('PRO'), timesUsed: 0 }; setPromotions([...promotions, np]); return np; };
    const updatePromotion = (p: Promotion) => setPromotions(promotions.map(promo => promo.id === p.id ? p : promo));
    const deletePromotion = (id: string) => setPromotions(promotions.filter(p => p.id !== id));
    
    // --- Purchasing ---
    const addSupplier = (s: Omit<Supplier, 'id' | 'totalDebt'>) => { 
        const ns = { ...s, id: generateDocumentId(DocumentType.Supplier), totalDebt: 0 }; 
        setSuppliers([...suppliers, ns]); 
        return ns; 
    };
    const updateSupplier = (s: Supplier) => setSuppliers(suppliers.map(sup => sup.id === s.id ? s : sup));
    const deleteSupplier = (id: string) => setSuppliers(suppliers.filter(s => s.id !== id));
    const addSupplierGroup = (g: Omit<SupplierGroup, 'id'>) => { const ng = { ...g, id: generateId('SG') }; setSupplierGroups([...supplierGroups, ng]); return ng; };
    const updateSupplierGroup = (g: SupplierGroup) => setSupplierGroups(supplierGroups.map(grp => grp.id === g.id ? g : grp));
    const deleteSupplierGroup = (id: string) => setSupplierGroups(supplierGroups.filter(g => g.id !== id));

    const addPurchaseOrder = (po: Omit<PurchaseOrder, 'id' | 'status'>) => {
         const newPO: PurchaseOrder = { 
             ...po, 
             id: generateDocumentId(DocumentType.PurchaseOrder), 
             status: PurchaseOrderStatus.Draft 
         };
         setPurchaseOrders([...purchaseOrders, newPO]);
    };
    const updatePurchaseOrder = (po: PurchaseOrder) => setPurchaseOrders(purchaseOrders.map(p => p.id === po.id ? po : p));
    const deletePurchaseOrder = (id: string) => setPurchaseOrders(purchaseOrders.filter(p => p.id !== id));
    const updatePurchaseOrderStatus = (id: string, status: PurchaseOrderStatus) => setPurchaseOrders(purchaseOrders.map(p => p.id === id ? { ...p, status } : p));
    const payPurchaseOrder = (poId: string, amount: number, method: PaymentMethod, bankAccountId?: string) => {
        const po = purchaseOrders.find(p => p.id === poId);
        if (po) {
            const newPaid = (po.paidAmount || 0) + amount;
            const newStatus = newPaid >= po.totalAmount ? PaymentStatus.Paid : PaymentStatus.Partial;
            updatePurchaseOrder({ ...po, paidAmount: newPaid, paymentStatus: newStatus });
            if (method === PaymentMethod.Cash) {
                addCashTransaction({ type: CashTransactionType.Payment, amount, subject: suppliers.find(s => s.id === po.supplierId)?.name || 'NCC', reason: `TT PO ${po.id}` });
            } else if (method === PaymentMethod.BankTransfer && bankAccountId) {
                addBankTransaction({ type: BankTransactionType.Payment, amount, subject: suppliers.find(s => s.id === po.supplierId)?.name || 'NCC', reason: `TT PO ${po.id}`, bankAccountId });
            }
        }
    };
    const addPaperConversion = (pc: Omit<PaperConversion, 'id'>) => {
         setPaperConversions([...paperConversions, { ...pc, id: generateDocumentId(DocumentType.PaperConversion) }]);
         // Update stocks
         // Deduct source
         const sourceMat = materialVariants.find(m => m.id === pc.sourceMaterialId);
         if (sourceMat) {
             updateMaterialVariant({ ...sourceMat, initialStock: Math.max(0, sourceMat.initialStock - pc.sourceQuantity) });
         }
         // Add target
         const targetMat = materialVariants.find(m => m.id === pc.outputMaterialId);
         if (targetMat) {
             updateMaterialVariant({ ...targetMat, initialStock: targetMat.initialStock + pc.outputQuantity });
         }
    };

    // --- More Settings ---
    const addUserPaymentMethod = (method: Omit<UserPaymentMethod, 'id'>) => setUserPaymentMethods([...userPaymentMethods, { ...method, id: generateId('PM') }]);
    const updateUserPaymentMethod = (method: UserPaymentMethod) => setUserPaymentMethods(userPaymentMethods.map(m => m.id === method.id ? method : m));
    const deleteUserPaymentMethod = (id: string) => setUserPaymentMethods(userPaymentMethods.filter(m => m.id !== id));
    
    const addCommissionPolicy = (policy: Omit<CommissionPolicy, 'id'>) => setCommissionPolicies([...commissionPolicies, { ...policy, id: generateId('CP') }]);
    const updateCommissionPolicy = (policy: CommissionPolicy) => setCommissionPolicies(commissionPolicies.map(p => p.id === policy.id ? policy : p));
    const deleteCommissionPolicy = (id: string) => setCommissionPolicies(commissionPolicies.filter(p => p.id !== id));
    
    const addBOM = (bom: Omit<BillOfMaterial, 'id' | 'createdAt' | 'updatedAt'>) => setBoms([...boms, { ...bom, id: generateDocumentId(DocumentType.BillOfMaterial), createdAt: new Date(), updatedAt: new Date() }]);
    const updateBOM = (bom: BillOfMaterial) => setBoms(boms.map(b => b.id === bom.id ? bom : b));
    const deleteBOM = (id: string) => setBoms(boms.filter(b => b.id !== id));
    
    const addOtherCost = (cost: Omit<OtherCost, 'id'>) => { const nc = { ...cost, id: generateId('OC') }; setOtherCosts([...otherCosts, nc]); return nc; };
    const updateOtherCost = (cost: OtherCost) => setOtherCosts(otherCosts.map(c => c.id === cost.id ? cost : c));
    const deleteOtherCost = (id: string) => setOtherCosts(otherCosts.filter(c => c.id !== id));

    const addWastageRule = (r: any) => { const nr = { ...r, id: generateId('WR') }; setWastageRules([...wastageRules, nr]); return nr; };
    const updateWastageRule = (r: WastageRule) => setWastageRules(wastageRules.map(rule => rule.id === r.id ? r : rule));
    const deleteWastageRule = (id: string) => setWastageRules(wastageRules.filter(r => r.id !== id));

    const addPlatePrice = (p: any) => { const np = { ...p, id: generateId('PP') }; setPlatePrices([...platePrices, np]); return np; };
    const updatePlatePrice = (p: PlatePrice) => setPlatePrices(platePrices.map(pp => pp.id === p.id ? p : pp));
    const deletePlatePrice = (id: string) => setPlatePrices(platePrices.filter(p => p.id !== id));
    
    const addRunningCostRule = (r: any) => { const nr = { ...r, id: generateId('RC') }; setRunningCostRules([...runningCostRules, nr]); return nr; };
    const updateRunningCostRule = (r: RunningCostRule) => setRunningCostRules(runningCostRules.map(rule => rule.id === r.id ? r : rule));
    const deleteRunningCostRule = (id: string) => setRunningCostRules(runningCostRules.filter(r => r.id !== id));

    // FIX: Add missing properties createOrderFromQuote, createInvoiceForOrderPos, and recordPaymentPos to the provider value object.
    const value: DataContextType = {
        quotes,
        orders,
        invoices,
        customers,
        customerGroups,
        materialGroups,
        materialVariants,
        processGroups,
        processConfigurations,
        products,
        printMethodGroups,
        printPriceConfigurations,
        units,
        unitCategories,
        productionOrders,
        contracts,
        users,
        currentUser,
        companyInfo,
        cashTransactions,
        bankTransactions,
        numberingRules,
        userRoleChangeHistory,
        plans,
        rolePermissions, 
        navigationMenu,
        roles,
        printCostComponents,
        costingRecords,
        rawMaterialGroups,
        rawMaterials,
        customObjectDefinitions,
        customObjectRecords,
        printTemplates,
        znsTemplates,
        promotions,
        integrationSettings,
        accessLogs,
        activityLogs,
        suppliers,
        supplierGroups,
        purchaseOrders,
        paperConversions,
        commissionPolicies,
        userPaymentMethods,
        boms,
        openingCashBalance,
        cashCounts,
        profitRules,
        otherCosts,
        inventoryTransactions,
        wastageRules,
        platePrices,
        runningCostRules,

        // Functions
        login, logout, changePassword, requestPasswordReset, resetPassword,
        addQuote, updateQuote, updateQuoteStatus, getQuoteById, recordPaymentForQuote,
        addOrderFromQuote, updateOrder, getOrderById, updateOrderStatus,
        createInvoiceForOrder, updateInvoice, clearPaymentsForInvoice, recordPayment,
        addCustomer, updateCustomer, deleteCustomer,
        addCustomerGroup, updateCustomerGroup, deleteCustomerGroup, collectCustomerDebt,
        createPosSale, createOrderFromPos, createQuoteFromPos, updateQuoteFromPos,
        addProductionOrder, updateProductionOrderStatus, getProductionOrderById, updateProductionOrder, deleteProductionOrder, duplicateProductionOrder,
        addContract, updateContract, deleteContract, getContractById, renewContract,
        addUser, updateUser, updateRolePermissions, addRole, updateRole, deleteRole,
        updateCompanyInfo, updateNumberingRule, updateSubscriptionPlan,
        addProduct, updateProduct, deleteProduct,
        addMaterialGroup, updateMaterialGroup, deleteMaterialGroup,
        addMaterialVariant, updateMaterialVariant, deleteMaterialVariant,
        addProcessGroup, updateProcessGroup, deleteProcessGroup,
        addProcessConfiguration, updateProcessConfiguration, deleteProcessConfiguration,
        addPrintMethodGroup, updatePrintMethodGroup, deletePrintMethodGroup,
        addPrintPriceConfiguration, updatePrintPriceConfiguration, deletePrintPriceConfiguration,
        addUnit, updateUnit, deleteUnit, addUnitCategory, updateUnitCategory, deleteUnitCategory,
        addRawMaterialGroup, updateRawMaterialGroup, deleteRawMaterialGroup,
        addRawMaterial, updateRawMaterial, deleteRawMaterial,
        updateOpeningCashBalance, updateBankOpeningBalances,
        addCashCount,
        addCostingRecord, deleteCostingRecord, getCostingRecordById,
        getCustomObjectDefinitionBySlug, getCustomObjectRecordById,
        addCustomObjectDefinition, updateCustomObjectDefinition, deleteCustomObjectDefinition,
        addCustomObjectRecord, updateCustomObjectRecord, deleteCustomObjectRecord,
        updatePrintTemplate,
        addProfitRule, updateProfitRule, deleteProfitRule,
        updateIntegrationSettings,
        updateNavigationMenu,
        addZnsTemplate, updateZnsTemplate, deleteZnsTemplate,
        addPromotion, updatePromotion, deletePromotion,
        addSupplier, updateSupplier, deleteSupplier,
        addSupplierGroup, updateSupplierGroup, deleteSupplierGroup,
        addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, updatePurchaseOrderStatus, payPurchaseOrder,
        addPaperConversion,
        addUserPaymentMethod, updateUserPaymentMethod, deleteUserPaymentMethod,
        addCommissionPolicy, updateCommissionPolicy, deleteCommissionPolicy,
        addBOM, updateBOM, deleteBOM,
        addOtherCost, updateOtherCost, deleteOtherCost,
        addCashTransaction, addBankTransaction,
        addWastageRule, updateWastageRule, deleteWastageRule,
        addPlatePrice, updatePlatePrice, deletePlatePrice,
        addRunningCostRule, updateRunningCostRule, deleteRunningCostRule,
        // FIX: Missing properties from DataContextType implemented via aliasing existing methods
        createOrderFromQuote: addOrderFromQuote,
        createInvoiceForOrderPos: createInvoiceForOrder,
        recordPaymentPos: recordPayment
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
