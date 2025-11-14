export type SortDirection = 'asc' | 'desc';
export type PaginationDirection = 'forward' | 'backward';

export interface PaginationSort<TSortColumn extends string> {
  column?: TSortColumn;
  direction?: SortDirection;
}

export interface PaginationInput<TSortColumn extends string = string> {
  cursor?: string | undefined;
  pageSize?: number | undefined;
  sort?: PaginationSort<TSortColumn> | undefined;
  direction?: PaginationDirection | undefined;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  pageInfo: PageInfo;
}
