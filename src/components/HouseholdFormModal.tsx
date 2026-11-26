import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Gender, Household, ResidenceType } from '../types/population';
import { generateHouseholdCode, generateId } from '../utils/formatters';

interface HouseholdFormModalProps {
  open: boolean;
  initialHousehold?: Household | null;
  existingHouseholds: Household[];
  onSave: (household: Household, autoCreateHeadResident: boolean) => void;
  onClose: () => void;
}

const HOUSEHOLD_COMPOSITIONS = [
  'Hộ nông nghiệp',
  'Hộ kinh doanh - dịch vụ',
  'Hộ cán bộ - viên chức',
  'Hộ công nhân - lao động',
  'Hộ lao động tự do',
  'Hộ viên chức thuê trọ',
  'Khác',
];

export const HouseholdFormModal: React.FC<HouseholdFormModalProps> = ({
  open,
  initialHousehold,
  existingHouseholds,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(initialHousehold);

  const [maHoKhau, setMaHoKhau] = useState('');
  const [chuHoTen, setChuHoTen] = useState('');
  const [chuHoNgaySinh, setChuHoNgaySinh] = useState('');
  const [chuHoGioiTinh, setChuHoGioiTinh] = useState<Gender>('Nam');
  const [chuHoCCCD, setChuHoCCCD] = useState('');
  const [chuHoSDT, setChuHoSDT] = useState('');
  const [diaChiThuongTru, setDiaChiThuongTru] = useState('');
  const [thonBuon, setThonBuon] = useState('Thôn 1, Xã Ea Wer');
  const [loaiCuTru, setLoaiCuTru] = useState<ResidenceType>('Thường trú');
  const [ngayDangKyCuTru, setNgayDangKyCuTru] = useState('');
  const [thanhPhanHo, setThanhPhanHo] = useState('Hộ nông nghiệp');
  const [laHoNgheo, setLaHoNgheo] = useState(false);
  const [laHoCanNgheo, setLaHoCanNgheo] = useState(false);
  const [laHoChinhSach, setLaHoChinhSach] = useState(false);
  const [ghiChu, setGhiChu] = useState('');
  const [autoCreateHead, setAutoCreateHead] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (initialHousehold) {
      setMaHoKhau(initialHousehold.maHoKhau);
      setChuHoTen(initialHousehold.chuHoTen);
      setChuHoNgaySinh(initialHousehold.chuHoNgaySinh);
      setChuHoGioiTinh(initialHousehold.chuHoGioiTinh);
      setChuHoCCCD(initialHousehold.chuHoCCCD);
      setChuHoSDT(initialHousehold.chuHoSDT);
      setDiaChiThuongTru(initialHousehold.diaChiThuongTru);
      setThonBuon(initialHousehold.thonBuon);
      setLoaiCuTru(initialHousehold.loaiCuTru);
      setNgayDangKyCuTru(initialHousehold.ngayDangKyCuTru);
      setThanhPhanHo(initialHousehold.thanhPhanHo || 'Hộ nông nghiệp');
      setLaHoNgheo(initialHousehold.laHoNgheo);
      setLaHoCanNgheo(initialHousehold.laHoCanNgheo);
      setLaHoChinhSach(initialHousehold.laHoChinhSach);
      setGhiChu(initialHousehold.ghiChu);
      setAutoCreateHead(false);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setMaHoKhau(generateHouseholdCode(existingHouseholds));
      setChuHoTen('');
      setChuHoNgaySinh('');
      setChuHoGioiTinh('Nam');
      setChuHoCCCD('');
      setChuHoSDT('');
      setDiaChiThuongTru('Thôn 1, Xã Ea Wer, Tỉnh Đắk Lắk');
      setThonBuon('Thôn 1, Xã Ea Wer');
      setLoaiCuTru('Thường trú');
      setNgayDangKyCuTru(today);
      setThanhPhanHo('Hộ nông nghiệp');
      setLaHoNgheo(false);
      setLaHoCanNgheo(false);
      setLaHoChinhSach(false);
      setGhiChu('');
      setAutoCreateHead(true);
    }
  }, [open, initialHousehold, existingHouseholds]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maHoKhau.trim() || !chuHoTen.trim() || !chuHoNgaySinh || !diaChiThuongTru.trim()) {
      setError('Vui lòng điền đầy đủ Mã hộ khẩu, Họ tên chủ hộ, Ngày sinh và Địa chỉ.');
      return;
    }

    const duplicate = existingHouseholds.find(
      (h) =>
        h.maHoKhau.trim().toLowerCase() === maHoKhau.trim().toLowerCase() &&
        h.id !== initialHousehold?.id
    );
    if (duplicate) {
      setError(`Mã hộ khẩu "${maHoKhau}" đã tồn tại. Vui lòng dùng mã khác.`);
      return;
    }

    const now = new Date().toISOString();
    const record: Household = {
      id: initialHousehold ? initialHousehold.id : generateId(),
      maHoKhau: maHoKhau.trim().toUpperCase(),
      chuHoTen: chuHoTen.trim(),
      chuHoNgaySinh,
      chuHoGioiTinh,
      chuHoCCCD: chuHoCCCD.trim(),
      chuHoSDT: chuHoSDT.trim(),
      diaChiThuongTru: diaChiThuongTru.trim(),
      thonBuon: thonBuon.trim() || 'Thôn 1, Xã Ea Wer',
      loaiCuTru,
      ngayDangKyCuTru,
      thanhPhanHo,
      laHoNgheo,
      laHoCanNgheo,
      laHoChinhSach,
      ghiChu: ghiChu.trim(),
      createdAt: initialHousehold ? initialHousehold.createdAt : now,
      updatedAt: now,
    };

    onSave(record, !isEditing && autoCreateHead);
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[92vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-[#0A1E3F] text-white border-b-2 border-[#FACC15]">
          <h3 className="text-base sm:text-lg font-bold">
            {isEditing ? `Cập nhật Hộ khẩu ${initialHousehold?.maHoKhau}` : 'Thêm Hộ khẩu mới'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã hộ khẩu (tự động) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={maHoKhau}
                onChange={(e) => setMaHoKhau(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên chủ hộ <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={chuHoTen}
                onChange={(e) => setChuHoTen(e.target.value)}
                placeholder="VD: Nguyễn Văn An"
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày sinh chủ hộ <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={chuHoNgaySinh}
                onChange={(e) => setChuHoNgaySinh(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giới tính chủ hộ
              </label>
              <select
                value={chuHoGioiTinh}
                onChange={(e) => setChuHoGioiTinh(e.target.value as Gender)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-[#1D4ED8]"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số CCCD chủ hộ
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={chuHoCCCD}
                onChange={(e) => setChuHoCCCD(e.target.value)}
                placeholder="12 chữ số"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={chuHoSDT}
                onChange={(e) => setChuHoSDT(e.target.value)}
                placeholder="09xx xxx xxx"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ thường trú <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={diaChiThuongTru}
                onChange={(e) => setDiaChiThuongTru(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thôn, buôn, tổ dân cư
              </label>
              <input
                type="text"
                value={thonBuon}
                onChange={(e) => setThonBuon(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loại cư trú
              </label>
              <select
                value={loaiCuTru}
                onChange={(e) => setLoaiCuTru(e.target.value as ResidenceType)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-[#1D4ED8]"
              >
                <option value="Thường trú">Thường trú</option>
                <option value="Tạm trú">Tạm trú</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày đăng ký cư trú
              </label>
              <input
                type="date"
                value={ngayDangKyCuTru}
                onChange={(e) => setNgayDangKyCuTru(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thành phần hộ gia đình
              </label>
              <select
                value={thanhPhanHo}
                onChange={(e) => setThanhPhanHo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-[#1D4ED8]"
              >
                {HOUSEHOLD_COMPOSITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-xs font-bold text-slate-700 mb-2.5">
              Phân loại hộ đặc thù
            </p>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer min-h-[36px]">
                <input
                  type="checkbox"
                  checked={laHoNgheo}
                  onChange={(e) => {
                    setLaHoNgheo(e.target.checked);
                    if (e.target.checked) setLaHoCanNgheo(false);
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span>Hộ nghèo</span>
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer min-h-[36px]">
                <input
                  type="checkbox"
                  checked={laHoCanNgheo}
                  onChange={(e) => {
                    setLaHoCanNgheo(e.target.checked);
                    if (e.target.checked) setLaHoNgheo(false);
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span>Hộ cận nghèo</span>
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer min-h-[36px]">
                <input
                  type="checkbox"
                  checked={laHoChinhSach}
                  onChange={(e) => setLaHoChinhSach(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#1D4ED8] focus:ring-[#1D4ED8]"
                />
                <span>Hộ chính sách</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú
            </label>
            <textarea
              rows={2}
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Ghi chú thêm về hộ gia đình..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>

          {!isEditing && (
            <label className="flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCreateHead}
                onChange={(e) => setAutoCreateHead(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-blue-300 text-[#1D4ED8]"
              />
              <span>
                <strong>Tự động tạo nhân khẩu Chủ hộ</strong> vào danh sách thành viên của hộ khẩu này ngay sau khi lưu.
              </span>
            </label>
          )}

          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px] cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#0A1E3F] hover:bg-[#112F62] text-white text-sm font-bold min-h-[44px] cursor-pointer"
            >
              {isEditing ? 'Lưu thay đổi' : 'Lưu hộ khẩu mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
