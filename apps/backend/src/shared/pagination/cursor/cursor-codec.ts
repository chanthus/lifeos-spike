import { TRPCError } from '@trpc/server';
import { TypeRegistry, StringCodec, type TypeCodec } from './type-codecs';

export class CursorCodec<TTable> {
  private columnTypeMap: Map<string, TypeCodec<unknown>>;

  constructor(table: TTable) {
    this.columnTypeMap = this.buildColumnTypeMap(table);
  }

  private buildColumnTypeMap(table: TTable): Map<string, TypeCodec<unknown>> {
    const map = new Map<string, TypeCodec<unknown>>();

    for (const [columnName, column] of Object.entries(
      table as Record<string, unknown>
    )) {
      if (this.isColumn(column)) {
        const codec = this.getCodecForColumn(column);
        map.set(columnName, codec);

        if (column.name && column.name !== columnName) {
          map.set(column.name, codec);
        }
      }
    }

    return map;
  }

  private isColumn(
    value: unknown
  ): value is { name?: string; dataType?: string } {
    return (
      value !== null &&
      typeof value === 'object' &&
      'name' in value &&
      typeof (value as { name?: unknown }).name === 'string'
    );
  }

  private getCodecForColumn(column: {
    name?: string;
    dataType?: string;
  }): TypeCodec<unknown> {
    if (!column.dataType) {
      return StringCodec as TypeCodec<unknown>;
    }

    const codec = TypeRegistry[column.dataType];
    if (codec) {
      return codec;
    }

    return StringCodec as TypeCodec<unknown>;
  }

  encode(columnName: string, value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const codec = this.columnTypeMap.get(columnName);
    if (!codec) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Unknown column: ${columnName}`,
      });
    }

    try {
      return codec.encode(value);
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to encode value for column ${columnName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  decode(columnName: string, value: string | null): unknown {
    if (value === null) {
      return null;
    }

    const codec = this.columnTypeMap.get(columnName);
    if (!codec) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Unknown column: ${columnName}`,
      });
    }

    try {
      return codec.decode(value);
    } catch (error) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Failed to decode value for column ${columnName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  validate(columnName: string, value: unknown): boolean {
    const codec = this.columnTypeMap.get(columnName);
    if (!codec) {
      return false;
    }

    return codec.validate(value);
  }
}
