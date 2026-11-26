import React from 'react';
import {
  ArrowRightLeft,
  Edit3,
  Printer,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { Household, Resident } from '../types/population';
import { calculateAge, formatDateVN } from '../utils/formatters';

interface HouseholdDetailModalProps {
  open: boolean;
  household: Household | null;
  members: Resident[];
  onClose: () => void;
  onEditHousehold: (household: Household) => void;
  onAddMember: (householdId: string) => void;
  onEditMember: (resident: Resident) => void;
  onTransferMember: (resident: Resident) => void;
  onDeleteMember: (resident: Resident) => void;
  onPrintHousehold: (household: Household) => void;
}

export const HouseholdDetailModal: React.FC<HouseholdDetailModalProps> = ({
  open,
  household,
  members,
  onClose,
  onEditHousehold,
  onAddMember,
  onEditMember,
  onTransferMember,
  onDeleteMember,
  onPrintHousehold,
}) => {
  if (!open || !household) return null;

  const specialTags: string[] = [];
  if (household.laHoNgheo) specialTags.push('Hộ nghèo');
  if (household.laHoCanNgheo) specialTags.push('Hộ cận nghèo');
  if (household.laHoChinhSach) specialTags.push('Hộ chính sách');

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 bg-[#0A1E3F] text-white border-b-2 border-[#FACC15]">
          <div className="min-w-0">
            <p className="text-xs font-mono text-yellow-300">{household.maHoKhau}</p>
            <h3 className="text-base sm:text-lg font-bold truncate">
              Hộ ông/bà: {household.chuHoTen}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onPrintHousehold(household)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D4ED8] hover:bg-blue-600 text-xs font-semibold min-h-[36px] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In phiếu hộ</span>
            </button>
            <button
              type="button"
              onClick={() => onEditHousehold(household)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-[#0A1E3F] text-xs font-bold min-h-[36px] cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Sửa hộ</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Household Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div>
              <span className="text-xs text-slate-500 block">Chủ hộ &amp; Ngày sinh</span>
              <span className="font-semibold text-slate-900">
                {household.chuHoTen} · {formatDateVN(household.chuHoNgaySinh)} ({household.chuHoGioiTinh})
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Số CCCD &amp; SĐT</span>
              <span className="font-mono text-slate-900">
                {household.chuHoCCCD || '—'} · {household.chuHoSDT || '—'}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Loại &amp; Ngày đăng ký</span>
              <span className="font-semibold text-slate-900">
                {household.loaiCuTru} · {formatDateVN(household.ngayDangKyCuTru)}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs text-slate-500 block">Địa chỉ &amp; Thôn/Buôn</span>
              <span className="font-medium text-slate-900">
                {household.diaChiThuongTru} ({household.thonBuon})
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Thành phần &amp; Phân loại</span>
              <span className="font-medium text-slate-900">
                {household.thanhPhanHo}
                {specialTags.length > 0 ? ` · ${specialTags.join(', ')}` : ''}
              </span>
            </div>
            {household.ghiChu && (
              <div className="sm:col-span-2 lg:col-span-3 pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-500">Ghi chú: </span>
                <span className="text-xs text-slate-800">{household.ghiChu}</span>
              </div>
            )}
          </div>

          {/* Members Section */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-bold text-[#0A1E3F]">
                Danh sách nhân khẩu trong hộ ({members.length} người)
              </h4>
              <button
                type="button"
                onClick={() => onAddMember(household.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1D4ED8] hover:bg-blue-700 text-white text-xs font-bold min-h-[40px] cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm nhân khẩu vào hộ</span>
              </button>
            </div>

            {members.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                Chưa có nhân khẩu nào trong hộ này. Nhấn &ldquo;Thêm nhân khẩu vào hộ&rdquo; để bổ sung thành viên.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-xs font-bold text-slate-700">
                    <tr>
                      <th className="px-3 py-2.5">Họ và tên</th>
                      <th className="px-3 py-2.5">Quan hệ</th>
                      <th className="px-3 py-2.5">Ngày sinh / Tuổi</th>
                      <th className="px-3 py-2.5">CCCD / SĐT</th>
                      <th className="px-3 py-2.5">Cư trú</th>
                      <th className="px-3 py-2.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {members.map((m) => {
                      const age = calculateAge(m.ngaySinh);
                      return (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2.5">
                            <p className="font-semibold text-slate-900">{m.hoTen}</p>
                            <p className="text-xs text-slate-500">
                              {m.gioiTinh} · {m.danToc} · {m.ngheNghiep || '—'}
                            </p>
                          </td>
                          <td className="px-3 py-2.5 text-slate-700 font-medium whitespace-nowrap">
                            {m.quanHeChuHo}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs text-slate-700 whitespace-nowrap">
                            {formatDateVN(m.ngaySinh)} ({age}t)
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs text-slate-600 whitespace-nowrap">
                            <div>{m.cccd || 'Chưa có CCCD'}</div>
                            {m.sdt && <div>{m.sdt}</div>}
                          </td>
                          <td className="px-3 py-2.5 text-xs font-medium text-slate-700 whitespace-nowrap">
                            {m.tinhTrangCuTru}
                          </td>
                          <td className="px-3 py-2.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => onEditMember(m)}
                                className="p-2 rounded-lg text-blue-700 hover:bg-blue-50 cursor-pointer"
                                title="Sửa nhân khẩu"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onTransferMember(m)}
                                className="p-2 rounded-lg text-amber-700 hover:bg-amber-50 cursor-pointer"
                                title="Chuyển sang hộ khác"
                              >
                                <ArrowRightLeft className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteMember(m)}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                                title="Xóa nhân khẩu"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
