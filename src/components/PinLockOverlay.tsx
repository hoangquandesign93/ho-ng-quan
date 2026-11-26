import React, { useEffect, useState } from 'react';
import { Delete, Eye, Lock, ShieldCheck } from 'lucide-react';

interface PinLockOverlayProps {
  open: boolean;
  isDefaultPin: boolean;
  onUnlock: (pin: string) => Promise<boolean>;
  onCancelToReadOnly?: () => void;
  reason?: string;
}

export const PinLockOverlay: React.FC<PinLockOverlayProps> = ({
  open,
  isDefaultPin,
  onUnlock,
  onCancelToReadOnly,
  reason,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPin('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const handleDigit = (d: string) => {
    if (pin.length >= 8) return;
    setError('');
    setPin((prev) => prev + d);
  };

  const handleBackspace = () => {
    setError('');
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length < 4) {
      setError('Vui lòng nhập tối thiểu 4 ký tự mã PIN.');
      return;
    }
    setSubmitting(true);
    const ok = await onUnlock(pin);
    setSubmitting(false);
    if (!ok) {
      setError('Mã PIN không chính xác. Vui lòng thử lại.');
      setPin('');
    }
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-[#071630]/85 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Xác thực mã PIN quản trị"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#0A1E3F] px-6 py-5 text-white text-center border-b-4 border-[#FACC15]">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#C8102E] border-2 border-[#FACC15] flex items-center justify-center">
            <Lock className="w-6 h-6 text-[#FACC15]" />
          </div>
          <h2 className="mt-3 text-lg font-bold">Màn hình đang khóa bảo mật</h2>
          <p className="mt-1 text-xs text-yellow-300 font-medium">
            Thôn 1 · Xã Ea Wer · Tỉnh Đắk Lắk
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          {reason && (
            <p className="mb-3 text-xs text-center text-slate-600 bg-slate-100 rounded-lg px-3 py-2">
              {reason}
            </p>
          )}

          {isDefaultPin && (
            <div className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Mã PIN mặc định ban đầu là <strong className="font-mono">123456</strong>. Vui lòng đổi mã PIN trong mục Quản trị sau khi đăng nhập.
              </span>
            </div>
          )}

          <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
            Nhập mã PIN quản trị để mở khóa
          </label>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => {
              setError('');
              setPin(e.target.value.replace(/\s+/g, '').slice(0, 8));
            }}
            placeholder="••••••"
            autoFocus
            className="w-full text-center text-2xl font-mono tracking-[0.4em] px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8]"
          />

          {error && (
            <p className="mt-2 text-xs font-medium text-red-600 text-center">{error}</p>
          )}

          {/* Touch-friendly numeric keypad for iPhone */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="h-11 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-mono text-lg font-bold transition-colors cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPin('')}
              className="h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              Xóa hết
            </button>
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-11 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-mono text-lg font-bold transition-colors cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Xóa một ký tự"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-[#0A1E3F] hover:bg-[#112F62] text-white font-bold text-sm shadow-sm min-h-[44px] transition-colors cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Đang kiểm tra...' : 'Mở khóa quyền Quản trị'}
            </button>

            {onCancelToReadOnly && (
              <button
                type="button"
                onClick={onCancelToReadOnly}
                className="w-full py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs inline-flex items-center justify-center gap-1.5 min-h-[42px] cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Tiếp tục ở chế độ Chỉ xem (không chỉnh sửa)</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
