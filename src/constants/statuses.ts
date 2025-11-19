export const STORAGE_STATUSES: readonly string[] = ["업로드", "보류", "중복"];

export const isStorageStatus = (status?: string | null): boolean => {
  return !!status && STORAGE_STATUSES.includes(status);
};
