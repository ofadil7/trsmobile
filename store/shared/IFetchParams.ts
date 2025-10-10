export interface IFetchParams {
  forSelect?: boolean;
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  filters?: Record<string, (string | number | boolean)[]>;
  sortField?: string | null;
  sortOrder?: number | null;
  showDisabled?: boolean;
}

