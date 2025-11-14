export interface TypeCodec<T> {
  encode: (value: T) => string;
  decode: (value: string) => T;
  validate: (value: unknown) => value is T;
}

export const DateCodec: TypeCodec<Date> = {
  encode: (value: Date): string => {
    return value.toISOString();
  },

  decode: (value: string): Date => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid date string: ${value}`);
    }
    return date;
  },

  validate: (value: unknown): value is Date => {
    return value instanceof Date && !Number.isNaN(value.getTime());
  },
};

export const StringCodec: TypeCodec<string> = {
  encode: (value: string): string => {
    return value;
  },

  decode: (value: string): string => {
    return value;
  },

  validate: (value: unknown): value is string => {
    return typeof value === 'string';
  },
};

export const NumberCodec: TypeCodec<number> = {
  encode: (value: number): string => {
    return value.toString();
  },

  decode: (value: string): number => {
    const num = Number(value);
    if (Number.isNaN(num)) {
      throw new Error(`Invalid number string: ${value}`);
    }
    return num;
  },

  validate: (value: unknown): value is number => {
    return typeof value === 'number' && !Number.isNaN(value);
  },
};

export const BooleanCodec: TypeCodec<boolean> = {
  encode: (value: boolean): string => {
    return value ? 'true' : 'false';
  },

  decode: (value: string): boolean => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    throw new Error(`Invalid boolean string: ${value}`);
  },

  validate: (value: unknown): value is boolean => {
    return typeof value === 'boolean';
  },
};

export const NullCodec: TypeCodec<null> = {
  encode: (): string => {
    return '__NULL__';
  },

  decode: (value: string): null => {
    if (value !== '__NULL__') {
      throw new Error(`Invalid null token: ${value}`);
    }
    return null;
  },

  validate: (value: unknown): value is null => {
    return value === null;
  },
};

export const TypeRegistry: Record<string, TypeCodec<unknown>> = {
  date: DateCodec as TypeCodec<unknown>,
  string: StringCodec as TypeCodec<unknown>,
  number: NumberCodec as TypeCodec<unknown>,
  boolean: BooleanCodec as TypeCodec<unknown>,
  bigint: NumberCodec as TypeCodec<unknown>,
};
