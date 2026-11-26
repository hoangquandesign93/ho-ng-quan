import React, { useMemo, useState } from 'react';
import { Calendar, FileSpreadsheet, Printer, RotateCcw } from 'lucide-react';
import { DashboardStats, Household, Resident } from '../types/population';
import { calculateAge, computeDashboardStats, formatDateVN } from '../utils/formatters';

interface ReportsViewProps {
  households: Household[];
  residents: Resident[];
  onExportReportExcel: (
    stats: DashboardStats,
    filteredHouseholds: Household[],
    filteredResidents: Resident[],
    dateRangeLabel: string
  ) => void;
  onPrintReport: (
    stats: DashboardStats,
    filteredHouseholds: Household[],
    filteredResidents: Resident[],
    dateRangeLabel: string
  ) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  households,
  residents,
  onExportReportExcel,
  onPrintReport,
}) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { filteredHouseholds, filteredResidents, dateRangeLabel } = useMemo(() => {
    const inRange = (dateStr: string) => {
      if (!fromDate && !toDate) return true;
      const d = (dateStr || '').split('T')[0];
      if (!d) return false;
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    };

    const hh = households.filter((h) => inRange(h.ngayDangKyCuTru || h.createdAt));
    const hhIds = new Set(hh.map((h) => h.id));
    const res = residents.filter(
      (r) => hhIds.has(r.householdId) || (fromDate || toDate ? inRange(r.ngayChuyenDen || r.createdAt) : true)
    );

    const label =
      fromDate || toDate
        ? `Từ ${fromDate ? formatDateVN(fromDate) : '...'} đến ${toDate ? formatDateVN(toDate) : 'nay'}`
        : 'Toàn bộ dữ liệu hiện hành';

    return {
      filteredHouseholds: hh,
      filteredResidents: res,
      dateRangeLabel: label,
    };
  }, [households, residents, fromDate, toDate]);

  const stats = useMemo(
    () => computeDashboardStats(filteredHouseholds, filteredResidents),
    [filteredHouseholds, filteredResidents]
  );

  const ageBuckets = useMemo(() => {
    const active = filteredResidents.filter((r) => r.tinhTrangCuTru !== 'Đã chuyển đi');
    const buckets = [
      { label: 'Mầm non (0 – 5 tuổi)', count: 0 },
      { label: 'Thiếu nhi & THCS (6 – 15 tuổi)', count: 0 },
      { label: 'Vị thành niên (16 – 17 tuổi)', count: 0 },
      { label: 'Thanh niên (18 – 27 tuổi)', count: 0 },
      { label: 'Lao động chính (28 – 59 tuổi)', count: 0 },
      { label: 'Người cao tuổi (≥ 60 tuổi)', count: 0 },
    ];
    for (const r of active) {
      const age = calculateAge(r.ngaySinh);
      if (age <= 5) buckets[0].count++;
      else if (age <= 15) buckets[1].count++;
      else if (age <= 17) buckets[2].count++;
      else if (age <= 27) buckets[3].count++;
      else if (age <= 59) buckets[4].count++;
      else buckets[5].count++;
    }
    return buckets;
  }, [filteredResidents]);

  const nvqsList = useMemo(() => {
    const hhMap = new Map(households.map((h) => [h.id, h]));
    return filteredResidents
      .filter((r) => {
        if (r.tinhTrangCuTru === 'Đã chuyển đi') return false;
        const age = calculateAge(r.ngaySinh);
        return r.gioiTinh === 'Nam' && age >= 18 && age <= 27;
      })
      .map((r) => ({
        resident: r,
        age: calculateAge(r.ngaySinh),
        household: hhMap.get(r.householdId),
      }));
  }, [filteredResidents, households]);

  const maxAgeCount = Math.max(1, ...ageBuckets.map((b) => b.count));

  return (
    <section className="space-y-4">
      {/* Filter & Export Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              <Calendar className="w-3.5 h-3.5 inline mr-1" />
              Thống kê đăng ký từ ngày
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
            />
          </div>

          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[38px] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Toàn bộ thời gian</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onExportReportExcel(stats, filteredHouseholds, filteredResidents, dateRangeLabel)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#1D4ED8] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold min-h-[42px] cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất báo cáo Excel</span>
          </button>

          <button
            type="button"
            onClick={() => onPrintReport(stats, filteredHouseholds, filteredResidents, dateRangeLabel)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0A1E3F] hover:bg-[#112F62] text-white text-xs sm:text-sm font-bold min-h-[42px] cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Xuất PDF / In báo cáo</span>
          </button>
        </div>
      </div>

      {/* Report Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* General Population & Residency Report */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5">
          <h3 className="text-base font-bold text-[#0A1E3F]">
            Báo cáo tổng hợp Hộ khẩu &amp; Nhân khẩu
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Kỳ báo cáo: {dateRangeLabel}</p>

          <div className="mt-4 divide-y divide-slate-100 text-sm">
            {[
              ['Tổng số hộ khẩu', stats.totalHouseholds],
              ['Số hộ thường trú', stats.permanentHouseholds],
              ['Số hộ tạm trú', stats.temporaryHouseholds],
              ['Tổng số nhân khẩu đang quản lý', stats.totalResidents],
              ['Nhân khẩu Nam', stats.maleCount],
              ['Nhân khẩu Nữ', stats.femaleCount],
              ['Người tạm trú', stats.temporaryResidents],
              ['Người vắng mặt khỏi địa phương', stats.absentResidents],
              ['Hộ nghèo', stats.poorHouseholds],
              ['Hộ cận nghèo', stats.nearPoorHouseholds],
              ['Hộ gia đình chính sách', stats.policyHouseholds],
              ['Người có công với cách mạng', stats.meritoriousCount],
              ['Người khuyết tật', stats.disabledCount],
            ].map(([label, val]) => (
              <div key={String(label)} className="py-2.5 flex items-center justify-between">
                <span className="text-slate-700">{label}</span>
                <span className="font-mono font-bold text-[#0A1E3F] tabular-nums">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Age & Gender Structure */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5">
            <h3 className="text-base font-bold text-[#0A1E3F]">
              Cơ cấu theo độ tuổi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân nhóm tự động theo ngày sinh của {stats.totalResidents} nhân khẩu
            </p>

            <div className="mt-4 space-y-3">
              {ageBuckets.map((b) => {
                const pct = stats.totalResidents > 0 ? Math.round((b.count / stats.totalResidents) * 100) : 0;
                const barWidth = Math.round((b.count / maxAgeCount) * 100);
                return (
                  <div key={b.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{b.label}</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {b.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1D4ED8] transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5">
            <h3 className="text-base font-bold text-[#0A1E3F]">
              Tỷ lệ giới tính (Nam / Nữ)
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-3.5">
                <span className="text-xs font-semibold text-blue-800">Nam giới</span>
                <p className="mt-1 text-2xl font-extrabold text-[#0A1E3F] tabular-nums">
                  {stats.maleCount}
                  <span className="text-xs font-semibold text-blue-700 ml-1.5">
                    ({stats.totalResidents ? Math.round((stats.maleCount / stats.totalResidents) * 100) : 0}%)
                  </span>
                </p>
              </div>
              <div className="rounded-xl bg-rose-50 border border-rose-100 p-3.5">
                <span className="text-xs font-semibold text-rose-800">Nữ giới</span>
                <p className="mt-1 text-2xl font-extrabold text-[#0A1E3F] tabular-nums">
                  {stats.femaleCount}
                  <span className="text-xs font-semibold text-rose-700 ml-1.5">
                    ({stats.totalResidents ? Math.round((stats.femaleCount / stats.totalResidents) * 100) : 0}%)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NVQS List */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-base font-bold text-[#0A1E3F]">
              Danh sách thanh niên trong độ tuổi Nghĩa vụ quân sự (18 – 27 tuổi)
            </h3>
            <p className="text-xs text-slate-500">
              Tổng số: <strong className="font-mono text-[#C8102E]">{nvqsList.length}</strong> công dân nam
            </p>
          </div>
        </div>

        {nvqsList.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            Không có thanh niên nam nào trong độ tuổi 18–27 thuộc khoảng thống kê này.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-700">
                <tr>
                  <th className="px-3 py-2.5">STT</th>
                  <th className="px-3 py-2.5">Họ và tên</th>
                  <th className="px-3 py-2.5">Ngày sinh / Tuổi</th>
                  <th className="px-3 py-2.5">Số CCCD</th>
                  <th className="px-3 py-2.5">Mã hộ / Địa chỉ</th>
                  <th className="px-3 py-2.5">Trình độ / Nghề nghiệp</th>
                  <th className="px-3 py-2.5">Tình trạng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {nvqsList.map(({ resident, age, household }, idx) => (
                  <tr key={resident.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{idx + 1}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">{resident.hoTen}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-700 whitespace-nowrap">
                      {formatDateVN(resident.ngaySinh)} ({age}t)
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-600">{resident.cccd || '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-700">
                      <span className="font-mono font-bold text-[#1D4ED8]">{household?.maHoKhau || '—'}</span>
                      {' · '}
                      {household?.diaChiThuongTru || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-600">
                      {resident.trinhDoHocVan} · {resident.ngheNghiep || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-medium text-slate-700">
                      {resident.tinhTrangCuTru}
                    </td>
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
