import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  InwardPO,
  OutwardDispatch,
  RateCardItem,
  Worker,
  ProductionLog,
  WorkerAdvance,
  WorkerPayment,
  Expense,
  PartnerShare,
  AppRoute,
  WorkerPayroll,
  UserRole,
  UserSession,
} from '../types/erp';
import {
  INITIAL_CLIENTS,
  INITIAL_STYLES,
  INITIAL_RATE_CARD,
  INITIAL_WORKERS,
  INITIAL_PARTNERS,
  SAMPLE_DEMO_DATA,
} from '../data/initialData';

interface ErpContextType {
  // Navigation
  currentRoute: AppRoute;
  previousRoute: AppRoute | null;
  navigate: (route: AppRoute) => void;
  goBack: (fallback?: AppRoute) => void;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;

  // Two App Mode & Phone View Simulation
  appMode: 'manager' | 'staff';
  setAppMode: (mode: 'manager' | 'staff') => void;
  viewMode: 'full' | 'mobile_frame';
  setViewMode: (mode: 'full' | 'mobile_frame') => void;

  // Inward POs
  inwardOrders: InwardPO[];
  addInwardPO: (po: Omit<InwardPO, 'id' | 'createdAt' | 'dispatchedQty' | 'status'>) => InwardPO;
  deleteInwardPO: (id: string) => boolean;
  getInwardPOById: (id: string) => InwardPO | undefined;

  // Outward Dispatches
  outwardDispatches: OutwardDispatch[];
  addOutwardDispatch: (dispatch: Omit<OutwardDispatch, 'id' | 'createdAt'>) => { success: boolean; error?: string; dispatch?: OutwardDispatch };
  deleteOutwardDispatch: (id: string) => boolean;

  // Master Data
  clients: string[];
  addClient: (name: string) => void;
  styles: string[];
  addStyle: (name: string) => void;
  rateCards: RateCardItem[];
  addRateCardItem: (item: Omit<RateCardItem, 'id' | 'version' | 'effectiveFrom'>) => void;
  updateRateCardItem: (id: string, newRatePaise: number) => void;
  workers: Worker[];
  addWorker: (worker: Omit<Worker, 'id'>) => void;
  updateWorker: (worker: Worker) => void;
  deleteWorker: (id: string) => boolean;
  updateWorkerOtp: (workerId: string, newOtp: string) => void;

  // Production & Wages
  productionLogs: ProductionLog[];
  addProductionLog: (log: Omit<ProductionLog, 'id' | 'createdAt' | 'grossWagePaise'>) => void;
  deleteProductionLog: (id: string) => void;
  approveProductionLog: (id: string) => void;

  // Advances & Payments
  workerAdvances: WorkerAdvance[];
  addWorkerAdvance: (adv: Omit<WorkerAdvance, 'id'>) => void;
  workerPayments: WorkerPayment[];
  addWorkerPayment: (pay: Omit<WorkerPayment, 'id'>) => void;
  getWorkerPayrolls: () => WorkerPayroll[];

  // Expenses
  expenses: Expense[];
  addExpense: (exp: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  // Partner Distribution
  partners: PartnerShare[];
  updatePartnerShares: (partners: PartnerShare[]) => { success: boolean; error?: string };

  // Financial Engine Computations
  getFinancialSummary: () => {
    totalInwardPieces: number;
    totalDispatchedPieces: number;
    totalPendingPieces: number;
    grossRevenuePaise: number;
    totalWorkerWagesPaise: number;
    totalWagesPaise: number;
    totalExpensesPaise: number;
    materialOverheadsPaise: number;
    maintenancePaise: number;
    utilitiesRentPaise: number;
    netProfitPaise: number;
    partnerDistributions: { partner: PartnerShare; amountPaise: number }[];
  };

  // State utilities
  seedDemoData: () => void;
  loadDemoData: () => void;
  resetToCleanState: () => void;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;

  // Authentication & Access Control (Manager vs Staff / Other Person)
  currentUser: UserSession;
  isManager: boolean;
  activeStaffWorker: Worker | null;
  loginAsManager: (passcode?: string) => { success: boolean; error?: string };
  loginAsStaff: (staffName?: string) => void;
  loginStaffWithPhoneAndOtp: (phone: string, otp: string) => { success: boolean; worker?: Worker; error?: string };
  logoutStaff: () => void;
  switchRole: (role: UserRole) => void;
}

const ErpContext = createContext<ErpContextType | null>(null);

const STORAGE_KEYS = {
  INWARD: 'artex_inward_orders_v1',
  OUTWARD: 'artex_outward_dispatches_v1',
  CLIENTS: 'artex_clients_v1',
  STYLES: 'artex_styles_v1',
  RATE_CARDS: 'artex_rate_cards_v1',
  WORKERS: 'artex_workers_v1',
  PRODUCTION_LOGS: 'artex_prod_logs_v1',
  ADVANCES: 'artex_advances_v1',
  PAYMENTS: 'artex_payments_v1',
  EXPENSES: 'artex_expenses_v1',
  PARTNERS: 'artex_partners_v1',
  USER_SESSION: 'artex_user_session_v1',
  APP_MODE: 'artex_app_mode_v1',
  VIEW_MODE: 'artex_view_mode_v1',
};

// Safe JSON Array Parser Helper to guarantee valid array state even if localStorage is corrupt
function parseJsonArray<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (err) {
    console.warn(`Failed to parse localStorage key ${key}:`, err);
    return fallback;
  }
}

// Safe User Session Parser Helper
function parseUserSession(key: string): UserSession {
  const defaultSession: UserSession = {
    id: 'usr-mgr-1',
    name: 'Factory Manager',
    role: 'manager',
    designation: 'Floor In-Charge & Managing Partner',
  };
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultSession;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && (parsed.role === 'manager' || parsed.role === 'staff')) {
      return {
        id: parsed.id || defaultSession.id,
        name: parsed.name || (parsed.role === 'manager' ? 'Factory Manager' : 'Floor Staff'),
        role: parsed.role,
        designation: parsed.designation || (parsed.role === 'manager' ? 'Floor In-Charge & Managing Partner' : 'Floor Staff (Daily Work Portal)'),
        loggedWorkerId: parsed.loggedWorkerId,
        phone: parsed.phone,
      };
    }
  } catch (err) {
    console.warn('Failed to parse user session:', err);
  }
  return defaultSession;
}

export const ErpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication / Role-Based Access Control State
  const [currentUser, setCurrentUser] = useState<UserSession>(() =>
    parseUserSession(STORAGE_KEYS.USER_SESSION)
  );

  const isManager = currentUser.role === 'manager';

  // Two-App Modes: 'manager' (Full ERP Portal) vs 'staff' (Mobile Daily Work App)
  const [appMode, setAppModeState] = useState<'manager' | 'staff'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APP_MODE);
    if (saved === 'staff') return 'staff';
    return currentUser.role === 'staff' ? 'staff' : 'manager';
  });

  const setAppMode = (mode: 'manager' | 'staff') => {
    setAppModeState(mode);
    localStorage.setItem(STORAGE_KEYS.APP_MODE, mode);
  };

  // Viewport Simulator: 'full' (standard browser width) or 'mobile_frame' (simulated smartphone device frame)
  const [viewMode, setViewModeState] = useState<'full' | 'mobile_frame'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    return saved === 'mobile_frame' ? 'mobile_frame' : 'full';
  });

  const setViewMode = (mode: 'full' | 'mobile_frame') => {
    setViewModeState(mode);
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(currentUser));
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('/');
  const [previousRoute, setPreviousRoute] = useState<AppRoute | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // Notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const clearNotification = () => setNotification(null);

  const navigate = (route: AppRoute) => {
    setPreviousRoute(currentRoute);
    setCurrentRoute(route);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = (fallback: AppRoute = '/') => {
    if (previousRoute && previousRoute !== currentRoute) {
      setCurrentRoute(previousRoute);
      setPreviousRoute(null);
    } else {
      setCurrentRoute(fallback);
    }
  };

  // 1. Inward Orders (Defaults to EMPTY [] to strictly satisfy Data Isolation)
  const [inwardOrders, setInwardOrders] = useState<InwardPO[]>(() =>
    parseJsonArray<InwardPO>(STORAGE_KEYS.INWARD, [])
  );

  // 2. Outward Dispatches (Defaults to EMPTY [])
  const [outwardDispatches, setOutwardDispatches] = useState<OutwardDispatch[]>(() =>
    parseJsonArray<OutwardDispatch>(STORAGE_KEYS.OUTWARD, [])
  );

  // 3. Masters
  const [clients, setClients] = useState<string[]>(() =>
    parseJsonArray<string>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS)
  );

  const [styles, setStyles] = useState<string[]>(() =>
    parseJsonArray<string>(STORAGE_KEYS.STYLES, INITIAL_STYLES)
  );

  const [rateCards, setRateCards] = useState<RateCardItem[]>(() =>
    parseJsonArray<RateCardItem>(STORAGE_KEYS.RATE_CARDS, INITIAL_RATE_CARD)
  );

  const [workers, setWorkers] = useState<Worker[]>(() =>
    parseJsonArray<Worker>(STORAGE_KEYS.WORKERS, INITIAL_WORKERS)
  );

  // 4. Production Logs
  const [productionLogs, setProductionLogs] = useState<ProductionLog[]>(() =>
    parseJsonArray<ProductionLog>(STORAGE_KEYS.PRODUCTION_LOGS, [])
  );

  // 5. Advances & Payments
  const [workerAdvances, setWorkerAdvances] = useState<WorkerAdvance[]>(() =>
    parseJsonArray<WorkerAdvance>(STORAGE_KEYS.ADVANCES, [])
  );

  const [workerPayments, setWorkerPayments] = useState<WorkerPayment[]>(() =>
    parseJsonArray<WorkerPayment>(STORAGE_KEYS.PAYMENTS, [])
  );

  // 6. Expenses
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    parseJsonArray<Expense>(STORAGE_KEYS.EXPENSES, [])
  );

  // 7. Partners
  const [partners, setPartners] = useState<PartnerShare[]>(() =>
    parseJsonArray<PartnerShare>(STORAGE_KEYS.PARTNERS, INITIAL_PARTNERS)
  );

  // Sync to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INWARD, JSON.stringify(inwardOrders));
  }, [inwardOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OUTWARD, JSON.stringify(outwardDispatches));
  }, [outwardDispatches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STYLES, JSON.stringify(styles));
  }, [styles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RATE_CARDS, JSON.stringify(rateCards));
  }, [rateCards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTION_LOGS, JSON.stringify(productionLogs));
  }, [productionLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(workerAdvances));
  }, [workerAdvances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(workerPayments));
  }, [workerPayments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
  }, [partners]);

  // Master add helpers
  const addClient = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !clients.includes(trimmed)) {
      setClients((prev) => [...prev, trimmed]);
      showNotification(`Client "${trimmed}" registered successfully.`);
    }
  };

  const addStyle = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !styles.includes(trimmed)) {
      setStyles((prev) => [...prev, trimmed]);
      showNotification(`Style "${trimmed}" added to catalog.`);
    }
  };

  // Inward PO Actions
  const addInwardPO = (poData: Omit<InwardPO, 'id' | 'createdAt' | 'dispatchedQty' | 'status'>): InwardPO => {
    const totalQty = poData.colours.reduce((sum, c) => sum + (Number(c.qty) || 0), 0);
    const newPO: InwardPO = {
      ...poData,
      id: `po-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      totalQty,
      dispatchedQty: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setInwardOrders((prev) => [newPO, ...prev]);
    showNotification(`Purchase Order ${newPO.poNumber} created with ${totalQty.toLocaleString()} pcs.`);
    return newPO;
  };

  const deleteInwardPO = (id: string): boolean => {
    const po = inwardOrders.find((p) => p.id === id);
    if (!po) return false;

    // Remove any outward dispatches tied to this PO or warn
    setInwardOrders((prev) => prev.filter((p) => p.id !== id));
    setOutwardDispatches((prev) => prev.filter((d) => d.poId !== id));
    showNotification(`PO ${po.poNumber} and related dispatches deleted permanently.`, 'info');
    return true;
  };

  const getInwardPOById = (id: string) => inwardOrders.find((p) => p.id === id);

  // Outward Dispatch Actions
  const addOutwardDispatch = (
    dispatchData: Omit<OutwardDispatch, 'id' | 'createdAt'>
  ): { success: boolean; error?: string; dispatch?: OutwardDispatch } => {
    const po = inwardOrders.find((p) => p.id === dispatchData.poId);
    if (!po) {
      return { success: false, error: 'Target Purchase Order not found.' };
    }

    const availableBal = po.totalQty - po.dispatchedQty;
    if (dispatchData.totalDispatchedQty > availableBal) {
      return {
        success: false,
        error: `Dispatched quantity (${dispatchData.totalDispatchedQty} pcs) exceeds remaining PO balance (${availableBal} pcs).`,
      };
    }

    if (dispatchData.totalDispatchedQty <= 0) {
      return { success: false, error: 'Dispatched quantity must be greater than 0.' };
    }

    const newDispatch: OutwardDispatch = {
      ...dispatchData,
      id: `out-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };

    // 1. Deduct quantity from Inward PO balance immediately
    const updatedDispatchedQty = po.dispatchedQty + dispatchData.totalDispatchedQty;
    const newStatus: 'pending' | 'in_progress' | 'completed' =
      updatedDispatchedQty >= po.totalQty ? 'completed' : 'in_progress';

    // Also update colour-level dispatched quantities on the PO if matched
    const updatedColours = po.colours.map((c) => {
      const dispatchedColour = dispatchData.colours.find(
        (dc) => dc.colour.toLowerCase().trim() === c.colour.toLowerCase().trim()
      );
      if (dispatchedColour) {
        return {
          ...c,
          dispatchedQty: (c.dispatchedQty || 0) + dispatchedColour.dispatchedQty,
        };
      }
      return c;
    });

    const updatedPO: InwardPO = {
      ...po,
      dispatchedQty: updatedDispatchedQty,
      status: newStatus,
      colours: updatedColours,
    };

    setInwardOrders((prev) => prev.map((p) => (p.id === po.id ? updatedPO : p)));
    setOutwardDispatches((prev) => [newDispatch, ...prev]);

    showNotification(
      `Dispatch ${newDispatch.dispatchNo} recorded. Inward balance updated to ${(po.totalQty - updatedDispatchedQty).toLocaleString()} pcs.`
    );

    return { success: true, dispatch: newDispatch };
  };

  const deleteOutwardDispatch = (dispatchId: string): boolean => {
    const dispatch = outwardDispatches.find((d) => d.id === dispatchId);
    if (!dispatch) return false;

    // Rollback Inward PO dispatched quantity
    const po = inwardOrders.find((p) => p.id === dispatch.poId);
    if (po) {
      const rolledBackDispatched = Math.max(0, po.dispatchedQty - dispatch.totalDispatchedQty);
      const newStatus = rolledBackDispatched === 0 ? 'pending' : 'in_progress';

      const updatedColours = po.colours.map((c) => {
        const dc = dispatch.colours.find(
          (d) => d.colour.toLowerCase().trim() === c.colour.toLowerCase().trim()
        );
        if (dc) {
          return {
            ...c,
            dispatchedQty: Math.max(0, (c.dispatchedQty || 0) - dc.dispatchedQty),
          };
        }
        return c;
      });

      setInwardOrders((prev) =>
        prev.map((p) =>
          p.id === po.id
            ? { ...p, dispatchedQty: rolledBackDispatched, status: newStatus, colours: updatedColours }
            : p
        )
      );
    }

    setOutwardDispatches((prev) => prev.filter((d) => d.id !== dispatchId));
    showNotification(`Dispatch ${dispatch.dispatchNo} deleted. Inward balance restored.`, 'info');
    return true;
  };

  // Rate Card Actions with Versioning
  const addRateCardItem = (itemData: Omit<RateCardItem, 'id' | 'version' | 'effectiveFrom'>) => {
    const newItem: RateCardItem = {
      ...itemData,
      id: `rc-${Date.now()}`,
      version: 1,
      effectiveFrom: new Date().toISOString().split('T')[0],
    };
    setRateCards((prev) => [...prev, newItem]);
    showNotification(`Operation "${newItem.operationName}" added to Rate Card.`);
  };

  const updateRateCardItem = (id: string, newRatePaise: number) => {
    setRateCards((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ratePaise: newRatePaise,
            version: item.version + 1,
            effectiveFrom: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );
    showNotification(`Rate updated to v+1. Historical payrolls retain locked rates.`);
  };

  // Worker & Production Actions
  const addWorker = (workerData: Omit<Worker, 'id'>) => {
    // Generate an automatic 4-digit OTP/PIN if not provided
    const otpPin = workerData.otpPin?.trim() || Math.floor(1000 + Math.random() * 9000).toString();
    const newWorker: Worker = {
      ...workerData,
      id: `w-${Date.now()}`,
      otpPin,
      registeredAt: workerData.registeredAt || new Date().toISOString().split('T')[0],
    };
    setWorkers((prev) => [...prev, newWorker]);
    showNotification(`Worker ${newWorker.name} (${newWorker.code}) added. Staff Login PIN: ${otpPin}`, 'success');
  };

  const updateWorker = (updatedWorker: Worker) => {
    setWorkers((prev) => prev.map((w) => (w.id === updatedWorker.id ? updatedWorker : w)));
    showNotification(`Employee ${updatedWorker.name} updated.`);
  };

  const updateWorkerOtp = (workerId: string, newOtp: string) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === workerId ? { ...w, otpPin: newOtp.trim() } : w))
    );
    showNotification(`Employee Login OTP/PIN updated to ${newOtp.trim()}.`, 'success');
  };

  const deleteWorker = (id: string): boolean => {
    const worker = workers.find((w) => w.id === id);
    if (!worker) return false;
    setWorkers((prev) => prev.filter((w) => w.id !== id));
    showNotification(`Employee ${worker.name} (${worker.code}) removed.`, 'info');
    return true;
  };

  const addProductionLog = (logData: Omit<ProductionLog, 'id' | 'createdAt' | 'grossWagePaise'>) => {
    const grossWagePaise = Math.round(logData.piecesCompleted * logData.ratePaise);
    const isStaffEntry = currentUser.role === 'staff' || appMode === 'staff';
    const newLog: ProductionLog = {
      ...logData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
      grossWagePaise,
      status: logData.status || (isStaffEntry ? 'submitted' : 'approved'),
      submittedBy: logData.submittedBy || (isStaffEntry ? 'staff' : 'manager'),
      createdAt: new Date().toISOString(),
    };
    setProductionLogs((prev) => [newLog, ...prev]);
    showNotification(
      isStaffEntry
        ? `வேலை வெற்றிகரமாக பதிவு செய்யப்பட்டது! (${logData.piecesCompleted} pcs saved)`
        : `Logged ${logData.piecesCompleted} pcs for ${logData.workerName}.`,
      'success'
    );
  };

  const approveProductionLog = (id: string) => {
    setProductionLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'approved' } : l))
    );
    showNotification(`Production record approved and verified.`, 'success');
  };

  const deleteProductionLog = (id: string) => {
    setProductionLogs((prev) => prev.filter((l) => l.id !== id));
    showNotification(`Production record deleted.`, 'info');
  };

  // Advances & Payments
  const addWorkerAdvance = (advData: Omit<WorkerAdvance, 'id'>) => {
    const newAdv: WorkerAdvance = {
      ...advData,
      id: `adv-${Date.now()}`,
    };
    setWorkerAdvances((prev) => [newAdv, ...prev]);
    showNotification(`Advance recorded for ${advData.workerName}.`);
  };

  const addWorkerPayment = (payData: Omit<WorkerPayment, 'id'>) => {
    const newPay: WorkerPayment = {
      ...payData,
      id: `pay-${Date.now()}`,
    };
    setWorkerPayments((prev) => [newPay, ...prev]);
    showNotification(`Payment recorded for ${payData.workerName}.`);
  };

  const getWorkerPayrolls = (): WorkerPayroll[] => {
    return workers.map((worker) => {
      const logs = productionLogs.filter((l) => l.workerId === worker.id);
      const totalPieces = logs.reduce((sum, l) => sum + l.piecesCompleted, 0);
      const grossWagePaise = logs.reduce((sum, l) => sum + l.grossWagePaise, 0);

      const advances = workerAdvances
        .filter((a) => a.workerId === worker.id)
        .reduce((sum, a) => sum + a.amountPaise, 0);

      const payments = workerPayments
        .filter((p) => p.workerId === worker.id)
        .reduce((sum, p) => sum + p.amountPaise, 0);

      const netPayablePaise = Math.max(0, grossWagePaise - advances);
      const balancePaise = netPayablePaise - payments;

      let status: 'Pending' | 'Partial' | 'Paid' = 'Pending';
      if (balancePaise <= 0 && (grossWagePaise > 0 || payments > 0)) {
        status = 'Paid';
      } else if (payments > 0 && balancePaise > 0) {
        status = 'Partial';
      }

      return {
        workerId: worker.id,
        workerName: worker.name,
        totalPieces,
        grossWagePaise,
        advancePaidPaise: advances,
        netPayablePaise,
        paidAmountPaise: payments,
        balancePaise,
        status,
      };
    });
  };

  // Expenses
  const addExpense = (expData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
    showNotification(`Expense voucher ${newExp.voucherNo} added.`);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showNotification(`Expense voucher deleted.`, 'info');
  };

  // Partners equity
  const updatePartnerShares = (updatedPartners: PartnerShare[]) => {
    const totalPercentage = updatedPartners.reduce((sum, p) => sum + Number(p.percentage), 0);
    if (Math.round(totalPercentage) !== 100) {
      return {
        success: false,
        error: `Partner equity shares must total exactly 100%. Current sum: ${totalPercentage}%.`,
      };
    }
    setPartners(updatedPartners);
    showNotification(`Partnership equity distribution updated to 100%.`);
    return { success: true };
  };

  // Live Net Profit Engine Calculation
  const getFinancialSummary = () => {
    const totalInwardPieces = inwardOrders.reduce((sum, p) => sum + p.totalQty, 0);
    const totalDispatchedPieces = outwardDispatches.reduce((sum, d) => sum + d.totalDispatchedQty, 0);
    const totalPendingPieces = Math.max(0, totalInwardPieces - totalDispatchedPieces);

    // Gross Revenue = sum(Dispatched Pieces * PO Unit Rate)
    const grossRevenuePaise = outwardDispatches.reduce((sum, d) => sum + d.totalRevenuePaise, 0);

    // Total Worker Wages = sum(Production piece earnings)
    const totalWorkerWagesPaise = productionLogs.reduce((sum, l) => sum + l.grossWagePaise, 0);

    // Expenses breakdown
    let materialOverheadsPaise = 0;
    let maintenancePaise = 0;
    let utilitiesRentPaise = 0;

    expenses.forEach((e) => {
      if (e.category === 'Material Overheads') materialOverheadsPaise += e.amountPaise;
      else if (e.category === 'Machine Maintenance') maintenancePaise += e.amountPaise;
      else if (e.category === 'Utilities & Rent') utilitiesRentPaise += e.amountPaise;
    });

    const totalExpensesPaise = materialOverheadsPaise + maintenancePaise + utilitiesRentPaise;

    // Net Profit = Gross Revenue - Worker Wages - Factory Expenses
    const netProfitPaise = grossRevenuePaise - totalWorkerWagesPaise - totalExpensesPaise;

    // Partner distributions
    const partnerDistributions = partners.map((partner) => {
      const sharePaise = Math.round((netProfitPaise * partner.percentage) / 100);
      return {
        partner,
        amountPaise: sharePaise,
      };
    });

    return {
      totalInwardPieces,
      totalDispatchedPieces,
      totalPendingPieces,
      grossRevenuePaise,
      totalWorkerWagesPaise,
      totalWagesPaise: totalWorkerWagesPaise,
      totalExpensesPaise,
      materialOverheadsPaise,
      maintenancePaise,
      utilitiesRentPaise,
      netProfitPaise,
      partnerDistributions,
    };
  };

  // Seed sample data for testing
  const seedDemoData = () => {
    setInwardOrders(SAMPLE_DEMO_DATA.inwardOrders);
    setOutwardDispatches(SAMPLE_DEMO_DATA.outwardDispatches);
    setExpenses(SAMPLE_DEMO_DATA.expenses);
    setProductionLogs(SAMPLE_DEMO_DATA.productionLogs);
    showNotification('Sample Tirupur production and dispatch data loaded.', 'success');
  };

  // Reset to clean state (strictly isolated)
  const resetToCleanState = () => {
    setInwardOrders([]);
    setOutwardDispatches([]);
    setProductionLogs([]);
    setWorkerAdvances([]);
    setWorkerPayments([]);
    setExpenses([]);
    localStorage.removeItem(STORAGE_KEYS.INWARD);
    localStorage.removeItem(STORAGE_KEYS.OUTWARD);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTION_LOGS);
    localStorage.removeItem(STORAGE_KEYS.ADVANCES);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    showNotification('Factory database reset to clean blank state.', 'info');
  };

  const loginAsManager = (passcode?: string): { success: boolean; error?: string } => {
    if (passcode && passcode.trim() !== '' && passcode.trim() !== '1234' && passcode.trim().toLowerCase() !== 'manager') {
      showNotification('Incorrect manager passcode. Try 1234.', 'error');
      return { success: false, error: 'Incorrect passcode. Default is 1234.' };
    }
    const mgrSession: UserSession = {
      id: 'usr-mgr-1',
      name: 'Factory Manager (K. Arumugam)',
      role: 'manager',
      designation: 'Floor In-Charge & Managing Partner',
    };
    setCurrentUser(mgrSession);
    showNotification('Logged in as Factory Manager. Edit and delete permissions enabled.', 'success');
    return { success: true };
  };

  const activeStaffWorker = currentUser.loggedWorkerId
    ? workers.find((w) => w.id === currentUser.loggedWorkerId) || null
    : null;

  const loginStaffWithPhoneAndOtp = (phone: string, otp: string): { success: boolean; worker?: Worker; error?: string } => {
    const cleanInputPhone = phone.replace(/\D/g, '');
    const cleanInputOtp = otp.trim();

    if (!cleanInputPhone) {
      return { success: false, error: 'Please enter registered 10-digit mobile number.' };
    }
    if (!cleanInputOtp) {
      return { success: false, error: 'Please enter 4-digit registration OTP / PIN.' };
    }

    const matchedWorker = workers.find((w) => {
      const wPhone = w.phone.replace(/\D/g, '');
      const phoneMatches = wPhone.endsWith(cleanInputPhone) || cleanInputPhone.endsWith(wPhone);
      const otpMatches = (w.otpPin || '1234') === cleanInputOtp;
      return phoneMatches && otpMatches;
    });

    if (!matchedWorker) {
      return {
        success: false,
        error: 'Phone number or OTP PIN is incorrect. Please check with your Manager.',
      };
    }

    if (!matchedWorker.active) {
      return { success: false, error: 'This worker account is currently marked inactive.' };
    }

    // Update worker's last login
    setWorkers((prev) =>
      prev.map((w) => (w.id === matchedWorker.id ? { ...w, lastLoginAt: new Date().toISOString() } : w))
    );

    const staffSession: UserSession = {
      id: `usr-${matchedWorker.id}`,
      name: matchedWorker.name,
      role: 'staff',
      designation: matchedWorker.designation,
      loggedWorkerId: matchedWorker.id,
      phone: matchedWorker.phone,
    };

    setCurrentUser(staffSession);
    setAppMode('staff');
    showNotification(`வணக்கம் ${matchedWorker.name}! Daily work entry is ready.`, 'success');
    return { success: true, worker: matchedWorker };
  };

  const logoutStaff = () => {
    const defaultStaff: UserSession = {
      id: 'usr-stf-anon',
      name: 'Unregistered Staff',
      role: 'staff',
      designation: 'Floor Staff (Sign in required)',
    };
    setCurrentUser(defaultStaff);
    showNotification('Logged out from staff session.', 'info');
  };

  const loginAsStaff = (staffName?: string) => {
    const staffSession: UserSession = {
      id: `usr-stf-${Date.now()}`,
      name: staffName?.trim() || 'Floor Staff / Operator',
      role: 'staff',
      designation: 'Floor Staff (Daily Work Portal)',
    };
    setCurrentUser(staffSession);
    setAppMode('staff');
    showNotification('Switched to Staff Daily Work App.', 'info');
  };

  const switchRole = (role: UserRole) => {
    if (role === 'manager') {
      loginAsManager();
      setAppMode('manager');
    } else {
      loginAsStaff();
      setAppMode('staff');
    }
  };

  return (
    <ErpContext.Provider
      value={{
        currentUser,
        isManager,
        activeStaffWorker,
        loginAsManager,
        loginAsStaff,
        loginStaffWithPhoneAndOtp,
        logoutStaff,
        switchRole,
        appMode,
        setAppMode,
        viewMode,
        setViewMode,
        currentRoute,
        previousRoute,
        navigate,
        goBack,
        isDrawerOpen,
        setDrawerOpen,
        inwardOrders,
        addInwardPO,
        deleteInwardPO,
        getInwardPOById,
        outwardDispatches,
        addOutwardDispatch,
        deleteOutwardDispatch,
        clients,
        addClient,
        styles,
        addStyle,
        rateCards,
        addRateCardItem,
        updateRateCardItem,
        workers,
        addWorker,
        updateWorker,
        deleteWorker,
        updateWorkerOtp,
        productionLogs,
        addProductionLog,
        deleteProductionLog,
        approveProductionLog,
        workerAdvances,
        addWorkerAdvance,
        workerPayments,
        addWorkerPayment,
        getWorkerPayrolls,
        expenses,
        addExpense,
        deleteExpense,
        partners,
        updatePartnerShares,
        getFinancialSummary,
        seedDemoData,
        loadDemoData: seedDemoData,
        resetToCleanState,
        notification,
        showNotification,
        clearNotification,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
};
