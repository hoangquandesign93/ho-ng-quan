import React, { useState } from 'react';
import {
  Database,
  Download,
  Lock,
  Plus,
  ShieldCheck,
  Smartphone,
  Unlock,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderBannerProps {
  isUnlocked: boolean;
  onAddHousehold: () => void;
  onLoadSampleData: () => void;
  onQuickExportJson: () => void;
  onToggleLock: () => void;
  onOpenAdminTab: () => void;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  isUnlocked,
  onAddHousehold,
  onLoadSampleData,
  onQuickExportJson,
  onToggleLock,
  onOpenAdminTab,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  return (
    <>
      <header className="no-print relative overflow-hidden bg-gradient-to-br from-[#071630] via-[#0A1E3F] to-[#112F62] text-white border-b-4 border-[#FACC15]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Civic Emblem + Title + Address */}
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-[2.5px] border-[#FACC15] shadow-md overflow-hidden flex items-center justify-center">
                <img
                  src="/assets/aistudio/image_71d2d7a5.png"
                  alt="Biểu tượng Quản lý dữ liệu dân cư"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover scale-[1.03]"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-semibold tracking-wider text-slate-200 uppercase">
                  Hệ thống dữ liệu hành chính cơ sở
                </p>
                <h1 className="mt-0.5 text-lg sm:text-2xl lg:text-[26px] font-extrabold tracking-tight text-white leading-snug text-balance">
                  QUẢN LÝ DỮ LIỆU DÂN CƯ &amp; HỘ KHẨU ĐIỆN TỬ
                </h1>
                <p className="mt-1 text-sm sm:text-base font-bold text-[#FACC15] flex flex-wrap items-center gap-x-2">
                  <span>Thôn 1</span>
                  <span aria-hidden="true" className="text-yellow-300/70">·</span>
                  <span>Xã Ea Wer</span>
                  <span aria-hidden="true" className="text-yellow-300/70">·</span>
                  <span>Tỉnh Đắk Lắk</span>
                </p>
              </div>
            </div>

            {/* Right: Admin status + Action Buttons (Yellow, Blue, Dark Blue) */}
            <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200">
                <button
                  type="button"
                  onClick={onOpenAdminTab}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0E2B5C] hover:bg-[#153978] border border-blue-400/30 transition-colors min-h-[32px] whitespace-nowrap"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>Quyền: Quản trị (Admin + PIN)</span>
                  <span aria-hidden="true">·</span>
                  <span className={isUnlocked ? 'text-emerald-300 font-semibold' : 'text-amber-300 font-semibold'}>
                    {isUnlocked ? 'Đang mở khóa' : 'Đang khóa'}
                  </span>
                </button>

                {!isInstalled && isInstallable && (
                  <button
                    type="button"
                    onClick={install}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1D4ED8] hover:bg-blue-600 text-white font-medium transition-colors min-h-[32px] whitespace-nowrap"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Cài ứng dụng</span>
                  </button>
                )}

                {!isInstalled && !isInstallable && isIOS && (
                  <button
                    type="button"
                    onClick={() => setShowIOSGuide(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0E2B5C] hover:bg-[#153978] border border-blue-400/30 text-white font-medium transition-colors min-h-[32px] whitespace-nowrap"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#FACC15]" />
                    <span>Thêm vào iPhone</span>
                  </button>
                )}
              </div>

              {/* Action buttons row: responsive wrap on mobile, crisp single line on desktop */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onAddHousehold}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-[#0A1E3F] font-bold text-xs sm:text-sm shadow-sm transition-colors min-h-[44px] sm:min-h-[40px] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Thêm hộ mới</span>
                </button>

                <button
                  type="button"
                  onClick={onLoadSampleData}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-lg bg-[#2563EB] hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors min-h-[44px] sm:min-h-[40px] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Database className="w-4 h-4 shrink-0" />
                  <span>Nạp 20 hộ mẫu</span>
                </button>

                <button
                  type="button"
                  onClick={onQuickExportJson}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-lg bg-[#1D4ED8] hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors min-h-[44px] sm:min-h-[40px] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Sao lưu JSON</span>
                </button>

                <button
                  type="button"
                  onClick={onToggleLock}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-lg bg-[#0F2D5C] hover:bg-[#173E7D] border border-blue-300/30 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors min-h-[44px] sm:min-h-[40px] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isUnlocked ? (
                    <>
                      <Lock className="w-4 h-4 text-[#FACC15] shrink-0" />
                      <span>Khóa màn hình</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 text-[#FACC15] shrink-0" />
                      <span>Mở khóa PIN</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* iOS Safari Add to Home Screen Guide */}
      {showIOSGuide && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-slate-200 text-slate-900">
            <h3 className="text-lg font-bold text-[#0A1E3F]">Thêm ứng dụng vào iPhone</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Để sử dụng nhanh như ứng dụng riêng trên iPhone 11 và các dòng iPhone khác:
            </p>
            <ol className="mt-3 space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li>Nhấn biểu tượng <strong>Chia sẻ (Share)</strong> ở thanh dưới trình duyệt Safari.</li>
              <li>Cuộn xuống và chọn <strong>Thêm vào MH chính (Add to Home Screen)</strong>.</li>
              <li>Nhấn <strong>Thêm (Add)</strong> để lưu biểu tượng lên màn hình chính.</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-lg bg-[#0A1E3F] py-2.5 text-sm font-semibold text-white hover:bg-[#112F62] min-h-[44px] cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
};
