import { Gender, Household, ResidenceType, Resident, ResidentStatus } from '../types/population';
import { generateId } from '../utils/formatters';

interface SeedMemberSpec {
  hoTen: string;
  age: number;
  gioiTinh: Gender;
  quanHeChuHo: string;
  danToc?: string;
  tonGiao?: string;
  ngheNghiep: string;
  trinhDoHocVan: string;
  tinhTrangCuTru?: ResidentStatus;
  nguoiCoCong?: boolean;
  nguoiKhuyetTat?: boolean;
}

interface SeedHouseholdSpec {
  maHoKhau: string;
  diaChi: string;
  loaiCuTru: ResidenceType;
  ngayDangKy: string;
  thanhPhanHo: string;
  laHoNgheo?: boolean;
  laHoCanNgheo?: boolean;
  laHoChinhSach?: boolean;
  ghiChu?: string;
  members: SeedMemberSpec[];
}

function dobFromAge(age: number, index: number): string {
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - age;
  const month = String((index % 2) + 1).padStart(2, '0'); // 01 or 02 -> guarantees birthday already passed in Nov/most months or adjust:
  // Always use January 10 so age = currentYear - birthYear is exact on any day after Jan 10!
  const day = String(10 + (index % 15)).padStart(2, '0');
  return `${birthYear}-01-${day}`;
}

function fakeCCCD(idx: number): string {
  const num = String(100000 + idx * 137).padStart(6, '0');
  return `066094${num}`;
}

function fakePhone(idx: number): string {
  const tail = String(210450 + idx * 719).padStart(6, '0');
  return `0914${tail}`;
}

/**
 * Generates exact synthetic dataset:
 * - 20 households (17 Thường trú, 3 Tạm trú; 4 Hộ chính sách, 2 Hộ nghèo, 3 Hộ cận nghèo)
 * - 67 residents:
 *   - 35 Nam, 32 Nữ
 *   - 12 Trẻ em (< 16 tuổi)
 *   - 7 Người cao tuổi (>= 60 tuổi)
 *   - 9 Nam trong độ tuổi NVQS (18–27 tuổi)
 *   - 39 người lớn khác (không trùng 3 nhóm trên)
 */
export function generateSampleData(): { households: Household[]; residents: Resident[] } {
  const now = new Date().toISOString();

  const specs: SeedHouseholdSpec[] = [
    {
      maHoKhau: 'HK-EW-001',
      diaChi: 'Số 04, Đường liên thôn, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2016-03-12',
      thanhPhanHo: 'Hộ nông nghiệp',
      laHoChinhSach: true,
      ghiChu: 'Gia đình thương binh 4/4',
      members: [
        { hoTen: 'Nguyễn Văn Thành', age: 66, gioiTinh: 'Nam', quanHeChuHo: 'Chủ hộ', ngheNghiep: 'Hưu trí / Làm vườn', trinhDoHocVan: '9/12', nguoiCoCong: true },
        { hoTen: 'Trần Thị Hoa', age: 62, gioiTinh: 'Nữ', quanHeChuHo: 'Vợ', ngheNghiep: 'Làm nông', trinhDoHocVan: '7/12' },
        { hoTen: 'Nguyễn Minh Quân', age: 23, gioiTinh: 'Nam', quanHeChuHo: 'Con', ngheNghiep: 'Kỹ thuật viên nông nghiệp', trinhDoHocVan: 'Cao đẳng' }, // NVQS #1
        { hoTen: 'Nguyễn Thị Thảo', age: 34, gioiTinh: 'Nữ', quanHeChuHo: 'Con', ngheNghiep: 'Giáo viên tiểu học', trinhDoHocVan: 'Đại học' },
      ],
    },
    {
      maHoKhau: 'HK-EW-002',
      diaChi: 'Số 11, Xóm Đồi, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2018-05-20',
      thanhPhanHo: 'Hộ nông nghiệp',
      members: [
        { hoTen: 'Y Blưm Niê', age: 45, gioiTinh: 'Nam', quanHeChuHo: 'Chủ hộ', danToc: 'Ê Đê', tonGiao: 'Tin lành', ngheNghiep: 'Trồng cà phê, hồ tiêu', trinhDoHocVan: '12/12' },
        { hoTen: 'H’Loan Byă', age: 42, gioiTinh: 'Nữ', quanHeChuHo: 'Vợ', danToc: 'Ê Đê', tonGiao: 'Tin lành', ngheNghiep: 'Làm nông', trinhDoHocVan: '9/12' },
        { hoTen: 'Y Khang Byă', age: 21, gioiTinh: 'Nam', quanHeChuHo: 'Con', danToc: 'Ê Đê', ngheNghiep: 'Lao động tự do', trinhDoHocVan: '12/12' }, // NVQS #2
        { hoTen: 'H’Minh Byă', age: 12, gioiTinh: 'Nữ', quanHeChuHo: 'Con', danToc: 'Ê Đê', ngheNghiep: 'Học sinh THCS', trinhDoHocVan: '6/12' }, // Child #1
      ],
    },
    {
      maHoKhau: 'HK-EW-003',
      diaChi: 'Số 18, Ngã ba Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2015-08-14',
      thanhPhanHo: 'Hộ kinh doanh tạp hóa',
      members: [
        { hoTen: 'Lê Hoàng Nam', age: 49, gioiTinh: 'Nam', quanHeChuHo: 'Chủ hộ', ngheNghiep: 'Kinh doanh buôn bán', trinhDoHocVan: '12/12' },
        { hoTen: 'Phạm Thị Bích Ngọc', age: 46, gioiTinh: 'Nữ', quanHeChuHo: 'Vợ', ngheNghiep: 'Kinh doanh buôn bán', trinhDoHocVan: '12/12' },
        { hoTen: 'Lê Hoàng Long', age: 20, gioiTinh: 'Nam', quanHeChuHo: 'Con', ngheNghiep: 'Sinh viên', trinhDoHocVan: 'Đại học', tinhTrangCuTru: 'Tạm vắng / Vắng mặt' }, // NVQS #3
        { hoTen: 'Lê Bảo Châu', age: 9, gioiTinh: 'Nữ', quanHeChuHo: 'Con', ngheNghiep: 'Học sinh tiểu học', trinhDoHocVan: '3/12' }, // Child #2
      ],
    },
    {
      maHoKhau: 'HK-EW-004',
      diaChi: 'Số 22, Khu dân cư Suối Đá, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2012-11-05',
      thanhPhanHo: 'Hộ nông nghiệp',
      laHoNgheo: true,
      laHoChinhSach: true,
      ghiChu: 'Hộ nghèo có người cao tuổi neo đơn phụ thuộc',
      members: [
        { hoTen: 'Võ Thị Sáu', age: 71, gioiTinh: 'Nữ', quanHeChuHo: 'Chủ hộ', ngheNghiep: 'Hết tuổi lao động', trinhDoHocVan: '5/12', nguoiCoCong: true }, // Elderly #3
        { hoTen: 'Võ Văn Đạt', age: 38, gioiTinh: 'Nam', quanHeChuHo: 'Con', ngheNghiep: 'Làm thuê nông nghiệp', trinhDoHocVan: '9/12', nguoiKhuyetTat: true },
        { hoTen: 'Võ Minh Khang', age: 10, gioiTinh: 'Nam', quanHeChuHo: 'Cháu', ngheNghiep: 'Học sinh tiểu học', trinhDoHocVan: '4/12' }, // Child #3
      ],
    },
    {
      maHoKhau: 'HK-EW-005',
      diaChi: 'Số 29, Đường chính Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2019-02-18',
      thanhPhanHo: 'Hộ cán bộ - viên chức',
      members: [
        { hoTen: 'Trần Đức Thắng', age: 40, gioiTinh: 'Nam', quanHeChuHo: 'Chủ hộ', ngheNghiep: 'Cán bộ xã', trinhDoHocVan: 'Đại học' },
        { hoTen: 'Nguyễn Thị Mai Hương', age: 37, gioiTinh: 'Nữ', quanHeChuHo: 'Vợ', ngheNghiep: 'Nhân viên y tế', trinhDoHocVan: 'Cao đẳng' },
        { hoTen: 'Trần Gia Huy', age: 11, gioiTinh: 'Nam', quanHeChuHo: 'Con', ngheNghiep: 'Học sinh tiểu học', trinhDoHocVan: '5/12' }, // Child #4
        { hoTen: 'Trần Khánh Linh', age: 6, gioiTinh: 'Nữ', quanHeChuHo: 'Con', ngheNghiep: 'Học sinh tiểu học', trinhDoHocVan: '1/12' }, // Child #5
      ],
    },
    {
      maHoKhau: 'HK-EW-006',
      diaChi: 'Số 35, Xóm Mới, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2017-07-09',
      thanhPhanHo: 'Hộ nông nghiệp',
      laHoCanNgheo: true,
      members: [
        { hoTen: 'Nông Văn Hùng', age: 52, gioiTinh: 'Nam', quanHeChuHo: 'Chủ hộ', danToc: 'Tày', ngheNghiep: 'Trồng điều, chăn nuôi', trinhDoHocVan: '9/12' },
        { hoTen: 'Hoàng Thị Mùi', age: 48, gioiTinh: 'Nữ', quanHeChuHo: 'Vợ', danToc: 'Nùng', ngheNghiep: 'Làm nông', trinhDoHocVan: '7/12' },
        { hoTen: 'Nông Văn Tùng', age: 25, gioiTinh: 'Nam', quanHeChuHo: 'Con', danToc: 'Tày', ngheNghiep: 'Công nhân', trinhDoHocVan: '12/12', tinhTrangCuTru: 'Tạm vắng / Vắng mặt' }, // NVQS #4
      ],
    },
    {
      maHoKhau: 'HK-EW-007',
      diaChi: 'Số 41, Cụm dân cư số 2, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2014-04-22',
      thanhPhanHo: 'Hộ nông nghiệp',
      members: [
        { hoTen: 'Đặng Quốc Việt', age: 56, gioiTinh: 'Nam', quanHeChuHo: 'Chủ hộ', ngheNghiep: 'Làm rẫy', trinhDoHocVan: '12/12' },
        { hoTen: 'Lý Thị Thanh Xuân', age: 53, gioiTinh: 'Nữ', quanHeChuHo: 'Vợ', ngheNghiep: 'Làm rẫy', trinhDoHocVan: '9/12' },
        { hoTen: 'Đặng Quốc Bảo', age: 26, gioiTinh: 'Nam', quanHeChuHo: 'Con', ngheNghiep: 'Thợ cơ khí', trinhDoHocVan: 'Trung cấp' }, // NVQS #5
        { hoTen: 'Đặng Thị Phương Anh', age: 22, gioiTinh: 'Nữ', quanHeChuHo: 'Con', ngheNghiep: 'Nhân viên kế toán', trinhDoHocVan: 'Đại học' },
      ],
    },
    {
      maHoKhau: 'HK-EW-008',
      diaChi: 'Số 48, Đường vào rẫy, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2020-09-15',
      thanhPhanHo: 'Hộ lao động tự do',
      laHoNgheo: true,
      members: [
        { hoTen: 'H’Yến Mlô', age: 36, gioiTinh: 'Nữ', quanHeChuHo: 'Chủ hộ', danToc: 'Ê Đê', ngheNghiep: 'Làm thuê thời vụ', trinhDoHocVan: '6/12' },
        { hoTen: 'Y Thiện Mlô', age: 14, gioiTinh: 'Nam', quanHeChuHo: 'Con', danToc: 'Ê Đê', ngheNghiep: 'Học sinh THCS', trinhDoHocVan: '8/12' }, // Child #6
        { hoTen: 'H’Nhi Mlô', age: 8, gioiTinh: 'Nữ', quanHeChuHo: 'Con', danToc: 'Ê Đê', ngheNghiep: 'Học sinh tiểu học', trinhDoHocVan: '2/12' }, // Child #7
      ],
    },
    {
      maHoKhau: 'HK-EW-009',
      diaChi: 'Số 53, Xóm Chợ, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2011-01-19',
      thanhPhanHo: 'Hộ nông nghiệp',
      laHoChinhSach: true,
      ghiChu: 'Gia đình thờ cúng liệt sĩ',
      members: [
        { hoTen: 'Bùi Văn Phước', age: 68, gioiTinh: 'Nam', quanHeChuHo: 'Chủ hộ', ngheNghiep: 'Hưu trí', trinhDoHocVan: '12/12', nguoiCoCong: true }, // Elderly #4
        { hoTen: 'Nguyễn Thị Kim Liên', age: 64, gioiTinh: 'Nữ', quanHeChuHo: 'Vợ', ngheNghiep: 'Nội trợ', trinhDoHocVan: '9/12' }, // Elderly #5
        { hoTen: 'Bùi Văn Hải', age: 35, gioiTinh: 'Nam', quanHeChuHo: 'Con', ngheNghiep: 'Lái xe tải', trinhDoHocVan: '12/12' },
      ],
    },
    {
      maHoKhau: 'HK-EW-010',
      diaChi: 'Số 60, Cụm 3, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2021-06-11',
      thanhPhanHo: 'Hộ nông nghiệp',
      members: [
        { hoTen: 'Phùng Văn Sơn', age: 44, gioiTinh: 'Nam', quanHeChuHo: 'Chủ hộ', ngheNghiep: 'Trồng sầu riêng', trinhDoHocVan: '12/12' },
        { hoTen: 'Đoàn Thị Thu Thủy', age: 41, gioiTinh: 'Nữ', quanHeChuHo: 'Vợ', ngheNghiep: 'Buôn bán nhỏ', trinhDoHocVan: '12/12' },
        { hoTen: 'Phùng Gia Bảo', age: 19, gioiTinh: 'Nam', quanHeChuHo: 'Con', ngheNghiep: 'Phụ xe / Lao động tự do', trinhDoHocVan: '12/12' }, // NVQS #6
        { hoTen: 'Phùng Minh Nhật', age: 13, gioiTinh: 'Nam', quanHeChuHo: 'Con', ngheNghiep: 'Học sinh THCS', trinhDoHocVan: '7/12' }, // Child #8
      ],
    },
    {
      maHoKhau: 'HK-EW-011',
      diaChi: 'Số 64, Khu vực Trường học, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2013-10-08',
      thanhPhanHo: 'Hộ dịch vụ - thương mại',
      members: [
        { hoTen: 'Huỳnh Tấn Phát', age: 51, gioiTinh: 'Nam', quanHeChuHo: 'Chủ hộ', ngheNghiep: 'Sửa chữa xe máy', trinhDoHocVan: '12/12' },
        { hoTen: 'Lê Thị Mỹ Duyên', age: 47, gioiTinh: 'Nữ', quanHeChuHo: 'Vợ', ngheNghiep: 'Bán hàng ăn sáng', trinhDoHocVan: '9/12' },
        { hoTen: 'Huỳnh Tấn Lộc', age: 24, gioiTinh: 'Nam', quanHeChuHo: 'Con', ngheNghiep: 'Thợ điện', trinhDoHocVan: 'Trung cấp' }, // NVQS #7
        { hoTen: 'Huỳnh Mỹ Tiên', age: 20, gioiTinh: 'Nữ', quanHeChuHo: 'Con', ngheNghiep: 'Sinh viên', trinhDoHocVan: 'Đại học', tinhTrangCuTru: 'Tạm vắng / Vắng mặt' },
      ],
    },
    {
      maHoKhau: 'HK-EW-012',
      diaChi: 'Số 72, Đường ĐT681, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Tạm trú',
      ngayDangKy: '2024-03-04',
      thanhPhanHo: 'Hộ công nhân - lao động',
      members: [
        { hoTen: 'Phan Thanh Bình', age: 33, gioiTinh: 'Nam', quanHeChuHo: 'Chủ hộ', ngheNghiep: 'Công nhân xây dựng', trinhDoHocVan: '9/12', tinhTrangCuTru: 'Tạm trú' },
        { hoTen: 'Ngô Thị Hồng Gấm', age: 30, gioiTinh: 'Nữ', quanHeChuHo: 'Vợ', ngheNghiep: 'Công nhân chế biến nông sản', trinhDoHocVan: '9/12', tinhTrangCuTru: 'Tạm trú' },
        { hoTen: 'Phan Minh Đức', age: 5, gioiTinh: 'Nam', quanHeChuHo: 'Con', ngheNghiep: 'Mầm non', trinhDoHocVan: 'Mẫu giáo', tinhTrangCuTru: 'Tạm trú' }, // Child #9
      ],
    },
    {
      maHoKhau: 'HK-EW-013',
      diaChi: 'Số 78, Xóm Trại, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2010-12-01',
      thanhPhanHo: 'Hộ nông nghiệp',
      laHoChinhSach: true,
      ghiChu: 'Gia đình có người cao tuổi hưởng trợ cấp',
      members: [
        { hoTen: 'Mai Văn Tám', age: 74, gioiTinh: 'Nam', quanHeChuHo: 'Chủ hộ', ngheNghiep: 'Hết tuổi lao động', trinhDoHocVan: '7/12', nguoiCoCong: true }, // Elderly #6
        { hoTen: 'Mai Văn Dũng', age: 46, gioiTinh: 'Nam', quanHeChuHo: 'Con', ngheNghiep: 'Làm nông', trinhDoHocVan: '12/12' },
        { hoTen: 'Đinh Thị Thu Hà', age: 43, gioiTinh: 'Nữ', quanHeChuHo: 'Con dâu', ngheNghiep: 'Làm nông', trinhDoHocVan: '12/12' },
        { hoTen: 'Mai Thị Lan Anh', age: 15, gioiTinh: 'Nữ', quanHeChuHo: 'Cháu', ngheNghiep: 'Học sinh THPT', trinhDoHocVan: '9/12' }, // Child #10
      ],
    },
    {
      maHoKhau: 'HK-EW-014',
      diaChi: 'Số 83, Đường vào Buôn Ea Wer, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2018-11-25',
      thanhPhanHo: 'Hộ nông nghiệp',
      laHoCanNgheo: true,
      members: [
        { hoTen: 'Y Kiên Êban', age: 48, gioiTinh: 'Nam', quanHeChuHo: 'Chủ hộ', danToc: 'Ê Đê', ngheNghiep: 'Trồng điều, mì', trinhDoHocVan: '9/12' },
        { hoTen: 'H’Mơr Niê', age: 45, gioiTinh: 'Nữ', quanHeChuHo: 'Vợ', danToc: 'Ê Đê', ngheNghiep: 'Làm nông', trinhDoHocVan: '6/12' },
        { hoTen: 'Y Sáng Niê', age: 22, gioiTinh: 'Nam', quanHeChuHo: 'Con', danToc: 'Ê Đê', ngheNghiep: 'Làm rẫy', trinhDoHocVan: '9/12' }, // NVQS #8
      ],
    },
    {
      maHoKhau: 'HK-EW-015',
      diaChi: 'Số 90, Khu dân cư Phía Đông, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2016-09-14',
      thanhPhanHo: 'Hộ nông nghiệp',
      members: [
        { hoTen: 'Trương Quang Hải', age: 57, gioiTinh: 'Nam', quanHeChuHo: 'Chủ hộ', ngheNghiep: 'Chăn nuôi bò, làm rẫy', trinhDoHocVan: '12/12' },
        { hoTen: 'Vũ Thị Tuyết Mai', age: 54, gioiTinh: 'Nữ', quanHeChuHo: 'Vợ', ngheNghiep: 'Làm vườn', trinhDoHocVan: '12/12' },
      ],
    },
    {
      maHoKhau: 'HK-EW-016',
      diaChi: 'Số 95, Cụm 4, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Tạm trú',
      ngayDangKy: '2023-08-19',
      thanhPhanHo: 'Hộ kinh doanh - dịch vụ',
      members: [
        { hoTen: 'Cao Minh Tuấn', age: 36, gioiTinh: 'Nam', quanHeChuHo: 'Chủ hộ', ngheNghiep: 'Thu mua nông sản', trinhDoHocVan: '12/12', tinhTrangCuTru: 'Tạm trú' },
        { hoTen: 'Tạ Thị Ngọc Ánh', age: 33, gioiTinh: 'Nữ', quanHeChuHo: 'Vợ', ngheNghiep: 'Bán vật tư nông nghiệp', trinhDoHocVan: 'Cao đẳng', tinhTrangCuTru: 'Tạm trú' },
        { hoTen: 'Cao Ngọc Hân', age: 7, gioiTinh: 'Nữ', quanHeChuHo: 'Con', ngheNghiep: 'Học sinh tiểu học', trinhDoHocVan: '2/12', tinhTrangCuTru: 'Tạm trú' }, // Child #11
      ],
    },
    {
      maHoKhau: 'HK-EW-017',
      diaChi: 'Số 102, Xóm Cây Xoài, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2013-02-17',
      thanhPhanHo: 'Hộ nông nghiệp',
      members: [
        { hoTen: 'Đỗ Văn Hậu', age: 42, gioiTinh: 'Nam', quanHeChuHo: 'Chủ hộ', ngheNghiep: 'Làm vườn', trinhDoHocVan: '12/12' },
        { hoTen: 'Nguyễn Thị Cẩm Tú', age: 39, gioiTinh: 'Nữ', quanHeChuHo: 'Vợ', ngheNghiep: 'May mặc tại nhà', trinhDoHocVan: '9/12' },
        { hoTen: 'Đỗ Văn Huy', age: 18, gioiTinh: 'Nam', quanHeChuHo: 'Con', ngheNghiep: 'Học sinh lớp 12 / Chuẩn bị tốt nghiệp', trinhDoHocVan: '12/12' }, // NVQS #9
        { hoTen: 'Đỗ Minh Khôi', age: 4, gioiTinh: 'Nam', quanHeChuHo: 'Con', ngheNghiep: 'Mầm non', trinhDoHocVan: 'Mẫu giáo' }, // Child #12
      ],
    },
    {
      maHoKhau: 'HK-EW-018',
      diaChi: 'Số 109, Đường Hồ Chí Minh nhánh phụ, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2015-05-06',
      thanhPhanHo: 'Hộ nông nghiệp',
      laHoCanNgheo: true,
      members: [
        { hoTen: 'Hoàng Văn Lợi', age: 50, gioiTinh: 'Nam', quanHeChuHo: 'Chủ hộ', danToc: 'Nùng', ngheNghiep: 'Làm nông', trinhDoHocVan: '9/12' },
        { hoTen: 'Lục Thị Hạnh', age: 47, gioiTinh: 'Nữ', quanHeChuHo: 'Vợ', danToc: 'Tày', ngheNghiep: 'Làm nông', trinhDoHocVan: '7/12', nguoiKhuyetTat: true },
        { hoTen: 'Hoàng Thị Thu Trang', age: 24, gioiTinh: 'Nữ', quanHeChuHo: 'Con', danToc: 'Nùng', ngheNghiep: 'Nhân viên bán hàng', trinhDoHocVan: '12/12' },
      ],
    },
    {
      maHoKhau: 'HK-EW-019',
      diaChi: 'Số 114, Cụm dân cư Cầu Trắng, Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Thường trú',
      ngayDangKy: '2009-07-23',
      thanhPhanHo: 'Hộ nông nghiệp',
      members: [
        { hoTen: 'Nguyễn Thị Tâm', age: 65, gioiTinh: 'Nữ', quanHeChuHo: 'Chủ hộ', ngheNghiep: 'Hết tuổi lao động', trinhDoHocVan: '9/12' }, // Elderly #7
        { hoTen: 'Lê Văn Tiến', age: 39, gioiTinh: 'Nam', quanHeChuHo: 'Con', ngheNghiep: 'Thợ mộc', trinhDoHocVan: '12/12' },
        { hoTen: 'Trần Thị Mỹ Linh', age: 35, gioiTinh: 'Nữ', quanHeChuHo: 'Con dâu', ngheNghiep: 'Buôn bán rau củ', trinhDoHocVan: '9/12' },
      ],
    },
    {
      maHoKhau: 'HK-EW-020',
      diaChi: 'Số 121, Khu trọ Thôn 1, Xã Ea Wer',
      loaiCuTru: 'Tạm trú',
      ngayDangKy: '2025-01-15',
      thanhPhanHo: 'Hộ viên chức thuê trọ',
      members: [
        { hoTen: 'Phạm Thị Lan Hương', age: 31, gioiTinh: 'Nữ', quanHeChuHo: 'Chủ hộ', ngheNghiep: 'Giáo viên mầm non', trinhDoHocVan: 'Cao đẳng', tinhTrangCuTru: 'Tạm trú' },
        { hoTen: 'Vương Thị Kim Oanh', age: 28, gioiTinh: 'Nữ', quanHeChuHo: 'Người ở cùng', ngheNghiep: 'Giáo viên tiểu học', trinhDoHocVan: 'Đại học', tinhTrangCuTru: 'Tạm trú' },
      ],
    },
  ];

  const households: Household[] = [];
  const residents: Resident[] = [];
  let residentSeq = 1;

  specs.forEach((hSpec, hIndex) => {
    const householdId = generateId();
    const head = hSpec.members[0];
    const headDob = dobFromAge(head.age, residentSeq);
    const headCCCD = fakeCCCD(residentSeq);
    const headPhone = fakePhone(hIndex + 1);

    const household: Household = {
      id: householdId,
      maHoKhau: hSpec.maHoKhau,
      chuHoTen: head.hoTen,
      chuHoNgaySinh: headDob,
      chuHoGioiTinh: head.gioiTinh,
      chuHoCCCD: headCCCD,
      chuHoSDT: headPhone,
      diaChiThuongTru: hSpec.diaChi,
      thonBuon: 'Thôn 1, Xã Ea Wer',
      loaiCuTru: hSpec.loaiCuTru,
      ngayDangKyCuTru: hSpec.ngayDangKy,
      thanhPhanHo: hSpec.thanhPhanHo,
      laHoNgheo: Boolean(hSpec.laHoNgheo),
      laHoCanNgheo: Boolean(hSpec.laHoCanNgheo),
      laHoChinhSach: Boolean(hSpec.laHoChinhSach),
      ghiChu: hSpec.ghiChu || '',
      createdAt: now,
      updatedAt: now,
    };
    households.push(household);

    hSpec.members.forEach((m, mIndex) => {
      const seq = residentSeq++;
      const dob = mIndex === 0 ? headDob : dobFromAge(m.age, seq);
      const cccd = m.age >= 14 ? (mIndex === 0 ? headCCCD : fakeCCCD(seq)) : '';
      const phone = mIndex === 0 ? headPhone : m.age >= 18 ? fakePhone(seq + 30) : '';

      const resident: Resident = {
        id: generateId(),
        householdId,
        hoTen: m.hoTen,
        ngaySinh: dob,
        gioiTinh: m.gioiTinh,
        cccd,
        danToc: m.danToc || 'Kinh',
        tonGiao: m.tonGiao || 'Không',
        queQuan: m.tinhTrangCuTru === 'Tạm trú' ? 'TP. Buôn Ma Thuột, Đắk Lắk' : 'Xã Ea Wer, Tỉnh Đắk Lắk',
        ngheNghiep: m.ngheNghiep,
        trinhDoHocVan: m.trinhDoHocVan,
        sdt: phone,
        quanHeChuHo: m.quanHeChuHo,
        tinhTrangCuTru: m.tinhTrangCuTru || hSpec.loaiCuTru,
        ngayChuyenDen: hSpec.ngayDangKy,
        ngayChuyenDi: '',
        nguoiCoCong: Boolean(m.nguoiCoCong),
        nguoiKhuyetTat: Boolean(m.nguoiKhuyetTat),
        ghiChu: '',
        createdAt: now,
        updatedAt: now,
      };
      residents.push(resident);
    });
  });

  return { households, residents };
}
