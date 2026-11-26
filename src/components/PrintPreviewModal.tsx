import React from 'react';
import { Printer, X } from 'lucide-react';
import { DashboardStats, Household, Resident } from '../types/population';
import { calculateAge, formatDateVN } from '../utils/formatters';

export type PrintJob =
  | { type: 'households'; title: string; households: Household[]; residents: Resident[] }
  | { type: 'residents'; title: string; residents: Resident[]; households: Household[] }
  | { type: 'household_detail'; household: Household; members: Resident[] }
  | {
      type: 'report';
      stats: DashboardStats;
      households: Household[];
      residents: Resident[];
      dateRangeLabel: string;
    };

interface PrintPreviewModalProps {
  job: PrintJob | null;
  onClose: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ job, onClose }) => {
  if (!job) return null;

  const todayStr = formatDateVN(new Date().toISOString().split('T')[0]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 overflow-y-auto p-0 sm:p-6 print:static print:bg-white print:p-0">
      {/* Screen-only toolbar */}
      <div className="no-print sticky top-0 z-10 max-w-4xl mx-auto mb-3 bg-[#0A1E3F] text-white px-4 py-3 sm:rounded-xl shadow-lg flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold">Bản xem trước In / Xuất PDF (Khổ A4)</p>
          <p className="text-xs text-yellow-300">
            Nhấn &ldquo;In / Lưu thành PDF&rdquo; và chọn máy in hoặc &ldquo;Save as PDF&rdquo;.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-[#0A1E3F] font-bold text-xs sm:text-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In / Lưu thành PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
            aria-label="Đóng bản xem trước"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable A4 Sheet */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-6 sm:p-10 shadow-2xl print:shadow-none print:p-0">
        {/* Official Vietnamese Administrative Header */}
        <div className="grid grid-cols-2 gap-4 text-center pb-4 border-b-2 border-slate-800 mb-6">
          <div>
            <p className="text-xs font-bold uppercase">UBND XÃ EA WER</p>
            <p className="text-xs font-extrabold uppercase underline underline-offset-4">
              BAN TỰ QUẢN THÔN 1
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p className="text-xs font-bold underline underline-offset-4">
              Độc lập - Tự do - Hạnh phúc
            </p>
            <p className="text-[11px] italic mt-1">Ea Wer, ngày {todayStr}</p>
          </div>
        </div>

        {/* Body by Job Type */}
        {job.type === 'households' && (
          <div>
            <h2 className="text-center text-base font-extrabold uppercase mb-1">{job.title}</h2>
            <p className="text-center text-xs text-slate-600 mb-4">
              Địa bàn: Thôn 1, Xã Ea Wer, Tỉnh Đắk Lắk · Tổng số: {job.households.length} hộ
            </p>
            <table className="w-full text-xs border border-slate-700">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-700 px-2 py-1.5">STT</th>
                  <th className="border border-slate-700 px-2 py-1.5">Mã hộ</th>
                  <th className="border border-slate-700 px-2 py-1.5">Chủ hộ</th>
                  <th className="border border-slate-700 px-2 py-1.5">CCCD / SĐT</th>
                  <th className="border border-slate-700 px-2 py-1.5">Địa chỉ</th>
                  <th className="border border-slate-700 px-2 py-1.5">Cư trú</th>
                  <th className="border border-slate-700 px-2 py-1.5">Số NK</th>
                </tr>
              </thead>
              <tbody>
                {job.households.map((h, i) => {
                  const cnt = job.residents.filter(
                    (r) => r.householdId === h.id && r.tinhTrangCuTru !== 'Đã chuyển đi'
                  ).length;
                  return (
                    <tr key={h.id}>
                      <td className="border border-slate-700 px-2 py-1 text-center">{i + 1}</td>
                      <td className="border border-slate-700 px-2 py-1 font-mono">{h.maHoKhau}</td>
                      <td className="border border-slate-700 px-2 py-1 font-semibold">{h.chuHoTen}</td>
                      <td className="border border-slate-700 px-2 py-1 font-mono">
                        {h.chuHoCCCD || '—'} / {h.chuHoSDT || '—'}
                      </td>
                      <td className="border border-slate-700 px-2 py-1">{h.diaChiThuongTru}</td>
                      <td className="border border-slate-700 px-2 py-1">{h.loaiCuTru}</td>
                      <td className="border border-slate-700 px-2 py-1 text-center">{cnt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {job.type === 'residents' && (
          <div>
            <h2 className="text-center text-base font-extrabold uppercase mb-1">{job.title}</h2>
            <p className="text-center text-xs text-slate-600 mb-4">
              Địa bàn: Thôn 1, Xã Ea Wer, Tỉnh Đắk Lắk · Tổng số: {job.residents.length} nhân khẩu
            </p>
            <table className="w-full text-xs border border-slate-700">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-700 px-2 py-1.5">STT</th>
                  <th className="border border-slate-700 px-2 py-1.5">Họ và tên</th>
                  <th className="border border-slate-700 px-2 py-1.5">Ngày sinh</th>
                  <th className="border border-slate-700 px-2 py-1.5">Giới tính</th>
                  <th className="border border-slate-700 px-2 py-1.5">Số CCCD</th>
                  <th className="border border-slate-700 px-2 py-1.5">Mã hộ</th>
                  <th className="border border-slate-700 px-2 py-1.5">Nghề nghiệp</th>
                  <th className="border border-slate-700 px-2 py-1.5">Cư trú</th>
                </tr>
              </thead>
              <tbody>
                {job.residents.map((r, i) => {
                  const hh = job.households.find((h) => h.id === r.householdId);
                  return (
                    <tr key={r.id}>
                      <td className="border border-slate-700 px-2 py-1 text-center">{i + 1}</td>
                      <td className="border border-slate-700 px-2 py-1 font-semibold">{r.hoTen}</td>
                      <td className="border border-slate-700 px-2 py-1 font-mono">
                        {formatDateVN(r.ngaySinh)} ({calculateAge(r.ngaySinh)}t)
                      </td>
                      <td className="border border-slate-700 px-2 py-1">{r.gioiTinh}</td>
                      <td className="border border-slate-700 px-2 py-1 font-mono">{r.cccd || '—'}</td>
                      <td className="border border-slate-700 px-2 py-1 font-mono">{hh?.maHoKhau || '—'}</td>
                      <td className="border border-slate-700 px-2 py-1">{r.ngheNghiep || '—'}</td>
                      <td className="border border-slate-700 px-2 py-1">{r.tinhTrangCuTru}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {job.type === 'household_detail' && (
          <div>
            <h2 className="text-center text-base font-extrabold uppercase mb-1">
              PHIẾU THÔNG TIN HỘ KHẨU ĐIỆN TỬ
            </h2>
            <p className="text-center text-xs font-mono font-bold mb-4">
              Mã hộ khẩu: {job.household.maHoKhau} · {job.household.loaiCuTru}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs mb-4 border border-slate-700 p-3">
              <p><strong>Chủ hộ:</strong> {job.household.chuHoTen}</p>
              <p><strong>Ngày sinh:</strong> {formatDateVN(job.household.chuHoNgaySinh)}</p>
              <p><strong>Số CCCD:</strong> {job.household.chuHoCCCD || '—'}</p>
              <p><strong>Điện thoại:</strong> {job.household.chuHoSDT || '—'}</p>
              <p className="col-span-2"><strong>Địa chỉ:</strong> {job.household.diaChiThuongTru}</p>
              <p><strong>Thành phần:</strong> {job.household.thanhPhanHo}</p>
              <p><strong>Ngày ĐK:</strong> {formatDateVN(job.household.ngayDangKyCuTru)}</p>
            </div>
            <table className="w-full text-xs border border-slate-700">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-700 px-2 py-1.5">STT</th>
                  <th className="border border-slate-700 px-2 py-1.5">Họ và tên</th>
                  <th className="border border-slate-700 px-2 py-1.5">Quan hệ</th>
                  <th className="border border-slate-700 px-2 py-1.5">Ngày sinh</th>
                  <th className="border border-slate-700 px-2 py-1.5">Giới tính</th>
                  <th className="border border-slate-700 px-2 py-1.5">CCCD</th>
                  <th className="border border-slate-700 px-2 py-1.5">Nghề nghiệp</th>
                </tr>
              </thead>
              <tbody>
                {job.members.map((m, i) => (
                  <tr key={m.id}>
                    <td className="border border-slate-700 px-2 py-1 text-center">{i + 1}</td>
                    <td className="border border-slate-700 px-2 py-1 font-semibold">{m.hoTen}</td>
                    <td className="border border-slate-700 px-2 py-1">{m.quanHeChuHo}</td>
                    <td className="border border-slate-700 px-2 py-1 font-mono">{formatDateVN(m.ngaySinh)}</td>
                    <td className="border border-slate-700 px-2 py-1">{m.gioiTinh}</td>
                    <td className="border border-slate-700 px-2 py-1 font-mono">{m.cccd || '—'}</td>
                    <td className="border border-slate-700 px-2 py-1">{m.ngheNghiep || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {job.type === 'report' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-base font-extrabold uppercase">
                BÁO CÁO THỐNG KÊ DÂN CƯ &amp; HỘ KHẨU
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Địa bàn: Thôn 1, Xã Ea Wer, Tỉnh Đắk Lắk · Kỳ thống kê: {job.dateRangeLabel}
              </p>
            </div>
            <table className="w-full text-xs border border-slate-700">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-700 px-3 py-1.5 text-left">Chỉ tiêu thống kê</th>
                  <th className="border border-slate-700 px-3 py-1.5 text-right">Số lượng</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Tổng số hộ khẩu', job.stats.totalHouseholds],
                  ['Số hộ thường trú', job.stats.permanentHouseholds],
                  ['Số hộ tạm trú', job.stats.temporaryHouseholds],
                  ['Tổng số nhân khẩu đang quản lý', job.stats.totalResidents],
                  ['Nhân khẩu Nam', job.stats.maleCount],
                  ['Nhân khẩu Nữ', job.stats.femaleCount],
                  ['Trẻ em dưới 16 tuổi', job.stats.childrenUnder16],
                  ['Người cao tuổi (≥ 60 tuổi)', job.stats.elderly60Plus],
                  ['Nam trong độ tuổi NVQS (18–27 tuổi)', job.stats.militaryServiceMales],
                  ['Hộ nghèo', job.stats.poorHouseholds],
                  ['Hộ cận nghèo', job.stats.nearPoorHouseholds],
                  ['Hộ gia đình chính sách', job.stats.policyHouseholds],
                  ['Người có công với cách mạng', job.stats.meritoriousCount],
                  ['Người khuyết tật', job.stats.disabledCount],
                ].map(([label, val]) => (
                  <tr key={String(label)}>
                    <td className="border border-slate-700 px-3 py-1.5">{label}</td>
                    <td className="border border-slate-700 px-3 py-1.5 text-right font-mono font-bold">
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature footer */}
        <div className="mt-8 grid grid-cols-2 text-center text-xs print-break-inside-avoid">
          <div>
            <p className="font-bold">NGƯỜI LẬP BIỂU</p>
            <p className="italic text-slate-500 mt-1">(Ký, ghi rõ họ tên)</p>
          </div>
          <div>
            <p className="font-bold">TRƯỞNG THÔN 1</p>
            <p className="italic text-slate-500 mt-1">(Ký, đóng dấu xác nhận)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
