import { readFileSync } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export type CsvRow = Record<string, string>;

export class TestDataManager {
  private readonly jsonCache = new Map<string, unknown>();
  private readonly csvCache = new Map<string, CsvRow[]>();

  readJSON<TData>(relativePath: string): TData {
    const absolutePath = this.resolvePath(relativePath);

    if (!this.jsonCache.has(absolutePath)) {
      const fileContents = readFileSync(absolutePath, 'utf-8');
      this.jsonCache.set(absolutePath, JSON.parse(fileContents));
    }

    return this.jsonCache.get(absolutePath) as TData;
  }

  readCSV(relativePath: string): CsvRow[] {
    const absolutePath = this.resolvePath(relativePath);

    if (!this.csvCache.has(absolutePath)) {
      const fileContents = readFileSync(absolutePath, 'utf-8');
      const records = parse(fileContents, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as CsvRow[];
      this.csvCache.set(absolutePath, records);
    }

    return this.csvCache.get(absolutePath) as CsvRow[];
  }

  clearCache(): void {
    this.jsonCache.clear();
    this.csvCache.clear();
  }

  private resolvePath(relativePath: string): string {
    return path.isAbsolute(relativePath)
      ? relativePath
      : path.resolve(process.cwd(), relativePath);
  }
}
