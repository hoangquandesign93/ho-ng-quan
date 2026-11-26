import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Gender, Household, Resident, ResidentStatus } from '../types/population';
import { generateId } from '../utils/formatters';

interface ResidentFormModalProps {
  open: boolean;
  initialResident?: Resident | null;
  defaultHouseholdId?: string;
  households: Household[];
  onSave: (resident: Resident) => void;
  onClose: () => void;
}

const RELATIONSHIPS = [
  'Chủ hộ',
  'Vợ',
  'Chồng',
  'Con',
  'Cha',
  'Mẹ',
  'Cháu',
  'Con dâu',
  'Con rể',
  'Anh / Chị / Em',
  'Người ở cùng',
  'Khác',
];

const ETHNICITIES = ['Kinh', 'Ê Đê', 'M’nông', 'Tày', 'Nùng', 'Thái', 'Mường', 'Dao', 'Gia Rai', 'Khác'];

export const ResidentFormModal: React.FC<ResidentFormModalProps> = ({
  open,
  initialResident,
  defaultHouseholdId,
  households,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(initialResident);

  const [householdId, setHouseholdId] = useState('');
  const [hoTen, setHoTen] = useState('');
  const [ngaySinh, setNgaySinh] = useState('');
  const [gioiTinh, setGioiTinh] = useState<Gender>('Nam');
  const [cccd, setCccd] = useState('');
  const [danToc, setDanToc] = useState('Kinh');
  const [tonGiao, setTonGiao] = useState('Không');
  const [queQuan, setQueQuan] = useState('Xã Ea Wer, Tỉnh Đắk Lắk');
  const [ngheNghiep, setNgheNghiep] = useState('');
  const [trinhDoHocVan, setTrinhDoHocVan] = useState('12/12');
  const [sdt, setSdt] = useState('');
  const [quanHeChuHo, setQuanHeChuHo] = useState('Con');
  const [tinhTrangCuTru, setTinhTrangCuTru] = useState<ResidentStatus>('Thường trú');
  const [ngayChuyenDen, setNgayChuyenDen] = useState('');
  const [ngayChuyenDi, setNgayChuyenDi] = useState('');
  const [nguoiCoCong, setNguoiCoCong] = useState(false);
  const [nguoiKhuyetTat, setNguoiKhuyetTat] = useState(false);
  const [ghiChu, setGhiChu] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (initialResident) {
      setHouseholdId(initialResident.householdId);
      setHoTen(initialResident.hoTen);
      setNgaySinh(initialResident.ngaySinh);
      setGioiTinh(initialResident.gioiTinh);
      setCccd(initialResident.cccd);
      setDanToc(initialResident.danToc);
      setTonGiao(initialResident.tonGiao);
      setQueQuan(initialResident.queQuan);
      setNgheNghiep(initialResident.ngheNghiep);
      setTrinhDoHocVan(initialResident.trinhDoHocVan);
      setSdt(initialResident.sdt);
      setQuanHeChuHo(initialResident.quanHeChuHo);
      setTinhTrangCuTru(initialResident.tinhTrangCuTru);
      setNgayChuyenDen(initialResident.ngayChuyenDen);
      setNgayChuyenDi(initialResident.ngayChuyenDi);
      setNguoiCoCong(initialResident.nguoiCoCong);
      setNguoiKhuyetTat(initialResident.nguoiKhuyetTat);
      setGhiChu(initialResident.ghiChu);
    } else {
      const targetHhId = defaultHouseholdId || households[0]?.id || '';
      const targetHh = households.find((h) => h.id === targetHhId);
      setHouseholdId(targetHhId);
      setHoTen('');
      setNgaySinh('');
      setGioiTinh('Nam');
      setCccd('');
      setDanToc('Kinh');
      setTonGiao('Không');
      setQueQuan('Xã Ea Wer, Tỉnh Đắk Lắk');
      setNgheNghiep('');
      setTrinhDoHocVan('12/12');
      setSdt('');
      setQuanHeChuHo('Con');
      setTinhTrangCuTru(targetHh?.loaiCuTru || 'Thường trú');
      setNgayChuyenDen(new Date().toISOString().split('T')[0]);
      setNgayChuyenDi('');
      setNguoiCoCong(false);
      setNguoiKhuyetTat(false);
      setGhiChu('');
    }
  }, [open, initialResident, defaultHouseholdId, households]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId) {
      setError('Vui lòng chọn hộ khẩu cho nhân khẩu này.');
      return;
    }
    if (!hoTen.trim() || !ngaySinh) {
      setError('Vui lòng nhập Họ và tên và Ngày tháng năm sinh.');
      return;
    }

    const now = new Date().toISOString();
    const record: Resident = {
      id: initialResident ? initialResident.id : generateId(),
      householdId,
      hoTen: hoTen.trim(),
      ngaySinh,
      gioiTinh,
      cccd: cccd.trim(),
      danToc: danToc.trim() || 'Kinh',
      tonGiao: tonGiao.trim() || 'Không',
      queQuan: queQuan.trim(),
      ngheNghiep: ngheNghiep.trim(),
      trinhDoHocVan: trinhDoHocVan.trim(),
      sdt: sdt.trim(),
      quanHeChuHo,
      tinhTrangCuTru,
      ngayChuyenDen,
      ngayChuyenDi,
      nguoiCoCong,
      nguoiKhuyetTat,
      ghiChu: ghiChu.trim(),
      createdAt: initialResident ? initialResident.createdAt : now,
      updatedAt: now,
    };

    onSave(record);
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
            {isEditing ? `Cập nhật Nhân khẩu: ${initialResident?.hoTen}` : 'Thêm Nhân khẩu mới'}
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
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thuộc hộ khẩu <span className="text-red-600">*</span>
              </label>
              <select
                value={householdId}
                onChange={(e) => setHouseholdId(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-[#1D4ED8]"
              >
                <option value="">-- Chọn hộ khẩu --</option>
                {households.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.maHoKhau} — Chủ hộ: {h.chuHoTen} ({h.loaiCuTru})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
                placeholder="VD: Trần Minh Tuấn"
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày tháng năm sinh <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={ngaySinh}
                onChange={(e) => setNgaySinh(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giới tính
              </label>
              <select
                value={gioiTinh}
                onChange={(e) => setGioiTinh(e.target.value as Gender)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-[#1D4ED8]"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quan hệ với chủ hộ
              </label>
              <select
                value={quanHeChuHo}
                onChange={(e) => setQuanHeChuHo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-[#1D4ED8]"
              >
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số CCCD / Định danh
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={cccd}
                onChange={(e) => setCccd(e.target.value)}
                placeholder="12 chữ số (nếu có)"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={sdt}
                onChange={(e) => setSdt(e.target.value)}
                placeholder="09xx xxx xxx"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dân tộc
              </label>
              <select
                value={danToc}
                onChange={(e) => setDanToc(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-[#1D4ED8]"
              >
                {ETHNICITIES.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tôn giáo (nếu có)
              </label>
              <input
                type="text"
                value={tonGiao}
                onChange={(e) => setTonGiao(e.target.value)}
                placeholder="Không / Phật giáo / Công giáo / Tin lành"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quê quán
              </label>
              <input
                type="text"
                value={queQuan}
                onChange={(e) => setQueQuan(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nghề nghiệp
              </label>
              <input
                type="text"
                value={ngheNghiep}
                onChange={(e) => setNgheNghiep(e.target.value)}
                placeholder="VD: Làm nông, Học sinh, Công nhân..."
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trình độ học vấn
              </label>
              <input
                type="text"
                value={trinhDoHocVan}
                onChange={(e) => setTrinhDoHocVan(e.target.value)}
                placeholder="VD: 12/12, Đại học, Trung cấp..."
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tình trạng cư trú
              </label>
              <select
                value={tinhTrangCuTru}
                onChange={(e) => setTinhTrangCuTru(e.target.value as ResidentStatus)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-[#1D4ED8]"
              >
                <option value="Thường trú">Thường trú</option>
                <option value="Tạm trú">Tạm trú</option>
                <option value="Tạm vắng / Vắng mặt">Tạm vắng / Vắng mặt</option>
                <option value="Đã chuyển đi">Đã chuyển đi</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày chuyển đến
                </label>
                <input
                  type="date"
                  value={ngayChuyenDen}
                  onChange={(e) => setNgayChuyenDen(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#1D4ED8]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày chuyển đi
                </label>
                <input
                  type="date"
                  value={ngayChuyenDi}
                  onChange={(e) => setNgayChuyenDi(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#1D4ED8]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-xs font-bold text-slate-700 mb-2">
              Đối tượng chính sách / Theo dõi đặc biệt
            </p>
            <div className="flex flex-wrap gap-5">
              <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer min-h-[36px]">
                <input
                  type="checkbox"
                  checked={nguoiCoCong}
                  onChange={(e) => setNguoiCoCong(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#C8102E]"
                />
                <span>Người có công với cách mạng</span>
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer min-h-[36px]">
                <input
                  type="checkbox"
                  checked={nguoiKhuyetTat}
                  onChange={(e) => setNguoiKhuyetTat(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-amber-600"
                />
                <span>Người khuyết tật</span>
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
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>

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
              {isEditing ? 'Lưu thay đổi' : 'Lưu nhân khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
