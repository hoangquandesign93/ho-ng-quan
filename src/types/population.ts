export type Gender = 'Nam' | 'Nữ';

export type ResidenceType = 'Thường trú' | 'Tạm trú';

export type ResidentStatus = 'Thường trú' | 'Tạm trú' | 'Tạm vắng / Vắng mặt' | 'Đã chuyển đi';

export interface Household {
  id: string;
  maHoKhau: string;
  chuHoTen: string;
  chuHoNgaySinh: string; // YYYY-MM-DD
  chuHoGioiTinh: Gender;
  chuHoCCCD: string;
  chuHoSDT: string;
  diaChiThuongTru: string;
  thonBuon: string;
  loaiCuTru: ResidenceType;
  ngayDangKyCuTru: string; // YYYY-MM-DD
  thanhPhanHo: string;
  laHoNgheo: boolean;
  laHoCanNgheo: boolean;
  laHoChinhSach: boolean;
  ghiChu: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resident {
  id: string;
  householdId: string;
  hoTen: string;
  ngaySinh: string; // YYYY-MM-DD
  gioiTinh: Gender;
  cccd: string;
  danToc: string;
  tonGiao: string;
  queQuan: string;
  ngheNghiep: string;
  trinhDoHocVan: string;
  sdt: string;
  quanHeChuHo: string;
  tinhTrangCuTru: ResidentStatus;
  ngayChuyenDen: string;
  ngayChuyenDi: string;
  nguoiCoCong: boolean;
  nguoiKhuyetTat: boolean;
  ghiChu: string;
  createdAt: string;
  updatedAt: string;
}

export type AuditActionType =
  | 'THEM_HO'
  | 'SUA_HO'
  | 'XOA_HO'
  | 'THEM_NHAN_KHAU'
  | 'SUA_NHAN_KHAU'
  | 'XOA_NHAN_KHAU'
  | 'CHUYEN_HO'
  | 'NAP_DU_LIEU_MAU'
  | 'SAO_LUU'
  | 'KHOI_PHUC'
  | 'BAO_MAT';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditActionType;
  target: string;
  details: string;
}

export interface PinConfig {
  pinHash: string;
  salt: string;
  isDefaultPin: boolean;
  autoLockMinutes: number; // 0 = disabled
  updatedAt: string;
}

export interface DashboardStats {
  totalHouseholds: number;
  permanentHouseholds: number;
  temporaryHouseholds: number;
  totalResidents: number;
  maleCount: number;
  femaleCount: number;
  childrenUnder16: number;
  elderly60Plus: number;
  militaryServiceMales: number; // Nam 18-27 tuổi
  poorHouseholds: number;
  nearPoorHouseholds: number;
  policyHouseholds: number;
  meritoriousCount: number;
  disabledCount: number;
  temporaryResidents: number;
  absentResidents: number;
}

export type NavTab =
  | 'households'
  | 'residents'
  | 'groups'
  | 'reports'
  | 'admin';

export type TargetGroupKey =
  | 'children_under_16'
  | 'elderly_60_plus'
  | 'military_service'
  | 'poor_households'
  | 'near_poor_households'
  | 'policy_households'
  | 'meritorious_people'
  | 'disabled_people'
  | 'temporary_residents'
  | 'absent_residents';

export interface BackupPayload {
  schemaVersion: number;
  appName: string;
  location: string;
  exportedAt: string;
  households: Household[];
  residents: Resident[];
  auditLogs: AuditLogEntry[];
}
