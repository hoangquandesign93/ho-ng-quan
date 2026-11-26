import { DashboardStats, Household, Resident, TargetGroupKey } from '../types/population';

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

export function normalizeVietnamese(input: string): string {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function calculateAge(dobString: string, referenceDate: Date = new Date()): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  if (Number.isNaN(dob.getTime())) return 0;

  let age = referenceDate.getFullYear() - dob.getFullYear();
  const monthDiff = referenceDate.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '—';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function formatDateTimeVN(isoStr: string): string {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function generateHouseholdCode(households: Household[]): string {
  let maxNum = 0;
  for (const h of households) {
    const match = h.maHoKhau.match(/(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }
  const next = maxNum + 1;
  return `HK-EW-${String(next).padStart(3, '0')}`;
}

export function isMilitaryServiceAge(resident: Resident, referenceDate: Date = new Date()): boolean {
  if (resident.gioiTinh !== 'Nam') return false;
  if (resident.tinhTrangCuTru === 'Đã chuyển đi') return false;
  const age = calculateAge(resident.ngaySinh, referenceDate);
  return age >= 18 && age <= 27;
}

export function computeDashboardStats(
  households: Household[],
  residents: Resident[],
  referenceDate: Date = new Date()
): DashboardStats {
  const activeResidents = residents.filter((r) => r.tinhTrangCuTru !== 'Đã chuyển đi');

  let permanentHouseholds = 0;
  let temporaryHouseholds = 0;
  let poorHouseholds = 0;
  let nearPoorHouseholds = 0;
  let policyHouseholds = 0;

  for (const h of households) {
    if (h.loaiCuTru === 'Thường trú') permanentHouseholds++;
    else temporaryHouseholds++;

    if (h.laHoNgheo) poorHouseholds++;
    if (h.laHoCanNgheo) nearPoorHouseholds++;
    if (h.laHoChinhSach) policyHouseholds++;
  }

  let maleCount = 0;
  let femaleCount = 0;
  let childrenUnder16 = 0;
  let elderly60Plus = 0;
  let militaryServiceMales = 0;
  let meritoriousCount = 0;
  let disabledCount = 0;
  let temporaryResidents = 0;
  let absentResidents = 0;

  for (const r of activeResidents) {
    if (r.gioiTinh === 'Nam') maleCount++;
    else femaleCount++;

    const age = calculateAge(r.ngaySinh, referenceDate);
    if (age < 16) childrenUnder16++;
    if (age >= 60) elderly60Plus++;
    if (r.gioiTinh === 'Nam' && age >= 18 && age <= 27) militaryServiceMales++;
    if (r.nguoiCoCong) meritoriousCount++;
    if (r.nguoiKhuyetTat) disabledCount++;
    if (r.tinhTrangCuTru === 'Tạm trú') temporaryResidents++;
    if (r.tinhTrangCuTru === 'Tạm vắng / Vắng mặt') absentResidents++;
  }

  return {
    totalHouseholds: households.length,
    permanentHouseholds,
    temporaryHouseholds,
    totalResidents: activeResidents.length,
    maleCount,
    femaleCount,
    childrenUnder16,
    elderly60Plus,
    militaryServiceMales,
    poorHouseholds,
    nearPoorHouseholds,
    policyHouseholds,
    meritoriousCount,
    disabledCount,
    temporaryResidents,
    absentResidents,
  };
}

export function filterResidentsByGroup(
  groupKey: TargetGroupKey,
  residents: Resident[],
  referenceDate: Date = new Date()
): Resident[] {
  const active = residents.filter((r) => r.tinhTrangCuTru !== 'Đã chuyển đi');
  switch (groupKey) {
    case 'children_under_16':
      return active.filter((r) => calculateAge(r.ngaySinh, referenceDate) < 16);
    case 'elderly_60_plus':
      return active.filter((r) => calculateAge(r.ngaySinh, referenceDate) >= 60);
    case 'military_service':
      return active.filter((r) => isMilitaryServiceAge(r, referenceDate));
    case 'meritorious_people':
      return active.filter((r) => r.nguoiCoCong);
    case 'disabled_people':
      return active.filter((r) => r.nguoiKhuyetTat);
    case 'temporary_residents':
      return active.filter((r) => r.tinhTrangCuTru === 'Tạm trú');
    case 'absent_residents':
      return active.filter((r) => r.tinhTrangCuTru === 'Tạm vắng / Vắng mặt');
    default:
      return [];
  }
}

export function filterHouseholdsByGroup(
  groupKey: TargetGroupKey,
  households: Household[]
): Household[] {
  switch (groupKey) {
    case 'poor_households':
      return households.filter((h) => h.laHoNgheo);
    case 'near_poor_households':
      return households.filter((h) => h.laHoCanNgheo);
    case 'policy_households':
      return households.filter((h) => h.laHoChinhSach);
    default:
      return [];
  }
}
