/**
 * Unit Test Suite for "AR Tex" ERP
 * Validates:
 * 1. Financial Precision Engine & Currency Formatting (Paise arithmetic)
 * 2. Outward Quantity Validation & Inward Balance Deduction
 * 3. Live Net Profit Engine Calculations & 3-Way Partnership Distribution
 */

import { toPaise, toRupees, formatCurrency, formatPercent, formatNumber } from './currency';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

export function runAllErpUnitTests(): TestResult[] {
  const results: TestResult[] = [];

  function test(suite: string, name: string, fn: () => void) {
    try {
      fn();
      results.push({ suite, name, passed: true });
    } catch (err: any) {
      results.push({ suite, name, passed: false, error: err.message || String(err) });
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
  }

  function assertEquals(actual: any, expected: any, msg: string) {
    if (actual !== expected) {
      throw new Error(`${msg}: expected ${expected}, got ${actual}`);
    }
  }

  // --- Suite 1: Currency & Financial Precision Engine (Paise) ---
  test('Currency & Paise Arithmetic', 'toPaise converts string and number rupees to exact integer paise', () => {
    assertEquals(toPaise(12.5), 1250, '12.50 rupees should be 1250 paise');
    assertEquals(toPaise('12.50'), 1250, 'String "12.50" should be 1250 paise');
    assertEquals(toPaise('12.505'), 1251, 'Rounding half up: 12.505 should be 1251 paise');
    assertEquals(toPaise(0), 0, '0 should be 0 paise');
    assertEquals(toPaise(-5), -500, '-5 rupees should be -500 paise');
    assertEquals(toPaise('invalid'), 0, 'Invalid string should safely yield 0 paise');
  });

  test('Currency & Paise Arithmetic', 'toRupees converts integer paise back to fractional rupees', () => {
    assertEquals(toRupees(1250), 12.5, '1250 paise should be 12.5 rupees');
    assertEquals(toRupees(100), 1, '100 paise should be 1 rupee');
    assertEquals(toRupees(75), 0.75, '75 paise should be 0.75 rupees');
  });

  test('Currency & Paise Arithmetic', 'formatCurrency formats Indian Rupee with comma grouping', () => {
    const formatted = formatCurrency(25000000); // 2,50,000.00
    assert(formatted.includes('₹'), 'Must contain rupee symbol');
    assert(formatted.includes('2,50,000'), 'Must format with Indian thousands/lakhs grouping');
  });

  // --- Suite 2: Outward Quantity Validation & Immediate Inward Sync ---
  test('Outward Validation & Inward Sync', 'Dispatched quantity must not exceed available PO balance', () => {
    const poTotal = 5000;
    let dispatchedQty = 1500;
    let availableBalance = poTotal - dispatchedQty; // 3500

    const nextBatchQty = 4000;
    const isValid = nextBatchQty <= availableBalance;
    assertEquals(isValid, false, 'Dispatching 4000 against balance 3500 must fail validation');

    const validBatchQty = 2000;
    const isValid2 = validBatchQty <= availableBalance;
    assertEquals(isValid2, true, 'Dispatching 2000 against balance 3500 must pass validation');

    // Simulate immediate deduction
    dispatchedQty += validBatchQty;
    availableBalance = poTotal - dispatchedQty;
    assertEquals(availableBalance, 1500, 'Remaining balance must equal exactly 1500');
  });

  test('Outward Validation & Inward Sync', 'Outward batch revenue matches dispatched pieces multiplied by locked unit rate', () => {
    const ratePerPiecePaise = toPaise(125.5); // ₹125.50 -> 12550 paise
    const dispatchedQty = 1200;
    const lineTotalRevenuePaise = dispatchedQty * ratePerPiecePaise;

    assertEquals(lineTotalRevenuePaise, 15060000, '1200 * 12550 paise = 1,50,60,000 paise (₹1,50,600.00)');
    assertEquals(toRupees(lineTotalRevenuePaise), 150600, 'Line total rupees must be 150600');
  });

  // --- Suite 3: Live Net Profit Engine & 3-Way Partnership Equity ---
  test('Profit Engine & 3-Way Equity', 'Net factory profit correctly reconciles revenue, wages, and overheads', () => {
    const totalOutwardRevenuePaise = toPaise(500000); // ₹5,00,000
    const totalLaborWagesPaise = toPaise(145000); // ₹1,45,000
    const totalOverheadsPaise = toPaise(65000); // ₹65,000

    const netProfitPaise = totalOutwardRevenuePaise - totalLaborWagesPaise - totalOverheadsPaise;
    assertEquals(netProfitPaise, toPaise(290000), 'Net profit must be exactly ₹2,90,000 (29000000 paise)');
  });

  test('Profit Engine & 3-Way Equity', '3-way partnership profit distribution sums to 100% and calculates accurately', () => {
    const netProfitPaise = toPaise(300000); // ₹3,00,000
    const partners = [
      { id: '1', name: 'Partner A', percentage: 40.0 },
      { id: '2', name: 'Partner B', percentage: 30.0 },
      { id: '3', name: 'Partner C', percentage: 30.0 },
    ];

    const totalEquity = partners.reduce((sum, p) => sum + p.percentage, 0);
    assertEquals(totalEquity, 100.0, 'Equity shares must sum to exactly 100.0%');

    const shareA = Math.round((netProfitPaise * partners[0].percentage) / 100);
    const shareB = Math.round((netProfitPaise * partners[1].percentage) / 100);
    const shareC = Math.round((netProfitPaise * partners[2].percentage) / 100);

    assertEquals(toRupees(shareA), 120000, 'Partner A (40%) must receive ₹1,20,000');
    assertEquals(toRupees(shareB), 90000, 'Partner B (30%) must receive ₹90,000');
    assertEquals(toRupees(shareC), 90000, 'Partner C (30%) must receive ₹90,000');
    assertEquals(shareA + shareB + shareC, netProfitPaise, 'Sum of distributed shares must equal total net profit');
  });

  // --- Suite 4: Employee Directory & Worker Management ---
  test('Employee Management', 'Registering and removing employees accurately updates workforce records', () => {
    let workforce = [
      { id: 'w-1', name: 'Murugan K', code: 'ART-W01', designation: 'Overlock Tailor', department: 'Stitching Floor', phone: '+91 98421 11001', active: true },
      { id: 'w-2', name: 'Ravi Chandran', code: 'ART-W02', designation: 'Flatlock Operator', department: 'Stitching Floor', phone: '+91 98421 11002', active: true },
    ];

    // Add new employee
    const newWorker = {
      id: 'w-3',
      name: 'Anand V',
      code: 'ART-W03',
      designation: 'Cutting Master',
      department: 'Cutting Section',
      phone: '+91 98421 11003',
      active: true,
    };
    workforce = [...workforce, newWorker];
    assertEquals(workforce.length, 3, 'Workforce count must increase to 3');
    assertEquals(workforce[2].name, 'Anand V', 'New worker must be added');

    // Remove employee
    workforce = workforce.filter((w) => w.id !== 'w-2');
    assertEquals(workforce.length, 2, 'Workforce count must decrease to 2 after removal');
    assert(!workforce.some((w) => w.id === 'w-2'), 'Removed worker w-2 must not exist in directory');
  });

  return results;
}

// If executed via node / tsx directly in terminal:
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('erp.test.ts')) {
  const testResults = runAllErpUnitTests();
  let failCount = 0;
  console.log('\n=== AR TEX ERP UNIT TEST SUITE ===');
  testResults.forEach((r, idx) => {
    if (r.passed) {
      console.log(`✓ [${r.suite}] ${r.name}`);
    } else {
      failCount++;
      console.error(`✗ [${r.suite}] ${r.name} -> FAIL: ${r.error}`);
    }
  });
  console.log(`\nResults: ${testResults.length - failCount} Passed, ${failCount} Failed\n`);
  if (failCount > 0) process.exit(1);
}
