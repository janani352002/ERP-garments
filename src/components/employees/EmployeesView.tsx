import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Worker } from '../../types/erp';
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  Search,
  Phone,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scissors,
  Layers,
  ArrowRight,
  Filter,
  UserCheck,
  Lock,
  Eye,
  ShieldCheck,
  KeyRound,
  Copy,
  Share2,
  Sparkles,
} from 'lucide-react';
import { LoginModal } from '../layout/LoginModal';

export const EmployeesView: React.FC = () => {
  const {
    workers,
    addWorker,
    updateWorker,
    deleteWorker,
    updateWorkerOtp,
    productionLogs,
    navigate,
    isManager,
    currentUser,
    showNotification,
  } = useErp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Modal: Add Employee
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Stitching Floor');
  const [phone, setPhone] = useState('');
  const [otpPin, setOtpPin] = useState('');
  const [active, setActive] = useState(true);

  // Modal: Edit Employee
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // Dialog: Delete Employee
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);

  const departments = [
    'All',
    'Stitching Floor',
    'Cutting Section',
    'Finishing & Ironing',
    'Quality Checking',
    'Packing & Dispatch',
  ];

  // Auto-generate next employee code
  const getNextSuggestedCode = () => {
    const nextNum = workers.length + 1;
    return `ART-W${nextNum.toString().padStart(2, '0')}`;
  };

  const generateRandomOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const copyWorkerInvite = (worker: Worker) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pin = worker.otpPin || '1234';
    const text = `👕 *AR Tex - Staff Daily Work App*\n\nவணக்கம் ${worker.name},\nஉங்கள் தொழிற்சாலை தினசரி வேலை பதிவு செய்ய கீழே உள்ள இணைப்பை உங்கள் போனில் திறக்கவும்:\n\n🔗 ${origin}\n\n📱 Mobile: ${worker.phone}\n🔑 4-Digit Login OTP / PIN: *${pin}*\n\nஇணைப்பை திறந்து உங்கள் மொபைல் எண் மற்றும் PIN கொடுத்து உள்நுழையவும்.`;
    navigator.clipboard.writeText(text);
    showNotification(`Invite message with OTP (${pin}) copied for ${worker.name}!`, 'success');
  };

  const openAddModal = () => {
    if (!isManager) {
      setShowLoginModal(true);
      return;
    }
    setName('');
    setCode(getNextSuggestedCode());
    setDesignation('Stitching Tailor');
    setDepartment('Stitching Floor');
    setPhone('');
    setOtpPin(generateRandomOtp());
    setActive(true);
    setShowAddModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager || !name.trim()) return;

    addWorker({
      name: name.trim(),
      code: code.trim() || getNextSuggestedCode(),
      designation: designation.trim() || 'Stitching Tailor',
      department: department.trim() || 'Stitching Floor',
      phone: phone.trim() || '',
      otpPin: otpPin.trim() || generateRandomOtp(),
      active,
    });

    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager || !editingWorker || !editingWorker.name.trim()) return;

    updateWorker(editingWorker);
    setEditingWorker(null);
  };

  const handleDeleteConfirm = () => {
    if (isManager && workerToDelete) {
      deleteWorker(workerToDelete.id);
      setWorkerToDelete(null);
    }
  };

  // Filtered workers list
  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      !searchQuery ||
      w.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      w.code.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      w.designation.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      w.phone.includes(searchQuery.trim());

    const matchesDept = departmentFilter === 'All' || w.department === departmentFilter;

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && w.active) ||
      (statusFilter === 'Inactive' && !w.active);

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Department counts
  const totalEmployees = workers.length;
  const activeEmployees = workers.filter((w) => w.active).length;
  const stitchingCount = workers.filter((w) => w.department === 'Stitching Floor').length;

  return (
    <div className="space-y-6">
      {/* Role Banner if Staff (Other Person - View Only) */}
      {!isManager && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl text-xs text-blue-950 shadow-xs">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Staff View-Only Mode:</strong> Showing all employees and contact data. Edit and delete options are restricted to managers.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowLoginModal(true)}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shrink-0 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Manager Login</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-indigo-100 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Factory Employees & Tailor Directory</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
              {totalEmployees} Employees
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage factory floor tailors, cutters, line supervisors, and operators. Added workers appear automatically in Daily Production logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isManager ? (
            <button
              id="add-employee-header-btn"
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs active:scale-98"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Employee</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition-all"
              title="Authenticate as Manager to add, edit, or delete employees"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Manager Login to Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Total Registered</span>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalEmployees}</div>
          <span className="text-[10px] text-slate-500">Master Staff Directory</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <span className="text-[11px] font-bold uppercase text-emerald-800 block mb-1">Active on Floor</span>
          <div className="text-2xl font-black text-emerald-950 font-mono">{activeEmployees}</div>
          <span className="text-[10px] text-emerald-700 font-medium">Available for production</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Stitching Tailors</span>
          <div className="text-2xl font-black text-indigo-950 font-mono">{stitchingCount}</div>
          <span className="text-[10px] text-indigo-700 font-medium">Piece-rate operators</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Other Sections</span>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalEmployees - stitchingCount}</div>
          <span className="text-[10px] text-slate-500">Cutting, Checking, Packing</span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-indigo-100 shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Department Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setDepartmentFilter(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  departmentFilter === dept
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-900'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-medium text-slate-700"
            >
              <option value="All">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, code, skill..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredWorkers.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                No Employees Found
              </h3>
              <p className="text-xs text-slate-500">
                {searchQuery || departmentFilter !== 'All'
                  ? 'No employees match your search criteria. Try clearing the filter or search box.'
                  : 'Start by adding tailors and operators so supervisors can log their daily production batches.'}
              </p>
            </div>
            {isManager && (
              <div>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add First Employee</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-indigo-50/70 text-indigo-950 font-bold border-b border-indigo-200">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Employee Name</th>
                  <th className="py-3 px-4">Designation / Skill</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Phone Contact</th>
                  <th className="py-3 px-4 text-center">Staff Login OTP / PIN</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">{isManager ? 'Actions' : 'Floor Access'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100">
                {filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-indigo-50/30 transition-colors">
                    {/* Code */}
                    <td className="py-3 px-4 font-mono font-bold text-indigo-900">
                      {worker.code}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center font-sans shrink-0">
                          {worker.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 text-sm">
                          {worker.name}
                        </span>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {worker.designation}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {worker.department}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                      {worker.phone || '-'}
                    </td>

                    {/* Staff Login OTP / PIN with Quick Invite Button */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200">
                        <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-mono font-black text-xs text-amber-950">
                          {worker.otpPin || '1234'}
                        </span>
                        {isManager && (
                          <button
                            type="button"
                            onClick={() => copyWorkerInvite(worker)}
                            className="p-1 rounded hover:bg-amber-200 text-amber-800 transition-colors ml-1"
                            title="Copy WhatsApp invite message with Phone & OTP"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          worker.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {worker.active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-500" /> Inactive
                          </>
                        )}
                      </span>
                    </td>

                    {/* Actions: Manager has Edit & Delete, other person has View Only */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {isManager ? (
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => setEditingWorker({ ...worker })}
                            className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 transition-colors"
                            title="Edit Employee Information"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setWorkerToDelete(worker)}
                            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-900 hover:bg-rose-50 transition-colors"
                            title="Remove Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium cursor-help"
                          title="Only managers have permission to edit or remove employee records"
                        >
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>View Only</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add New Employee */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-indigo-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" /> Add New Employee
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Senthil Kumar"
                  required
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="ART-W07"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 font-mono font-bold focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                  >
                    <option value="Stitching Floor">Stitching Floor</option>
                    <option value="Cutting Section">Cutting Section</option>
                    <option value="Finishing & Ironing">Finishing & Ironing</option>
                    <option value="Quality Checking">Quality Checking</option>
                    <option value="Packing & Dispatch">Packing & Dispatch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Designation / Specialization
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Overlock Tailor, Flatlock Operator"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number (10 Digits)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9842012345"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 font-mono focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>Staff Login 4-Digit OTP / PIN</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtpPin(generateRandomOtp())}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline"
                  >
                    Generate Random PIN
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpPin}
                  onChange={(e) => setOtpPin(e.target.value)}
                  placeholder="e.g. 4821"
                  className="w-full px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50/50 font-mono font-bold text-center tracking-widest text-sm focus:outline-hidden focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Worker uses this PIN + phone number to log daily production in the mobile app.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="add-worker-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
                <label htmlFor="add-worker-active" className="text-slate-700 font-semibold cursor-pointer">
                  Active (appears in daily production dropdowns)
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs active:scale-98"
                >
                  Save Employee &amp; Set OTP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Employee */}
      {editingWorker && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-indigo-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" /> Edit Employee Particulars
              </h3>
              <button
                type="button"
                onClick={() => setEditingWorker(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={editingWorker.name}
                  onChange={(e) => setEditingWorker({ ...editingWorker, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee Code</label>
                  <input
                    type="text"
                    value={editingWorker.code}
                    onChange={(e) => setEditingWorker({ ...editingWorker, code: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={editingWorker.department}
                    onChange={(e) => setEditingWorker({ ...editingWorker, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="Stitching Floor">Stitching Floor</option>
                    <option value="Cutting Section">Cutting Section</option>
                    <option value="Finishing & Ironing">Finishing & Ironing</option>
                    <option value="Quality Checking">Quality Checking</option>
                    <option value="Packing & Dispatch">Packing & Dispatch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation / Skill</label>
                <input
                  type="text"
                  value={editingWorker.designation}
                  onChange={(e) => setEditingWorker({ ...editingWorker, designation: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingWorker.phone}
                  onChange={(e) => setEditingWorker({ ...editingWorker, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>Staff Login 4-Digit OTP / PIN</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingWorker({
                        ...editingWorker,
                        otpPin: generateRandomOtp(),
                      })
                    }
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline"
                  >
                    Reset Random PIN
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={editingWorker.otpPin || '1234'}
                  onChange={(e) => setEditingWorker({ ...editingWorker, otpPin: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50/50 font-mono font-bold text-center tracking-widest text-sm focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-worker-active"
                  checked={editingWorker.active}
                  onChange={(e) => setEditingWorker({ ...editingWorker, active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
                <label htmlFor="edit-worker-active" className="text-slate-700 font-semibold cursor-pointer">
                  Active (appears in daily production dropdowns)
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingWorker(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Update Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog: Remove / Delete Employee */}
      {workerToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                Remove Employee from Directory?
              </h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to remove <strong>{workerToDelete.name}</strong> ({workerToDelete.code})?
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                They will no longer appear in new daily production logging dropdowns. Existing logged production batches will preserve their names.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setWorkerToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-employee-btn"
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal for Role Switching */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};
