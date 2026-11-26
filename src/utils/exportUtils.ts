import * as XLSX from 'xlsx';
import { AuditLogEntry, BackupPayload, DashboardStats, Household, Resident } from '../types/population';
import { calculateAge, formatDateVN } from './formatters';

function getTimestampSlug(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

export function exportHouseholdsToExcel(households: Household[], residents: Resident[]): void {
  const memberCounts = new Map<string, number>();
  for (const r of residents) {
    if (r.tinhTrangCuTru !== 'Đã chuyển đi') {
      memberCounts.set(r.householdId, (memberCounts.get(r.householdId) || 0) + 1);
    }
  }

  const rows = households.map((h, idx) => ({
    'STT': idx + 1,
    'Mã hộ khẩu': h.maHoKhau,
    'Chủ hộ': h.chuHoTen,
    'Ngày sinh chủ hộ': formatDateVN(h.chuHoNgaySinh),
    'Giới tính': h.chuHoGioiTinh,
    'Số CCCD': h.chuHoCCCD || '',
    'Số điện thoại': h.chuHoSDT || '',
    'Địa chỉ thường trú': h.diaChiThuongTru,
    'Thôn / Buôn': h.thonBuon,
    'Loại cư trú': h.loaiCuTru,
    'Ngày đăng ký': formatDateVN(h.ngayDangKyCuTru),
    'Số nhân khẩu': memberCounts.get(h.id) || 0,
    'Thành phần hộ': h.thanhPhanHo,
    'Hộ nghèo': h.laHoNgheo ? 'Có' : 'Không',
    'Hộ cận nghèo': h.laHoCanNgheo ? 'Có' : 'Không',
    'Hộ chính sách': h.laHoChinhSach ? 'Có' : 'Không',
    'Ghi chú': h.ghiChu || '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DanhSachHoKhau');
  XLSX.writeFile(wb, `DS_HoKhau_Thon1_EaWer_${getTimestampSlug()}.xlsx`);
}

export function exportResidentsToExcel(residents: Resident[], households: Household[]): void {
  const householdMap = new Map(households.map((h) => [h.id, h]));

  const rows = residents.map((r, idx) => {
    const hh = householdMap.get(r.householdId);
    return {
      'STT': idx + 1,
      'Mã hộ khẩu': hh?.maHoKhau || '',
      'Chủ hộ': hh?.chuHoTen || '',
      'Họ và tên': r.hoTen,
      'Ngày sinh': formatDateVN(r.ngaySinh),
      'Tuổi': calculateAge(r.ngaySinh),
      'Giới tính': r.gioiTinh,
      'Số CCCD': r.cccd || '',
      'Dân tộc': r.danToc,
      'Tôn giáo': r.tonGiao,
      'Quê quán': r.queQuan,
      'Nghề nghiệp': r.ngheNghiep,
      'Trình độ học vấn': r.trinhDoHocVan,
      'Số điện thoại': r.sdt || '',
      'Quan hệ chủ hộ': r.quanHeChuHo,
      'Tình trạng cư trú': r.tinhTrangCuTru,
      'Ngày chuyển đến': formatDateVN(r.ngayChuyenDen),
      'Ngày chuyển đi': formatDateVN(r.ngayChuyenDi),
      'Người có công': r.nguoiCoCong ? 'Có' : 'Không',
      'Người khuyết tật': r.nguoiKhuyetTat ? 'Có' : 'Không',
      'Ghi chú': r.ghiChu || '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DanhSachNhanKhau');
  XLSX.writeFile(wb, `DS_NhanKhau_Thon1_EaWer_${getTimestampSlug()}.xlsx`);
}

export function exportReportToExcel(
  stats: DashboardStats,
  households: Household[],
  residents: Resident[],
  dateRangeLabel: string
): void {
  const summaryRows = [
    { 'Chỉ tiêu thống kê': 'Đơn vị hành chính', 'Số liệu': 'Thôn 1, Xã Ea Wer, Tỉnh Đắk Lắk' },
    { 'Chỉ tiêu thống kê': 'Kỳ thống kê', 'Số liệu': dateRangeLabel },
    { 'Chỉ tiêu thống kê': 'Tổng số hộ khẩu', 'Số liệu': stats.totalHouseholds },
    { 'Chỉ tiêu thống kê': 'Số hộ thường trú', 'Số liệu': stats.permanentHouseholds },
    { 'Chỉ tiêu thống kê': 'Số hộ tạm trú', 'Số liệu': stats.temporaryHouseholds },
    { 'Chỉ tiêu thống kê': 'Tổng số nhân khẩu (đang quản lý)', 'Số liệu': stats.totalResidents },
    { 'Chỉ tiêu thống kê': 'Số nhân khẩu Nam', 'Số liệu': stats.maleCount },
    { 'Chỉ tiêu thống kê': 'Số nhân khẩu Nữ', 'Số liệu': stats.femaleCount },
    { 'Chỉ tiêu thống kê': 'Trẻ em dưới 16 tuổi', 'Số liệu': stats.childrenUnder16 },
    { 'Chỉ tiêu thống kê': 'Người cao tuổi (>= 60 tuổi)', 'Số liệu': stats.elderly60Plus },
    { 'Chỉ tiêu thống kê': 'Thanh niên nam độ tuổi NVQS (18-27 tuổi)', 'Số liệu': stats.militaryServiceMales },
    { 'Chỉ tiêu thống kê': 'Tổng số hộ nghèo', 'Số liệu': stats.poorHouseholds },
    { 'Chỉ tiêu thống kê': 'Tổng số hộ cận nghèo', 'Số liệu': stats.nearPoorHouseholds },
    { 'Chỉ tiêu thống kê': 'Tổng số hộ chính sách', 'Số liệu': stats.policyHouseholds },
    { 'Chỉ tiêu thống kê': 'Người có công với cách mạng', 'Số liệu': stats.meritoriousCount },
    { 'Chỉ tiêu thống kê': 'Người khuyết tật', 'Số liệu': stats.disabledCount },
    { 'Chỉ tiêu thống kê': 'Người tạm trú', 'Số liệu': stats.temporaryResidents },
    { 'Chỉ tiêu thống kê': 'Người vắng mặt khỏi địa phương', 'Số liệu': stats.absentResidents },
  ];

  const householdMap = new Map(households.map((h) => [h.id, h]));
  const nvqsRows = residents
    .filter((r) => r.tinhTrangCuTru !== 'Đã chuyển đi' && r.gioiTinh === 'Nam' && calculateAge(r.ngaySinh) >= 18 && calculateAge(r.ngaySinh) <= 27)
    .map((r, idx) => ({
      'STT': idx + 1,
      'Họ và tên': r.hoTen,
      'Ngày sinh': formatDateVN(r.ngaySinh),
      'Tuổi': calculateAge(r.ngaySinh),
      'Số CCCD': r.cccd || '',
      'Mã hộ': householdMap.get(r.householdId)?.maHoKhau || '',
      'Địa chỉ': householdMap.get(r.householdId)?.diaChiThuongTru || '',
      'Trình độ': r.trinhDoHocVan,
      'Nghề nghiệp': r.ngheNghiep,
      'Tình trạng cư trú': r.tinhTrangCuTru,
    }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'TongHopThongKe');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(nvqsRows), 'DanhSach_NVQS');
  XLSX.writeFile(wb, `BaoCao_DanCu_Thon1_EaWer_${getTimestampSlug()}.xlsx`);
}

export function exportFullBackupJson(
  households: Household[],
  residents: Resident[],
  auditLogs: AuditLogEntry[]
): void {
  const payload: BackupPayload = {
    schemaVersion: 1,
    appName: 'Quản Lý Dữ Liệu Dân Cư & Hộ Khẩu Điện Tử',
    location: 'Thôn 1, Xã Ea Wer, Tỉnh Đắk Lắk',
    exportedAt: new Date().toISOString(),
    households,
    residents,
    auditLogs,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SaoLuu_DanCu_Thon1_EaWer_${getTimestampSlug()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseAndValidateBackupJson(rawText: string): BackupPayload {
  const parsed = JSON.parse(rawText) as Partial<BackupPayload>;
  if (!parsed || !Array.isArray(parsed.households) || !Array.isArray(parsed.residents)) {
    throw new Error('Tệp JSON không đúng định dạng sao lưu của hệ thống.');
  }

  for (const h of parsed.households) {
    if (!h.id || !h.maHoKhau || !h.chuHoTen) {
      throw new Error('Dữ liệu hộ khẩu trong tệp sao lưu bị thiếu thông tin bắt buộc.');
    }
  }
  for (const r of parsed.residents) {
    if (!r.id || !r.householdId || !r.hoTen) {
      throw new Error('Dữ liệu nhân khẩu trong tệp sao lưu bị thiếu thông tin bắt buộc.');
    }
  }

  return {
    schemaVersion: parsed.schemaVersion || 1,
    appName: parsed.appName || 'Quản Lý Dữ Liệu Dân Cư & Hộ Khẩu Điện Tử',
    location: parsed.location || 'Thôn 1, Xã Ea Wer, Tỉnh Đắk Lắk',
    exportedAt: parsed.exportedAt || new Date().toISOString(),
    households: parsed.households,
    residents: parsed.residents,
    auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
  };
}
