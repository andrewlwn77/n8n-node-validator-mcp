/**
 * Node.js global declarations
 */

declare const process: {
  env: Record<string, string | undefined>;
  exit(code?: number): never;
  on(event: string, listener: (...args: any[]) => void): void;
  argv: string[];
  cwd(): string;
  stderr: {
    write(str: string): void;
  };
  stdout: {
    write(str: string): void;
  };
};

declare const Buffer: {
  from(data: string, encoding?: string): {
    toString(encoding?: string): string;
  };
};

declare const console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
};

declare const fetch: (url: string, options?: any) => Promise<Response>;

declare const setInterval: (callback: () => void, ms: number) => any;

interface Response {
  ok: boolean;
  status: number;
  statusText: string;
  json(): Promise<any>;
}