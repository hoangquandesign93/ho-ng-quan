import React, { useEffect, useState } from 'react';
import { ArrowRightLeft, X } from 'lucide-react';
import { Household, Resident } from '../types/population';

interface TransferResidentModalProps {
  open: boolean;
  resident: Resident | null;
  households: Household[];
  onConfirmTransfer: (residentId: string, targetHouseholdId: string, newRelation: string) => void;
  onClose: () => void;
}

export const TransferResidentModal: React.FC<TransferResidentModalProps> = ({
  open,
  resident,
  households,
  onConfirmTransfer,
  onClose,
}) => {
  const [targetHouseholdId, setTargetHouseholdId] = useState('');
  const [newRelation, setNewRelation] = useState('Thành viên chuyển đến');

  useEffect(() => {
    if (open && resident) {
      const other = households.find((h) => h.id !== resident.householdId);
      setTargetHouseholdId(other ? other.id : '');
      setNewRelation('Con');
    }
  }, [open, resident, households]);

  if (!open || !resident) return null;

  const availableHouseholds = households.filter((h) => h.id !== resident.householdId);
  const currentHousehold = households.find((h) => h.id === resident.householdId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetHouseholdId) return;
    onConfirmTransfer(resident.id, targetHouseholdId, newRelation);
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-[#0A1E3F] text-white border-b-2 border-[#FACC15]">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-[#FACC15]" />
            <h3 className="text-base font-bold">Chuyển nhân khẩu sang hộ khác</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm">
            <p className="font-bold text-slate-900">{resident.hoTen}</p>
            <p className="text-xs text-slate-600 mt-0.5">
              Hộ hiện tại: <strong className="font-mono">{currentHousehold?.maHoKhau || '—'}</strong> · {currentHousehold?.chuHoTen || ''}
            </p>
          </div>

          {availableHouseholds.length === 0 ? (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Cần có ít nhất 2 hộ khẩu trong hệ thống để thực hiện chuyển hộ.
            </p>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn hộ khẩu chuyển đến
                </label>
                <select
                  value={targetHouseholdId}
                  onChange={(e) => setTargetHouseholdId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-[#1D4ED8]"
                >
                  {availableHouseholds.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.maHoKhau} — Chủ hộ: {h.chuHoTen}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quan hệ với chủ hộ mới
                </label>
                <select
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-[#1D4ED8]"
                >
                  <option value="Vợ">Vợ</option>
                  <option value="Chồng">Chồng</option>
                  <option value="Con">Con</option>
                  <option value="Con dâu">Con dâu</option>
                  <option value="Con rể">Con rể</option>
                  <option value="Cháu">Cháu</option>
                  <option value="Anh / Chị / Em">Anh / Chị / Em</option>
                  <option value="Người ở cùng">Người ở cùng</option>
                  <option value="Chủ hộ">Chủ hộ</option>
                </select>
              </div>
            </>
          )}

          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={availableHouseholds.length === 0}
              className="px-4 py-2.5 rounded-lg bg-[#1D4ED8] hover:bg-blue-700 text-white text-sm font-bold min-h-[44px] disabled:opacity-50 cursor-pointer"
            >
              Xác nhận chuyển hộ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
