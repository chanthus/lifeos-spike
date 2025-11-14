import { TRPCError } from '@trpc/server';
import {
  or,
  and,
  lt,
  gt,
  eq,
  asc,
  desc,
  sql,
  type SQL,
  type Column,
} from 'drizzle-orm';
import type { PaginatedResponse } from '../../pagination.types';
import { DEFAULT_PAGE_SIZE } from '../../pagination.constants';
import { ERROR_MESSAGES } from '../../error-messages';
import type { CursorCodec } from './cursor-codec';

type SortDirection = 'asc' | 'desc';
type NavigationDirection = 'forward' | 'backward';
type ComparisonType = 'greater' | 'less';

interface CursorData {
  names: string[];
  values: (string | null)[];
}

const EXTRA_ITEM_FOR_PAGINATION = 1;

interface ComparisonConditionParams {
  sortColumnRef: Column;
  idColumn: Column;
  cursorValue: unknown;
  cursorId: unknown;
  comparisonType: ComparisonType;
}

interface PaginationInput<TSortColumn extends string> {
  cursor?: string | undefined;
  pageSize?: number | undefined;
  sort?: { column?: TSortColumn; direction?: SortDirection } | undefined;
  direction?: NavigationDirection | undefined;
}

interface PaginationContext<TSortColumn extends string> {
  cursor?: string;
  pageSize: number;
  sortColumn: TSortColumn;
  sortDirection: SortDirection;
  direction: NavigationDirection;
  sortColumnRef: Column;
  isBackwardNavigation: boolean;
}

interface PaginatedQueryBuilder<TItem> {
  where: (condition: SQL | undefined) => PaginatedQueryBuilder<TItem>;
  orderBy: (...columns: SQL[]) => PaginatedQueryBuilder<TItem>;
  limit: (count: number) => Promise<TItem[]>;
}

interface BaseQueryBuilder<TItem> {
  where: (condition: SQL | undefined) => BaseQueryBuilder<TItem>;
  limit: (count: number) => Promise<TItem[]>;
}

/**
 * Implements cursor-based pagination with bidirectional navigation.
 *
 * This class provides efficient pagination for large datasets using cursor encoding,
 * supporting both forward and backward navigation with stable ordering. The pagination
 * system uses composite keys (sort column + id) to ensure:
 *
 * - Stable pagination even when data changes
 * - Efficient backward navigation without offset/limit performance issues
 * - No duplicate items across pages
 * - Consistent ordering with tie-breaking via unique ID
 *
 * Type parameters:
 * - TTable: The Drizzle table type
 * - TItem: The item type returned by queries
 */
export class CursorPagination<TTable, TItem> {
  constructor(
    private table: TTable,
    private codec: CursorCodec<TTable>
  ) {}

  private snakeToCamel(str: string): string {
    // eslint-disable-next-line prefer-named-capture-group, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- String replacement logic
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  private getIdColumn(): Column {
    const idColumn = (this.table as Record<string, Column>).id;

    if (!idColumn) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: ERROR_MESSAGES.PAGINATION.TABLE_MISSING_ID,
      });
    }

    return idColumn;
  }

  private calculateEffectiveSortDirection(
    sortDirection: SortDirection,
    isBackwardNavigation: boolean
  ): SortDirection {
    if (!isBackwardNavigation) {
      return sortDirection;
    }

    return sortDirection === 'desc' ? 'asc' : 'desc';
  }

  private createSortOrder(
    sortColumnRef: Column,
    effectiveSortDirection: SortDirection
  ): SQL[] {
    const idColumn = this.getIdColumn();

    const primarySort =
      effectiveSortDirection === 'desc'
        ? desc(sortColumnRef)
        : asc(sortColumnRef);
    const idSort =
      effectiveSortDirection === 'desc' ? desc(idColumn) : asc(idColumn);

    return [primarySort, idSort];
  }

  encodeCursor(item: TItem, columns: { name: string }[]): string {
    const columnNames = columns.map((col) => col.name);
    const columnValues = columns.map((col) => {
      const camelCaseName = this.snakeToCamel(col.name);
      const value = (item as Record<string, unknown>)[camelCaseName];
      return this.codec.encode(col.name, value);
    });

    const idValue = (item as Record<string, unknown>).id;
    const encodedId = this.codec.encode('id', idValue);

    const cursor: CursorData = {
      names: [...columnNames, 'id'],
      values: [...columnValues, encodedId],
    };

    return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64');
  }

  decodeCursor(
    cursor: string,
    _expectedColumns: string[]
  ): Map<string, unknown> {
    let decoded: CursorData;

    try {
      const decodedString = Buffer.from(cursor, 'base64').toString('utf8');
      decoded = JSON.parse(decodedString) as CursorData;
    } catch {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: ERROR_MESSAGES.PAGINATION.INVALID_CURSOR,
      });
    }

    // Runtime validation is required even though TypeScript types suggest these fields exist
    // The type cast doesn't guarantee runtime safety
    /* eslint-disable @typescript-eslint/no-unnecessary-condition -- Runtime validation required */
    if (
      !decoded.names ||
      !decoded.values ||
      decoded.names.length !== decoded.values.length
    ) {
      /* eslint-enable @typescript-eslint/no-unnecessary-condition -- End runtime validation */
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: ERROR_MESSAGES.PAGINATION.INVALID_CURSOR_STRUCTURE,
      });
    }

    const result = new Map<string, unknown>();

    for (let i = 0; i < decoded.names.length; i++) {
      const columnName = decoded.names[i];
      const encodedValue = decoded.values[i];

      if (columnName === undefined) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid cursor: missing column name',
        });
      }

      const decodedValue = this.codec.decode(columnName, encodedValue ?? null);
      result.set(columnName, decodedValue);
    }

    return result;
  }

  /**
   * Creates a comparison condition for cursor-based pagination.
   *
   * Generates SQL conditions that implement lexicographic ordering:
   * - Primary: Compare by sort column value
   * - Secondary: If sort values are equal, compare by ID (tie-breaker)
   *
   * This ensures stable, unique ordering across pagination requests.
   */
  private createComparisonCondition(params: ComparisonConditionParams): SQL {
    const { sortColumnRef, idColumn, cursorValue, cursorId, comparisonType } =
      params;
    const compareOp = comparisonType === 'greater' ? gt : lt;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- or() always returns SQL
    return or(
      compareOp(sortColumnRef, cursorValue),
      and(eq(sortColumnRef, cursorValue), compareOp(idColumn, cursorId))
    )!;
  }

  createCursorWhere(
    cursor: string,
    sortColumn: string,
    sortDirection: SortDirection,
    sortColumnRef: Column,
    direction: NavigationDirection = 'forward'
  ): SQL {
    const decoded = this.decodeCursor(cursor, [sortColumn, 'id']);

    const snakeCaseSortColumn = this.camelToSnake(sortColumn);
    const cursorValue = decoded.get(snakeCaseSortColumn);
    const cursorId = decoded.get('id');

    if (cursorValue === undefined || !cursorId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid cursor: missing required values',
      });
    }

    const idColumn = this.getIdColumn();
    const isBackwardNavigation = direction === 'backward';

    const notCursorId = sql`${idColumn} != ${cursorId}`;

    const comparisonTypes = {
      desc: {
        forward: 'less' as const,
        backward: 'greater' as const,
      },
      asc: {
        forward: 'greater' as const,
        backward: 'less' as const,
      },
    };

    const comparisonType = isBackwardNavigation
      ? comparisonTypes[sortDirection].backward
      : comparisonTypes[sortDirection].forward;

    const comparison = this.createComparisonCondition({
      sortColumnRef,
      idColumn,
      cursorValue,
      cursorId,
      comparisonType,
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- and() always returns SQL
    return and(notCursorId, comparison)!;
  }

  /**
   * Extracts and validates pagination parameters from the input.
   *
   * Processes pagination input including cursor, page size, sort configuration,
   * and navigation direction. Validates sort columns against the allowed set
   * and applies defaults where needed.
   *
   * @param input - Pagination input from the client
   * @param sortableColumns - Mapping of allowed sort column names to Drizzle columns
   * @returns Validated pagination context with all parameters resolved
   */
  private extractPaginationParameters<TSortColumn extends string>(
    input: PaginationInput<TSortColumn> | undefined,
    sortableColumns: Record<TSortColumn, Column>
  ): PaginationContext<TSortColumn> {
    const cursor = input?.cursor;
    const pageSize = input?.pageSize ?? DEFAULT_PAGE_SIZE;
    const sortColumn = (input?.sort?.column ??
      Object.keys(sortableColumns)[0]) as TSortColumn;
    const sortDirection = input?.sort?.direction ?? 'desc';
    const direction = input?.direction ?? 'forward';
    const sortColumnRef = sortableColumns[sortColumn];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- sortColumn comes from user input via type cast
    if (!sortColumnRef) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: ERROR_MESSAGES.PAGINATION.INVALID_SORT_COLUMN,
      });
    }

    const isBackwardNavigation = direction === 'backward';

    return {
      ...(cursor !== undefined && { cursor }),
      pageSize,
      sortColumn,
      sortDirection,
      direction,
      sortColumnRef,
      isBackwardNavigation,
    };
  }

  getPaginationParams(params: {
    cursor?: string;
    pageSize: number;
    sortColumn: { name: string };
    sortDirection: SortDirection;
    direction?: NavigationDirection;
  }): {
    paginationWhere: SQL | undefined;
    paginationOrderBy: SQL[];
    paginationLimit: number;
    isBackwardNavigation: boolean;
  } {
    const {
      cursor,
      pageSize,
      sortColumn,
      sortDirection,
      direction = 'forward',
    } = params;

    const isBackwardNavigation = direction === 'backward';

    const paginationWhere = cursor
      ? this.createCursorWhere(
          cursor,
          sortColumn.name,
          sortDirection,
          sortColumn as Column,
          direction
        )
      : undefined;

    const effectiveSortDirection = this.calculateEffectiveSortDirection(
      sortDirection,
      isBackwardNavigation
    );

    const paginationOrderBy = this.createSortOrder(
      sortColumn as Column,
      effectiveSortDirection
    );

    const paginationLimit = pageSize + EXTRA_ITEM_FOR_PAGINATION;

    return {
      paginationWhere,
      paginationOrderBy,
      paginationLimit,
      isBackwardNavigation,
    };
  }

  paginateResults(
    items: TItem[],
    pageSize: number,
    sortColumn: { name: string }
  ): {
    items: TItem[];
    pageInfo: {
      hasMore: boolean;
      nextCursor?: string;
    };
  } {
    const hasMore = items.length === pageSize + EXTRA_ITEM_FOR_PAGINATION;
    const slicedItems = hasMore ? items.slice(0, -1) : items;

    const lastReturnedItem = slicedItems.at(-1);

    let nextCursor: string | undefined;
    if (hasMore && lastReturnedItem) {
      nextCursor = this.encodeCursor(lastReturnedItem, [sortColumn]);
    }

    return {
      items: slicedItems,
      pageInfo: {
        hasMore,
        ...(nextCursor !== undefined && { nextCursor }),
      },
    };
  }

  buildPaginatedResponse(
    items: TItem[],
    pageSize: number,
    sortColumn: { name: string },
    options?: {
      hasPreviousPage?: boolean;
      isBackwardNavigation?: boolean;
      hasNextPage?: boolean;
    }
  ): PaginatedResponse<TItem> {
    const paginatedResults = this.paginateResults(items, pageSize, sortColumn);

    const orderedItems = options?.isBackwardNavigation
      ? [...paginatedResults.items].reverse()
      : paginatedResults.items;

    const startCursor =
      orderedItems.length > 0
        ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- length check ensures item exists
          this.encodeCursor(orderedItems[0]!, [sortColumn])
        : null;

    let hasNextPage: boolean;
    let endCursor: string | null;

    if (options?.isBackwardNavigation) {
      hasNextPage = options.hasNextPage ?? false;
      endCursor =
        hasNextPage && orderedItems.length > 0
          ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- length check ensures item exists
            this.encodeCursor(orderedItems[orderedItems.length - 1]!, [
              sortColumn,
            ])
          : null;
    } else {
      hasNextPage = paginatedResults.pageInfo.hasMore;
      endCursor = paginatedResults.pageInfo.nextCursor ?? null;
    }

    return {
      items: orderedItems,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: options?.hasPreviousPage ?? false,
        startCursor,
        endCursor,
      },
    };
  }

  /**
   * Combines base filters with cursor-based WHERE conditions.
   *
   * Handles the logic for merging filtering criteria with cursor-based
   * pagination constraints, ensuring proper SQL condition composition.
   *
   * @param baseFilters - User-provided filtering conditions (e.g., status, role)
   * @param cursorWhere - Cursor-based pagination conditions
   * @returns Combined SQL WHERE clause or undefined if no conditions
   */
  private combineWhereConditions(
    baseFilters: SQL | undefined,
    cursorWhere: SQL | undefined
  ): SQL | undefined {
    if (!baseFilters && !cursorWhere) return undefined;
    if (!baseFilters) return cursorWhere;
    if (!cursorWhere) return baseFilters;
    return and(baseFilters, cursorWhere);
  }

  /**
   * Builds the paginated query with cursor-based filtering and sorting.
   *
   * Applies cursor conditions, base filters, sort order, and fetch limit
   * to the provided query builder.
   *
   * @param baseQuery - Dynamic Drizzle query builder
   * @param paginationContext - Extracted pagination parameters
   * @param baseFilters - Optional user-provided filters
   * @returns Executable query that fetches paginated results
   */
  private buildPaginatedQuery(
    baseQuery: PaginatedQueryBuilder<TItem>,
    paginationContext: PaginationContext<string>,
    baseFilters?: SQL
  ): Promise<TItem[]> {
    const cursorWhere = paginationContext.cursor
      ? this.createCursorWhere(
          paginationContext.cursor,
          paginationContext.sortColumn,
          paginationContext.sortDirection,
          paginationContext.sortColumnRef,
          paginationContext.direction
        )
      : undefined;

    const combinedWhere = this.combineWhereConditions(baseFilters, cursorWhere);

    const effectiveSortDirection = this.calculateEffectiveSortDirection(
      paginationContext.sortDirection,
      paginationContext.isBackwardNavigation
    );

    const sortOrder = this.createSortOrder(
      paginationContext.sortColumnRef,
      effectiveSortDirection
    );

    return baseQuery
      .where(combinedWhere)
      .orderBy(...sortOrder)
      .limit(paginationContext.pageSize + EXTRA_ITEM_FOR_PAGINATION);
  }

  /**
   * Determines page info (hasNext/hasPrevious) based on results and navigation direction.
   *
   * Calculates whether there are more pages available in both directions,
   * handling the asymmetry between forward and backward navigation.
   *
   * @param results - Query results (may include one extra item)
   * @param paginationContext - Pagination parameters
   * @param baseQuery - Query builder for checking previous page
   * @param baseFilters - Optional filters
   * @returns Page info with hasNextPage and hasPreviousPage flags
   */
  private async buildPageInfo(
    results: TItem[],
    paginationContext: PaginationContext<string>,
    baseQuery: BaseQueryBuilder<TItem>,
    baseFilters?: SQL
  ): Promise<{ hasPreviousPage: boolean; hasNextPage: boolean }> {
    let hasPreviousPage = false;

    if (paginationContext.cursor) {
      if (paginationContext.direction === 'forward') {
        hasPreviousPage = await this.checkHasPreviousWithQuery(
          baseQuery,
          results[0],
          paginationContext,
          baseFilters
        );
      } else {
        hasPreviousPage = results.length > paginationContext.pageSize;
      }
    }

    const hasNextPage =
      paginationContext.direction === 'forward'
        ? results.length > paginationContext.pageSize
        : paginationContext.cursor !== undefined && results.length > 0;

    return { hasPreviousPage, hasNextPage };
  }

  /**
   * Main pagination orchestrator - implements cursor-based pagination with bidirectional navigation.
   *
   * This method coordinates all pagination logic:
   * 1. Extracts and validates pagination parameters
   * 2. Builds paginated query with cursor conditions and filters
   * 3. Executes query to fetch results (pageSize + 1 for hasNext detection)
   * 4. Determines page info (hasNext, hasPrevious)
   * 5. Builds final response with properly ordered items and cursors
   *
   * The algorithm uses cursor encoding with composite keys (sortColumn + id) to ensure
   * stable pagination even when data changes between requests.
   *
   * @param baseQuery - Dynamic Drizzle query builder
   * @param input - Pagination parameters (cursor, pageSize, sort, direction)
   * @param sortableColumns - Mapping of allowed sort columns
   * @param baseFilters - Optional WHERE conditions to combine with cursor conditions
   * @returns Paginated response with items and page info (cursors, hasNext, hasPrevious)
   */
  async paginate<TSortColumn extends string>(
    baseQuery: PaginatedQueryBuilder<TItem>,
    input: PaginationInput<TSortColumn> | undefined,
    sortableColumns: Record<TSortColumn, Column>,
    baseFilters?: SQL
  ): Promise<PaginatedResponse<TItem>> {
    const paginationContext = this.extractPaginationParameters(
      input,
      sortableColumns
    );

    const results = await this.buildPaginatedQuery(
      baseQuery,
      paginationContext,
      baseFilters
    );

    const pageInfo = await this.buildPageInfo(
      results,
      paginationContext,
      baseQuery,
      baseFilters
    );

    return this.buildPaginatedResponse(
      results,
      paginationContext.pageSize,
      paginationContext.sortColumnRef,
      {
        hasPreviousPage: pageInfo.hasPreviousPage,
        isBackwardNavigation: paginationContext.isBackwardNavigation,
        hasNextPage: pageInfo.hasNextPage,
      }
    );
  }

  private async checkHasPreviousWithQuery(
    baseQuery: BaseQueryBuilder<TItem>,
    firstItem: TItem | undefined,
    paginationContext: {
      sortColumn: string;
      sortDirection: SortDirection;
      sortColumnRef: Column;
    },
    baseFilters?: SQL
  ): Promise<boolean> {
    if (!firstItem) return false;

    const firstItemCursor = this.encodeCursor(firstItem, [
      paginationContext.sortColumnRef,
    ]);

    const cursorWhere = this.createCursorWhere(
      firstItemCursor,
      paginationContext.sortColumn,
      paginationContext.sortDirection,
      paginationContext.sortColumnRef,
      'backward'
    );

    const combinedWhere = this.combineWhereConditions(baseFilters, cursorWhere);

    const result = await baseQuery.where(combinedWhere).limit(1);

    return result.length > 0;
  }
}
