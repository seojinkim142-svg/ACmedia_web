// 보관 처리로 간주하는 기사 상태 목록
export const STORAGE_STATUSES: readonly string[] = ["업로드 완료", "보류", "중복"];

export const isStorageStatus = (status?: string | null): boolean => {
  return !!status && STORAGE_STATUSES.includes(status);
};
