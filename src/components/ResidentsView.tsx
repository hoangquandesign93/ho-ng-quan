import React, { useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  Edit3,
  FileSpreadsheet,
  Printer,
  Search,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { Gender, Household, Resident, ResidentStatus } from '../types/population';
import { calculateAge, formatDateVN, normalizeVietnamese } from '../utils/formatters';

interface ResidentsViewProps {
  residents: Resident[];
  households: Household[];
  onAddResident: () => void;
  onEditResident: (resident: Resident) => void;
  onTransferResident: (resident: Resident) => void;
  onDeleteResident: (resident: Resident) => void;
  onViewHousehold: (household: Household) => void;
  onExportExcel: (filtered: Resident[]) => void;
  onPrintList: (filtered: Resident[]) => void;
}

type AgeFilter = 'all' | 'under16' | 'nvqs18_27' | 'adult28_59' | 'elderly60';

export const ResidentsView: React.FC<ResidentsViewProps> = ({
  residents,
  households,
  onAddResident,
  onEditResident,
  onTransferResident,
  onDeleteResident,
  onViewHousehold,
  onExportExcel,
  onPrintList,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | Gender>('all');
  const [ageFilter, setAgeFilter] = useState<AgeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ResidentStatus>('all');
  const [householdFilter, setHouseholdFilter] = useState<string>('all');

  const householdMap = useMemo(
    () => new Map(households.map((h) => [h.id, h])),
    [households]
  );

  const filteredResidents = useMemo(() => {
    const q = normalizeVietnamese(searchQuery);
    return residents.filter((r) => {
      if (genderFilter !== 'all' && r.gioiTinh !== genderFilter) return false;
      if (statusFilter !== 'all' && r.tinhTrangCuTru !== statusFilter) return false;
      if (householdFilter !== 'all' && r.householdId !== householdFilter) return false;

      const age = calculateAge(r.ngaySinh);
      if (ageFilter === 'under16' && age >= 16) return false;
      if (ageFilter === 'nvqs18_27' && (r.gioiTinh !== 'Nam' || age < 18 || age > 27)) return false;
      if (ageFilter === 'adult28_59' && (age < 28 || age >= 60)) return false;
      if (ageFilter === 'elderly60' && age < 60) return false;

      if (!q) return true;
      const hh = householdMap.get(r.householdId);
      return (
        normalizeVietnamese(r.hoTen).includes(q) ||
        normalizeVietnamese(r.cccd).includes(q) ||
        normalizeVietnamese(r.sdt).includes(q) ||
        normalizeVietnamese(hh?.maHoKhau || '').includes(q) ||
        normalizeVietnamese(hh?.chuHoTen || '').includes(q)
      );
    });
  }, [residents, householdMap, searchQuery, genderFilter, ageFilter, statusFilter, householdFilter]);

  return (
    <section className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhân khẩu theo họ tên, số CCCD, SĐT hoặc mã hộ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onAddResident}
              disabled={households.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-[#0A1E3F] font-bold text-xs sm:text-sm min-h-[40px] whitespace-nowrap disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm nhân khẩu</span>
            </button>
            <button
              type="button"
              onClick={() => onExportExcel(filteredResidents)}
              disabled={filteredResidents.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm min-h-[40px] whitespace-nowrap disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
            <button
              type="button"
              onClick={() => onPrintList(filteredResidents)}
              disabled={filteredResidents.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0A1E3F] hover:bg-[#112F62] text-white font-semibold text-xs sm:text-sm min-h-[40px] whitespace-nowrap disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In danh sách</span>
            </button>
          </div>
        </div>

        {/* Multi-filter grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as 'all' | Gender)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white"
            aria-label="Lọc theo giới tính"
          >
            <option value="all">Giới tính: Tất cả</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>

          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value as AgeFilter)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white"
            aria-label="Lọc theo độ tuổi"
          >
            <option value="all">Độ tuổi: Tất cả</option>
            <option value="under16">Trẻ em (Dưới 16 tuổi)</option>
            <option value="nvqs18_27">Nam NVQS (18 – 27 tuổi)</option>
            <option value="adult28_59">Lao động (28 – 59 tuổi)</option>
            <option value="elderly60">Cao tuổi (Từ 60 tuổi)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ResidentStatus)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white"
            aria-label="Lọc theo tình trạng cư trú"
          >
            <option value="all">Cư trú: Tất cả</option>
            <option value="Thường trú">Thường trú</option>
            <option value="Tạm trú">Tạm trú</option>
            <option value="Tạm vắng / Vắng mặt">Tạm vắng / Vắng mặt</option>
            <option value="Đã chuyển đi">Đã chuyển đi</option>
          </select>

          <select
            value={householdFilter}
            onChange={(e) => setHouseholdFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white"
            aria-label="Lọc theo hộ khẩu"
          >
            <option value="all">Theo hộ khẩu: Tất cả ({households.length} hộ)</option>
            {households.map((h) => (
              <option key={h.id} value={h.id}>
                {h.maHoKhau} — {h.chuHoTen}
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs text-slate-500 tabular-nums text-right">
          Hiển thị <strong className="text-slate-800">{filteredResidents.length}</strong> / {residents.length} nhân khẩu
        </p>
      </div>

      {/* Empty State */}
      {filteredResidents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-base font-bold text-slate-800">
            {residents.length === 0 ? 'Chưa có dữ liệu nhân khẩu' : 'Không tìm thấy nhân khẩu phù hợp'}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            {households.length === 0
              ? 'Vui lòng tạo ít nhất 1 hộ khẩu trước khi thêm nhân khẩu.'
              : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc độ tuổi, giới tính, cư trú.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3">Họ và tên</th>
                    <th className="px-4 py-3">Ngày sinh / Tuổi</th>
                    <th className="px-4 py-3">CCCD / Dân tộc</th>
                    <th className="px-4 py-3">Hộ khẩu &amp; Quan hệ</th>
                    <th className="px-4 py-3">Nghề nghiệp</th>
                    <th className="px-4 py-3">Cư trú</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredResidents.map((r) => {
                    const hh = householdMap.get(r.householdId);
                    const age = calculateAge(r.ngaySinh);
                    const specialFlags: string[] = [];
                    if (r.nguoiCoCong) specialFlags.push('Người có công');
                    if (r.nguoiKhuyetTat) specialFlags.push('Khuyết tật');

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900">{r.hoTen}</p>
                          <p className="text-xs text-slate-500">
                            {r.gioiTinh}
                            {r.sdt ? ` · ${r.sdt}` : ''}
                            {specialFlags.length > 0 ? ` · ${specialFlags.join(', ')}` : ''}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-700 whitespace-nowrap">
                          {formatDateVN(r.ngaySinh)} · <strong>{age} tuổi</strong>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="font-mono text-slate-800">{r.cccd || '—'}</div>
                          <div className="text-slate-500">{r.danToc}</div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {hh ? (
                            <button
                              type="button"
                              onClick={() => onViewHousehold(hh)}
                              className="font-mono font-bold text-[#1D4ED8] hover:underline cursor-pointer"
                            >
                              {hh.maHoKhau}
                            </button>
                          ) : (
                            '—'
                          )}
                          <p className="text-slate-600 mt-0.5">
                            {r.quanHeChuHo} ({hh?.chuHoTen || '—'})
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          <div>{r.ngheNghiep || '—'}</div>
                          <div className="text-slate-500">{r.trinhDoHocVan}</div>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap">
                          <span
                            className={
                              r.tinhTrangCuTru === 'Thường trú'
                                ? 'text-emerald-700'
                                : r.tinhTrangCuTru === 'Tạm trú'
                                ? 'text-blue-700'
                                : r.tinhTrangCuTru === 'Tạm vắng / Vắng mặt'
                                ? 'text-amber-700'
                                : 'text-slate-500'
                            }
                          >
                            {r.tinhTrangCuTru}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEditResident(r)}
                              className="p-2 rounded-lg text-[#1D4ED8] hover:bg-blue-50 cursor-pointer"
                              title="Chỉnh sửa nhân khẩu"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onTransferResident(r)}
                              className="p-2 rounded-lg text-amber-700 hover:bg-amber-50 cursor-pointer"
                              title="Chuyển hộ khẩu khác"
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteResident(r)}
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
          </div>

          {/* Mobile / iPhone 11 Card List */}
          <div className="lg:hidden space-y-3">
            {filteredResidents.map((r) => {
              const hh = householdMap.get(r.householdId);
              const age = calculateAge(r.ngaySinh);
              return (
                <article
                  key={r.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">
                        <span className="font-mono font-bold text-[#1D4ED8]">{hh?.maHoKhau || '—'}</span>
                        {' · '}
                        <span>{r.quanHeChuHo}</span>
                      </p>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5 truncate">{r.hoTen}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {r.gioiTinh} · Sinh {formatDateVN(r.ngaySinh)} ({age} tuổi) · {r.danToc}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 shrink-0">
                      {r.tinhTrangCuTru}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
                    <span>CCCD: <strong className="font-mono">{r.cccd || '—'}</strong></span>
                    <span>Nghề: {r.ngheNghiep || '—'}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => onEditResident(r)}
                      className="flex items-center justify-center gap-1 py-2 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold min-h-[42px]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onTransferResident(r)}
                      className="flex items-center justify-center gap-1 py-2 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold min-h-[42px]"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Chuyển hộ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteResident(r)}
                      className="flex items-center justify-center gap-1 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-semibold min-h-[42px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
