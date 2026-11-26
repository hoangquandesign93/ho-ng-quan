import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Lock, X } from 'lucide-react';
import { AdminBackupView } from './components/AdminBackupView';
import { ConfirmModal } from './components/ConfirmModal';
import { HeaderBanner } from './components/HeaderBanner';
import { HouseholdDetailModal } from './components/HouseholdDetailModal';
import { HouseholdFormModal } from './components/HouseholdFormModal';
import { HouseholdsView } from './components/HouseholdsView';
import { NavigationTabs } from './components/NavigationTabs';
import { PinLockOverlay } from './components/PinLockOverlay';
import { PrintJob, PrintPreviewModal } from './components/PrintPreviewModal';
import { ReportsView } from './components/ReportsView';
import { ResidentFormModal } from './components/ResidentFormModal';
import { ResidentsView } from './components/ResidentsView';
import { StatsDashboard } from './components/StatsDashboard';
import { TargetGroupsView } from './components/TargetGroupsView';
import { TransferResidentModal } from './components/TransferResidentModal';
import { generateSampleData } from './data/sampleData';
import {
  appendAuditLog,
  deleteHouseholdWithResidents,
  deleteResidentRecord,
  getPinConfig,
  loadAllDatabaseData,
  replaceAllDatabaseData,
  saveHouseholdRecord,
  savePinConfig,
  saveResidentRecord,
} from './db/indexedDb';
import {
  AuditActionType,
  AuditLogEntry,
  BackupPayload,
  Household,
  NavTab,
  PinConfig,
  Resident,
  TargetGroupKey,
} from './types/population';
import {
  exportFullBackupJson,
  exportHouseholdsToExcel,
  exportReportToExcel,
  exportResidentsToExcel,
  parseAndValidateBackupJson,
} from './utils/exportUtils';
import { computeDashboardStats, generateId } from './utils/formatters';
import { generateSalt, hashPin, verifyPin } from './utils/security';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const [activeTab, setActiveTab] = useState<NavTab>('households');
  const [selectedGroup, setSelectedGroup] = useState<TargetGroupKey>('children_under_16');

  // Security / PIN state
  const [pinConfig, setPinConfig] = useState<PinConfig>({
    pinHash: '',
    salt: '',
    isDefaultPin: true,
    autoLockMinutes: 5,
    updatedAt: new Date().toISOString(),
  });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinPromptReason, setPinPromptReason] = useState<string | undefined>(undefined);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Modals
  const [householdFormOpen, setHouseholdFormOpen] = useState(false);
  const [editingHousehold, setEditingHousehold] = useState<Household | null>(null);
  const [detailHouseholdId, setDetailHouseholdId] = useState<string | null>(null);

  const [residentFormOpen, setResidentFormOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [defaultResidentHouseholdId, setDefaultResidentHouseholdId] = useState<string | undefined>(
    undefined
  );

  const [transferResident, setTransferResident] = useState<Resident | null>(null);
  const [printJob, setPrintJob] = useState<PrintJob | null>(null);

  // Confirmations
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    danger: boolean;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Xác nhận',
    danger: true,
    onConfirm: () => {},
  });

  // Toast notification
  const [toast, setToast] = useState<{ text: string; type: 'ok' | 'warn' } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((text: string, type: 'ok' | 'warn' = 'ok') => {
    setToast({ text, type });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4000);
  }, []);

  // Initialize IndexedDB & PIN hash
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const [data, existingPin] = await Promise.all([
          loadAllDatabaseData(),
          getPinConfig(),
        ]);

        let activePin = existingPin;
        if (!activePin) {
          const salt = generateSalt();
          const pinHash = await hashPin('123456', salt);
          activePin = {
            pinHash,
            salt,
            isDefaultPin: true,
            autoLockMinutes: 5,
            updatedAt: new Date().toISOString(),
          };
          await savePinConfig(activePin);
        }

        if (!mounted) return;
        setHouseholds(data.households);
        setResidents(data.residents);
        setAuditLogs(data.auditLogs);
        setPinConfig(activePin);
      } catch (err) {
        console.error(err);
        showToast('Không thể khởi tạo cơ sở dữ liệu cục bộ IndexedDB.', 'warn');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, [showToast]);

  // Auto-lock inactivity timer
  useEffect(() => {
    if (!isUnlocked || !pinConfig.autoLockMinutes || pinConfig.autoLockMinutes <= 0) {
      return;
    }

    let timeoutId: number;
    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsUnlocked(false);
        setPinPromptReason(
          `Màn hình đã tự động khóa sau ${pinConfig.autoLockMinutes} phút không thao tác.`
        );
        setPinModalOpen(true);
      }, pinConfig.autoLockMinutes * 60 * 1000);
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [isUnlocked, pinConfig.autoLockMinutes]);

  const recordLog = useCallback(
    async (action: AuditActionType, target: string, details: string) => {
      const entry: AuditLogEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        action,
        target,
        details,
      };
      setAuditLogs((prev) => [entry, ...prev]);
      try {
        await appendAuditLog(entry);
      } catch (e) {
        console.error(e);
      }
    },
    []
  );

  // Security gate for any write/modify action
  const requireAdminAuth = useCallback(
    (reason: string, action: () => void) => {
      if (isUnlocked) {
        action();
        return;
      }
      pendingActionRef.current = action;
      setPinPromptReason(reason);
      setPinModalOpen(true);
    },
    [isUnlocked]
  );

  const handleUnlockAttempt = async (inputPin: string): Promise<boolean> => {
    const valid = await verifyPin(inputPin, pinConfig.pinHash, pinConfig.salt);
    if (!valid) return false;

    setIsUnlocked(true);
    setPinModalOpen(false);
    setPinPromptReason(undefined);
    await recordLog('BAO_MAT', 'Quản trị viên', 'Đã mở khóa màn hình bằng mã PIN.');
    showToast('Đã mở khóa quyền Quản trị.');

    const pending = pendingActionRef.current;
    pendingActionRef.current = null;
    if (pending) {
      pending();
    }
    return true;
  };

  const handleLockScreen = () => {
    setIsUnlocked(false);
    pendingActionRef.current = null;
    setPinPromptReason('Màn hình đã được khóa theo yêu cầu.');
    setPinModalOpen(true);
    recordLog('BAO_MAT', 'Quản trị viên', 'Đã khóa màn hình quản trị.');
  };

  const handleChangePin = async (
    currentPinInput: string,
    newPinInput: string
  ): Promise<{ ok: boolean; message: string }> => {
    const valid = await verifyPin(currentPinInput, pinConfig.pinHash, pinConfig.salt);
    if (!valid) {
      return { ok: false, message: 'Mã PIN hiện tại không đúng.' };
    }
    const newSalt = generateSalt();
    const newHash = await hashPin(newPinInput, newSalt);
    const updated: PinConfig = {
      ...pinConfig,
      pinHash: newHash,
      salt: newSalt,
      isDefaultPin: false,
      updatedAt: new Date().toISOString(),
    };
    await savePinConfig(updated);
    setPinConfig(updated);
    await recordLog('BAO_MAT', 'Mã PIN quản trị', 'Đã đổi sang mã PIN mới (băm SHA-256).');
    showToast('Đã cập nhật mã PIN bảo mật mới.');
    return { ok: true, message: 'Đổi mã PIN thành công!' };
  };

  const handleUpdateAutoLock = async (minutes: number) => {
    const updated: PinConfig = {
      ...pinConfig,
      autoLockMinutes: minutes,
      updatedAt: new Date().toISOString(),
    };
    await savePinConfig(updated);
    setPinConfig(updated);
    await recordLog(
      'BAO_MAT',
      'Tự động khóa',
      minutes > 0 ? `Đặt thời gian tự khóa: ${minutes} phút.` : 'Đã tắt tự động khóa.'
    );
    showToast(minutes > 0 ? `Đã đặt tự khóa sau ${minutes} phút.` : 'Đã tắt tự động khóa.');
  };

  // Live computed statistics
  const stats = useMemo(() => computeDashboardStats(households, residents), [households, residents]);

  const detailHousehold = useMemo(
    () => households.find((h) => h.id === detailHouseholdId) || null,
    [households, detailHouseholdId]
  );

  const detailMembers = useMemo(
    () => residents.filter((r) => r.householdId === detailHouseholdId),
    [residents, detailHouseholdId]
  );

  // Household CRUD
  const openAddHousehold = () => {
    requireAdminAuth('Vui lòng mở khóa mã PIN để thêm hộ khẩu mới.', () => {
      setEditingHousehold(null);
      setHouseholdFormOpen(true);
    });
  };

  const openEditHousehold = (hh: Household) => {
    requireAdminAuth(`Vui lòng mở khóa mã PIN để sửa hộ khẩu ${hh.maHoKhau}.`, () => {
      setEditingHousehold(hh);
      setHouseholdFormOpen(true);
    });
  };

  const handleSaveHousehold = async (hh: Household, autoCreateHead: boolean) => {
    const isEdit = households.some((item) => item.id === hh.id);
    await saveHouseholdRecord(hh);

    let nextHouseholds: Household[];
    if (isEdit) {
      nextHouseholds = households.map((item) => (item.id === hh.id ? hh : item));
    } else {
      nextHouseholds = [...households, hh].sort((a, b) => a.maHoKhau.localeCompare(b.maHoKhau));
    }
    setHouseholds(nextHouseholds);

    if (!isEdit && autoCreateHead) {
      const now = new Date().toISOString();
      const headResident: Resident = {
        id: generateId(),
        householdId: hh.id,
        hoTen: hh.chuHoTen,
        ngaySinh: hh.chuHoNgaySinh,
        gioiTinh: hh.chuHoGioiTinh,
        cccd: hh.chuHoCCCD,
        danToc: 'Kinh',
        tonGiao: 'Không',
        queQuan: 'Xã Ea Wer, Tỉnh Đắk Lắk',
        ngheNghiep: '',
        trinhDoHocVan: '',
        sdt: hh.chuHoSDT,
        quanHeChuHo: 'Chủ hộ',
        tinhTrangCuTru: hh.loaiCuTru,
        ngayChuyenDen: hh.ngayDangKyCuTru,
        ngayChuyenDi: '',
        nguoiCoCong: false,
        nguoiKhuyetTat: false,
        ghiChu: '',
        createdAt: now,
        updatedAt: now,
      };
      await saveResidentRecord(headResident);
      setResidents((prev) =>
        [...prev, headResident].sort((a, b) => a.hoTen.localeCompare(b.hoTen, 'vi'))
      );
    }

    setHouseholdFormOpen(false);
    setEditingHousehold(null);
    await recordLog(
      isEdit ? 'SUA_HO' : 'THEM_HO',
      `${hh.maHoKhau} (${hh.chuHoTen})`,
      isEdit ? 'Cập nhật thông tin hộ khẩu.' : 'Thêm mới hộ khẩu vào hệ thống.'
    );
    showToast(isEdit ? `Đã cập nhật hộ ${hh.maHoKhau}.` : `Đã thêm mới hộ ${hh.maHoKhau}.`);
  };

  const handleDeleteHousehold = (hh: Household) => {
    requireAdminAuth(`Vui lòng mở khóa mã PIN để xóa hộ khẩu ${hh.maHoKhau}.`, () => {
      const memberCount = residents.filter((r) => r.householdId === hh.id).length;
      setConfirmState({
        open: true,
        title: `Xóa hộ khẩu ${hh.maHoKhau}?`,
        message: `Bạn có chắc muốn xóa hộ ông/bà ${hh.chuHoTen}?\nThao tác này sẽ xóa vĩnh viễn hộ khẩu và ${memberCount} nhân khẩu thuộc hộ này khỏi thiết bị.`,
        confirmLabel: 'Xóa hộ khẩu',
        danger: true,
        onConfirm: async () => {
          setConfirmState((s) => ({ ...s, open: false }));
          await deleteHouseholdWithResidents(hh.id);
          setHouseholds((prev) => prev.filter((item) => item.id !== hh.id));
          setResidents((prev) => prev.filter((r) => r.householdId !== hh.id));
          if (detailHouseholdId === hh.id) setDetailHouseholdId(null);
          await recordLog(
            'XOA_HO',
            `${hh.maHoKhau} (${hh.chuHoTen})`,
            `Đã xóa hộ khẩu cùng ${memberCount} nhân khẩu liên quan.`
          );
          showToast(`Đã xóa hộ khẩu ${hh.maHoKhau}.`);
        },
      });
    });
  };

  // Resident CRUD
  const openAddResident = (householdId?: string) => {
    requireAdminAuth('Vui lòng mở khóa mã PIN để thêm nhân khẩu mới.', () => {
      setEditingResident(null);
      setDefaultResidentHouseholdId(householdId);
      setResidentFormOpen(true);
    });
  };

  const openEditResident = (r: Resident) => {
    requireAdminAuth(`Vui lòng mở khóa mã PIN để chỉnh sửa nhân khẩu ${r.hoTen}.`, () => {
      setEditingResident(r);
      setDefaultResidentHouseholdId(undefined);
      setResidentFormOpen(true);
    });
  };

  const handleSaveResident = async (r: Resident) => {
    const isEdit = residents.some((item) => item.id === r.id);
    await saveResidentRecord(r);
    setResidents((prev) => {
      const updated = isEdit ? prev.map((item) => (item.id === r.id ? r : item)) : [...prev, r];
      return updated.sort((a, b) => a.hoTen.localeCompare(b.hoTen, 'vi'));
    });

    setResidentFormOpen(false);
    setEditingResident(null);
    const hh = households.find((h) => h.id === r.householdId);
    await recordLog(
      isEdit ? 'SUA_NHAN_KHAU' : 'THEM_NHAN_KHAU',
      r.hoTen,
      `${isEdit ? 'Cập nhật' : 'Thêm mới'} vào hộ ${hh?.maHoKhau || ''}.`
    );
    showToast(isEdit ? `Đã cập nhật nhân khẩu ${r.hoTen}.` : `Đã thêm nhân khẩu ${r.hoTen}.`);
  };

  const handleDeleteResident = (r: Resident) => {
    requireAdminAuth(`Vui lòng mở khóa mã PIN để xóa nhân khẩu ${r.hoTen}.`, () => {
      setConfirmState({
        open: true,
        title: `Xóa nhân khẩu "${r.hoTen}"?`,
        message: 'Dữ liệu nhân khẩu này sẽ bị xóa khỏi hộ khẩu và thống kê địa bàn.',
        confirmLabel: 'Xóa nhân khẩu',
        danger: true,
        onConfirm: async () => {
          setConfirmState((s) => ({ ...s, open: false }));
          await deleteResidentRecord(r.id);
          setResidents((prev) => prev.filter((item) => item.id !== r.id));
          await recordLog('XOA_NHAN_KHAU', r.hoTen, 'Đã xóa nhân khẩu khỏi hệ thống.');
          showToast(`Đã xóa nhân khẩu ${r.hoTen}.`);
        },
      });
    });
  };

  const openTransferResident = (r: Resident) => {
    requireAdminAuth(`Vui lòng mở khóa mã PIN để chuyển hộ cho ${r.hoTen}.`, () => {
      setTransferResident(r);
    });
  };

  const handleConfirmTransfer = async (
    residentId: string,
    targetHouseholdId: string,
    newRelation: string
  ) => {
    const targetResident = residents.find((r) => r.id === residentId);
    if (!targetResident) return;

    const oldHh = households.find((h) => h.id === targetResident.householdId);
    const newHh = households.find((h) => h.id === targetHouseholdId);

    const updated: Resident = {
      ...targetResident,
      householdId: targetHouseholdId,
      quanHeChuHo: newRelation,
      updatedAt: new Date().toISOString(),
    };
    await saveResidentRecord(updated);
    setResidents((prev) => prev.map((r) => (r.id === residentId ? updated : r)));
    setTransferResident(null);

    await recordLog(
      'CHUYEN_HO',
      targetResident.hoTen,
      `Chuyển từ hộ ${oldHh?.maHoKhau || '—'} sang hộ ${newHh?.maHoKhau || '—'} (Quan hệ: ${newRelation}).`
    );
    showToast(`Đã chuyển ${targetResident.hoTen} sang hộ ${newHh?.maHoKhau || ''}.`);
  };

  // Sample data loader
  const handleLoadSampleData = () => {
    requireAdminAuth('Vui lòng mở khóa mã PIN để nạp bộ dữ liệu 20 hộ mẫu.', () => {
      const hasExisting = households.length > 0 || residents.length > 0;
      const executeSeed = async () => {
        const sample = generateSampleData();
        await replaceAllDatabaseData(sample.households, sample.residents);
        setHouseholds(sample.households);
        setResidents(sample.residents);
        await recordLog(
          'NAP_DU_LIEU_MAU',
          '20 hộ khẩu · 67 nhân khẩu',
          'Nạp bộ dữ liệu mẫu Thôn 1, Xã Ea Wer.'
        );
        showToast('Đã nạp thành công 20 hộ khẩu (67 nhân khẩu) mẫu.');
      };

      if (hasExisting) {
        setConfirmState({
          open: true,
          title: 'Nạp dữ liệu 20 hộ mẫu?',
          message:
            'Thao tác này sẽ thay thế dữ liệu hiện có trên thiết bị bằng bộ 20 hộ khẩu (67 nhân khẩu) mẫu.\nHãy xuất sao lưu JSON trước nếu bạn muốn giữ dữ liệu cũ.',
          confirmLabel: 'Nạp dữ liệu mẫu',
          danger: true,
          onConfirm: async () => {
            setConfirmState((s) => ({ ...s, open: false }));
            await executeSeed();
          },
        });
      } else {
        executeSeed();
      }
    });
  };

  // Export & Restore JSON
  const handleExportJson = async () => {
    exportFullBackupJson(households, residents, auditLogs);
    await recordLog(
      'SAO_LUU',
      'Tệp JSON toàn bộ',
      `Xuất sao lưu ${households.length} hộ khẩu và ${residents.length} nhân khẩu.`
    );
    showToast('Đã tải xuống tệp sao lưu JSON.');
  };

  const handleImportJsonFile = (file: File) => {
    requireAdminAuth('Vui lòng mở khóa mã PIN để khôi phục dữ liệu từ tệp JSON.', async () => {
      try {
        const text = await file.text();
        const payload: BackupPayload = parseAndValidateBackupJson(text);
        setConfirmState({
          open: true,
          title: 'Khôi phục dữ liệu từ tệp sao lưu?',
          message: `Tệp sao lưu chứa ${payload.households.length} hộ khẩu và ${payload.residents.length} nhân khẩu.\nXác nhận khôi phục sẽ thay thế dữ liệu hiện tại trên thiết bị này.`,
          confirmLabel: 'Khôi phục ngay',
          danger: true,
          onConfirm: async () => {
            setConfirmState((s) => ({ ...s, open: false }));
            await replaceAllDatabaseData(
              payload.households,
              payload.residents,
              payload.auditLogs
            );
            setHouseholds(payload.households);
            setResidents(payload.residents);
            if (payload.auditLogs.length > 0) setAuditLogs(payload.auditLogs);
            await recordLog(
              'KHOI_PHUC',
              file.name,
              `Khôi phục ${payload.households.length} hộ khẩu, ${payload.residents.length} nhân khẩu.`
            );
            showToast(`Đã khôi phục ${payload.households.length} hộ khẩu và ${payload.residents.length} nhân khẩu.`);
          },
        });
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : 'Không thể đọc tệp sao lưu JSON.',
          'warn'
        );
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6FA] pb-20 md:pb-8">
      <HeaderBanner
        isUnlocked={isUnlocked}
        onAddHousehold={openAddHousehold}
        onLoadSampleData={handleLoadSampleData}
        onQuickExportJson={handleExportJson}
        onToggleLock={() => {
          if (isUnlocked) {
            handleLockScreen();
          } else {
            setPinPromptReason(undefined);
            setPinModalOpen(true);
          }
        }}
        onOpenAdminTab={() => setActiveTab('admin')}
      />

      {/* Read-only indicator bar when locked */}
      {!isUnlocked && (
        <div className="no-print bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>
                Chế độ Chỉ xem: Cần mở khóa mã PIN Quản trị để thêm, sửa, xóa hoặc khôi phục dữ liệu.
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                setPinPromptReason(undefined);
                setPinModalOpen(true);
              }}
              className="font-bold text-[#0A1E3F] underline underline-offset-2 hover:text-[#1D4ED8] cursor-pointer"
            >
              Mở khóa ngay
            </button>
          </div>
        </div>
      )}

      <main className="no-print flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* 4 Live Statistical Cards */}
        <StatsDashboard
          stats={stats}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onSelectGroup={(group) => {
            setSelectedGroup(group);
            setActiveTab('groups');
          }}
        />

        {/* Navigation Tabs */}
        <NavigationTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          counts={{
            households: households.length,
            residents: stats.totalResidents,
          }}
        />

        {/* Active View */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-500">
            Đang tải dữ liệu dân cư từ cơ sở dữ liệu cục bộ...
          </div>
        ) : (
          <>
            {activeTab === 'households' && (
              <HouseholdsView
                households={households}
                residents={residents}
                onAddHousehold={openAddHousehold}
                onViewHousehold={(hh) => setDetailHouseholdId(hh.id)}
                onEditHousehold={openEditHousehold}
                onDeleteHousehold={handleDeleteHousehold}
                onAddMemberToHousehold={(hhId) => openAddResident(hhId)}
                onExportExcel={(filtered) => {
                  exportHouseholdsToExcel(filtered, residents);
                  showToast('Đã xuất danh sách hộ khẩu ra tệp Excel (.xlsx).');
                }}
                onPrintList={(filtered) =>
                  setPrintJob({
                    type: 'households',
                    title: 'DANH SÁCH HỘ KHẨU ĐIỆN TỬ',
                    households: filtered,
                    residents,
                  })
                }
              />
            )}

            {activeTab === 'residents' && (
              <ResidentsView
                residents={residents}
                households={households}
                onAddResident={() => openAddResident()}
                onEditResident={openEditResident}
                onTransferResident={openTransferResident}
                onDeleteResident={handleDeleteResident}
                onViewHousehold={(hh) => setDetailHouseholdId(hh.id)}
                onExportExcel={(filtered) => {
                  exportResidentsToExcel(filtered, households);
                  showToast('Đã xuất danh sách nhân khẩu ra tệp Excel (.xlsx).');
                }}
                onPrintList={(filtered) =>
                  setPrintJob({
                    type: 'residents',
                    title: 'DANH SÁCH NHÂN KHẨU ĐỊA BÀN',
                    residents: filtered,
                    households,
                  })
                }
              />
            )}

            {activeTab === 'groups' && (
              <TargetGroupsView
                households={households}
                residents={residents}
                selectedGroup={selectedGroup}
                onSelectGroup={setSelectedGroup}
                onViewHousehold={(hh) => setDetailHouseholdId(hh.id)}
                onEditResident={openEditResident}
                onExportGroupResidents={(_title, items) => {
                  exportResidentsToExcel(items, households);
                  showToast('Đã xuất danh sách nhóm đối tượng ra Excel.');
                }}
                onExportGroupHouseholds={(_title, items) => {
                  exportHouseholdsToExcel(items, residents);
                  showToast('Đã xuất danh sách nhóm hộ gia đình ra Excel.');
                }}
                onPrintGroupResidents={(title, items) =>
                  setPrintJob({
                    type: 'residents',
                    title: `DANH SÁCH: ${title.toUpperCase()}`,
                    residents: items,
                    households,
                  })
                }
                onPrintGroupHouseholds={(title, items) =>
                  setPrintJob({
                    type: 'households',
                    title: `DANH SÁCH: ${title.toUpperCase()}`,
                    households: items,
                    residents,
                  })
                }
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                households={households}
                residents={residents}
                onExportReportExcel={(repStats, repHh, repRes, label) => {
                  exportReportToExcel(repStats, repHh, repRes, label);
                  showToast('Đã xuất báo cáo thống kê ra tệp Excel (.xlsx).');
                }}
                onPrintReport={(repStats, repHh, repRes, label) =>
                  setPrintJob({
                    type: 'report',
                    stats: repStats,
                    households: repHh,
                    residents: repRes,
                    dateRangeLabel: label,
                  })
                }
              />
            )}

            {activeTab === 'admin' && (
              <AdminBackupView
                isUnlocked={isUnlocked}
                pinConfig={pinConfig}
                households={households}
                residents={residents}
                auditLogs={auditLogs}
                onLockNow={handleLockScreen}
                onRequestUnlock={() => {
                  setPinPromptReason(undefined);
                  setPinModalOpen(true);
                }}
                onChangePin={handleChangePin}
                onUpdateAutoLock={handleUpdateAutoLock}
                onLoadSampleData={handleLoadSampleData}
                onExportJson={handleExportJson}
                onImportJsonFile={handleImportJsonFile}
                onExportHouseholdsExcel={() => {
                  exportHouseholdsToExcel(households, residents);
                  showToast('Đã xuất Excel danh sách hộ khẩu.');
                }}
                onExportResidentsExcel={() => {
                  exportResidentsToExcel(residents, households);
                  showToast('Đã xuất Excel danh sách nhân khẩu.');
                }}
                onPrintHouseholds={() =>
                  setPrintJob({
                    type: 'households',
                    title: 'DANH SÁCH HỘ KHẨU ĐIỆN TỬ',
                    households,
                    residents,
                  })
                }
                onPrintResidents={() =>
                  setPrintJob({
                    type: 'residents',
                    title: 'DANH SÁCH NHÂN KHẨU ĐỊA BÀN',
                    residents,
                    households,
                  })
                }
              />
            )}
          </>
        )}
      </main>

      {/* Modals & Overlays */}
      <PinLockOverlay
        open={pinModalOpen}
        isDefaultPin={pinConfig.isDefaultPin}
        reason={pinPromptReason}
        onUnlock={handleUnlockAttempt}
        onCancelToReadOnly={() => {
          pendingActionRef.current = null;
          setPinModalOpen(false);
        }}
      />

      <HouseholdFormModal
        open={householdFormOpen}
        initialHousehold={editingHousehold}
        existingHouseholds={households}
        onSave={handleSaveHousehold}
        onClose={() => {
          setHouseholdFormOpen(false);
          setEditingHousehold(null);
        }}
      />

      <HouseholdDetailModal
        open={Boolean(detailHousehold)}
        household={detailHousehold}
        members={detailMembers}
        onClose={() => setDetailHouseholdId(null)}
        onEditHousehold={openEditHousehold}
        onAddMember={(hhId) => openAddResident(hhId)}
        onEditMember={openEditResident}
        onTransferMember={openTransferResident}
        onDeleteMember={handleDeleteResident}
        onPrintHousehold={(hh) =>
          setPrintJob({
            type: 'household_detail',
            household: hh,
            members: residents.filter((r) => r.householdId === hh.id),
          })
        }
      />

      <ResidentFormModal
        open={residentFormOpen}
        initialResident={editingResident}
        defaultHouseholdId={defaultResidentHouseholdId}
        households={households}
        onSave={handleSaveResident}
        onClose={() => {
          setResidentFormOpen(false);
          setEditingResident(null);
        }}
      />

      <TransferResidentModal
        open={Boolean(transferResident)}
        resident={transferResident}
        households={households}
        onConfirmTransfer={handleConfirmTransfer}
        onClose={() => setTransferResident(null)}
      />

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        danger={confirmState.danger}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((s) => ({ ...s, open: false }))}
      />

      <PrintPreviewModal job={printJob} onClose={() => setPrintJob(null)} />

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className={`no-print fixed bottom-20 md:bottom-5 right-4 left-4 sm:left-auto sm:max-w-sm z-50 rounded-xl px-4 py-3 shadow-xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold ${
            toast.type === 'ok'
              ? 'bg-[#0A1E3F] text-white border-[#FACC15]'
              : 'bg-red-700 text-white border-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#FACC15] shrink-0" />
            <span>{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-white/70 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
