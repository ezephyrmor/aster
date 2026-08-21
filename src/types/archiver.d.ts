declare module "archiver" {
  import { Readable } from "stream";

  export interface ArchiverOptions {
    zlib?: { level?: number };
    [key: string]: unknown;
  }

  export interface EntryData {
    name?: string;
    prefix?: string;
    [key: string]: unknown;
  }

  export class Archiver extends Readable {
    append(source: unknown, data?: EntryData): this;
    finalize(): Promise<this>;
    pointer(): number;
  }

  export interface ArchiverStatic {
    (format: string, options?: ArchiverOptions): Archiver;
    create(format: string, options?: ArchiverOptions): Archiver;
  }

  const archiver: ArchiverStatic;
  export default archiver;
}