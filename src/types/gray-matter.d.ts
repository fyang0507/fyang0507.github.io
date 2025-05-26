declare module 'gray-matter' {
  interface GrayMatterFile<T> {
    data: T;
    content: string;
    isEmpty?: boolean;
    excerpt?: string;
    orig?: Buffer;
    language?: string;
    stringify?: (lang: string) => string;
  }

  interface GrayMatterOptions {
    excerpt?: boolean | (() => string);
    excerpt_separator?: string;
    engines?: {
      [key: string]: (input: string) => object | undefined;
    };
    language?: string;
    delimiters?: string | [string, string];
  }

  function matter(input: string | Buffer, options?: GrayMatterOptions): GrayMatterFile<Record<string, unknown>>;

  export = matter;
} 