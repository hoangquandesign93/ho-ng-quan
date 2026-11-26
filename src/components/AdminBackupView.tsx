import React, { useRef, useState } from 'react';
import {
  Database,
  Download,
  FileSpreadsheet,
  History,
  Info,
  KeyRound,
  Lock,
  Printer,
  ShieldCheck,
  Unlock,
  Upload,
} from 'lucide-react';
import { AuditLogEntry, Household, PinConfig, Resident } from '../types/population';
import { formatDateTimeVN } from '../utils/formatters';

interface AdminBackupViewProps {
  isUnlocked: boolean;
  pinConfig: PinConfig;
  households: Household[];
  residents: Resident[];
  auditLogs: AuditLogEntry[];
  onLockNow: () => void;
  onRequestUnlock: () => void;
  onChangePin: (currentPin: string, newPin: string) => Promise<{ ok: boolean; message: string }>;
  onUpdateAutoLock: (minutes: number) => void;
  onLoadSampleData: () => void;
  onExportJson: () => void;
  onImportJsonFile: (file: File) => void;
  onExportHouseholdsExcel: () => void;
  onExportResidentsExcel: () => void;
  onPrintHouseholds: () => void;
  onPrintResidents: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  THEM_HO: 'Thêm hộ khẩu',
  SUA_HO: 'Sửa hộ khẩu',
  XOA_HO: 'Xóa hộ khẩu',
  THEM_NHAN_KHAU: 'Thêm nhân khẩu',
  SUA_NHAN_KHAU: 'Sửa nhân khẩu',
  XOA_NHAN_KHAU: 'Xóa nhân khẩu',
  CHUYEN_HO: 'Chuyển hộ khẩu',
  NAP_DU_LIEU_MAU: 'Nạp dữ liệu mẫu',
  SAO_LUU: 'Sao lưu dữ liệu',
  KHOI_PHUC: 'Khôi phục dữ liệu',
  BAO_MAT: 'Bảo mật / Mã PIN',
};

export const AdminBackupView: React.FC<AdminBackupViewProps> = ({
  isUnlocked,
  pinConfig,
  households,
  residents,
  auditLogs,
  onLockNow,
  onRequestUnlock,
  onChangePin,
  onUpdateAutoLock,
  onLoadSampleData,
  onExportJson,
  onImportJsonFile,
  onExportHouseholdsExcel,
  onExportResidentsExcel,
  onPrintHouseholds,
  onPrintResidents,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStatus, setPinStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinStatus(null);
    if (!isUnlocked) {
      onRequestUnlock();
      return;
    }
    if (newPin.length < 4 || newPin.length > 8) {
      setPinStatus({ type: 'err', text: 'Mã PIN mới phải từ 4 đến 8 ký tự số.' });
      return;
    }
    if (newPin !== confirmPin) {
      setPinStatus({ type: 'err', text: 'Xác nhận mã PIN mới không khớp.' });
      return;
    }
    const res = await onChangePin(currentPin, newPin);
    setPinStatus({ type: res.ok ? 'ok' : 'err', text: res.message });
    if (res.ok) {
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    }
  };

  return (
    <section className="space-y-5">
      {/* Local Storage Sync Notice */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#1D4ED8] shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p className="font-bold text-[#0A1E3F]">
            Cơ chế lưu trữ lâu dài tại chỗ (IndexedDB) &amp; Lưu ý đồng bộ thiết bị
          </p>
          <p className="mt-1">
            Mọi thao tác thêm, sửa, xóa đều được <strong>tự động lưu ngay lập tức</strong> vào cơ sở dữ liệu IndexedDB của trình duyệt. Đóng ứng dụng hoặc tắt máy mở lại vẫn giữ nguyên dữ liệu.
            Tuy nhiên, dữ liệu lưu cục bộ <strong>không tự đồng bộ giữa các thiết bị khác nhau</strong> (ví dụ giữa iPhone và máy tính). Để chuyển dữ liệu sang máy khác, hãy dùng chức năng <strong>Xuất tệp sao lưu JSON</strong> và <strong>Khôi phục từ tệp JSON</strong>. Nếu cần nhiều cán bộ dùng chung trực tuyến theo thời gian thực, hệ thống cần kết nối máy chủ cơ sở dữ liệu tập trung và xác thực tài khoản riêng.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Admin & Security Panel */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#0A1E3F] text-[#FACC15] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A1E3F]">Quản trị &amp; Bảo mật (Admin + PIN)</h3>
                <p className="text-xs text-slate-500">
                  Mã PIN được băm SHA-256 kèm salt, không lưu văn bản thuần
                </p>
              </div>
            </div>

            {isUnlocked ? (
              <button
                type="button"
                onClick={onLockNow}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0A1E3F] hover:bg-[#112F62] text-white text-xs font-bold min-h-[38px] cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>Khóa ngay</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onRequestUnlock}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-[#0A1E3F] text-xs font-bold min-h-[38px] cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Mở khóa PIN</span>
              </button>
            )}
          </div>

          {/* Auto Lock Setting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg bg-slate-50 border border-slate-200 p-3">
            <div>
              <p className="text-xs font-bold text-slate-800">Tự động khóa màn hình khi không thao tác</p>
              <p className="text-[11px] text-slate-500">Ngăn chỉnh sửa trái phép khi rời khỏi thiết bị</p>
            </div>
            <select
              value={pinConfig.autoLockMinutes}
              onChange={(e) => onUpdateAutoLock(Number(e.target.value))}
              disabled={!isUnlocked}
              className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white disabled:opacity-60"
            >
              <option value={1}>Sau 1 phút</option>
              <option value={5}>Sau 5 phút (Khuyên dùng)</option>
              <option value={15}>Sau 15 phút</option>
              <option value={30}>Sau 30 phút</option>
              <option value={0}>Tắt tự động khóa</option>
            </select>
          </div>

          {/* Change PIN Form */}
          <form onSubmit={handlePinSubmit} className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Đổi mã PIN quản trị</span>
            </h4>

            {pinConfig.isDefaultPin && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Hệ thống đang dùng mã PIN mặc định (<strong className="font-mono">123456</strong>). Hãy đổi sang mã PIN cá nhân để bảo mật.
              </p>
            )}

            {pinStatus && (
              <p
                className={`text-xs font-medium rounded-lg px-3 py-2 border ${
                  pinStatus.type === 'ok'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {pinStatus.text}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="password"
                inputMode="numeric"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                placeholder="PIN hiện tại"
                required
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono"
              />
              <input
                type="password"
                inputMode="numeric"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="PIN mới (4–8 số)"
                required
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono"
              />
              <input
                type="password"
                inputMode="numeric"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Nhập lại PIN mới"
                required
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg bg-[#0A1E3F] hover:bg-[#112F62] text-white text-xs sm:text-sm font-bold min-h-[42px] cursor-pointer"
            >
              Cập nhật mã PIN mới
            </button>
          </form>
        </div>

        {/* Backup, Restore, Sample & Export Panel */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A1E3F]">Sao lưu, Khôi phục &amp; Xuất dữ liệu</h3>
                <p className="text-xs text-slate-500 tabular-nums">
                  Hiện có {households.length} hộ khẩu · {residents.length} nhân khẩu trong IndexedDB
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onExportJson}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0A1E3F] hover:bg-[#112F62] text-white text-xs sm:text-sm font-bold min-h-[46px] cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#FACC15]" />
              <span>Xuất sao lưu toàn bộ (.JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-[#0A1E3F] text-xs sm:text-sm font-bold min-h-[46px] cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Khôi phục từ tệp (.JSON)</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  onImportJsonFile(f);
                  e.target.value = '';
                }
              }}
            />

            <button
              type="button"
              onClick={onExportHouseholdsExcel}
              disabled={households.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold min-h-[44px] disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel Hộ khẩu</span>
            </button>

            <button
              type="button"
              onClick={onExportResidentsExcel}
              disabled={residents.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold min-h-[44px] disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel Nhân khẩu</span>
            </button>

            <button
              type="button"
              onClick={onPrintHouseholds}
              disabled={households.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold min-h-[44px] disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In danh sách Hộ khẩu</span>
            </button>

            <button
              type="button"
              onClick={onPrintResidents}
              disabled={residents.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold min-h-[44px] disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In danh sách Nhân khẩu</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onLoadSampleData}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0A1E3F] text-xs sm:text-sm font-bold min-h-[44px] cursor-pointer"
            >
              <Database className="w-4 h-4 text-[#1D4ED8]" />
              <span>Nạp dữ liệu mẫu chuẩn (20 hộ khẩu · 67 nhân khẩu)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#1D4ED8]" />
            <h3 className="text-base font-bold text-[#0A1E3F]">
              Nhật ký thao tác hệ thống ({auditLogs.length})
            </h3>
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">
            Chưa có nhật ký hoạt động nào được ghi nhận.
          </p>
        ) : (
          <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-700 sticky top-0">
                <tr>
                  <th className="px-3 py-2.5">Thời gian</th>
                  <th className="px-3 py-2.5">Hành động</th>
                  <th className="px-3 py-2.5">Đối tượng</th>
                  <th className="px-3 py-2.5">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {auditLogs.slice(0, 100).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTimeVN(log.timestamp)}
                    </td>
                    <td className="px-3 py-2 font-semibold text-[#0A1E3F] whitespace-nowrap">
                      {ACTION_LABELS[log.action] || log.action}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-800">{log.target}</td>
                    <td className="px-3 py-2 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
