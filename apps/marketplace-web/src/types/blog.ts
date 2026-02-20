// Blog types for backward compatibility
export interface BlogFilters {
  search?: string;
  category?: string;
}

export interface BlogPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}
