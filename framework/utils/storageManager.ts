import { promises as fs } from 'fs';
import path from 'path';
import type { BrowserContext, Page } from '@playwright/test';

type StoredState = Awaited<ReturnType<BrowserContext['storageState']>>;

export class StorageManager {
  private readonly storageDir: string;
  private ensured = false;

  constructor(storageDir = path.resolve(process.cwd(), 'storage-states')) {
    this.storageDir = storageDir;
  }

  async saveFromPage(name: string, page: Page): Promise<string> {
    return this.saveFromContext(name, page.context());
  }

  async saveFromContext(name: string, context: BrowserContext): Promise<string> {
    const filePath = await this.ensurePath(name);
    await context.storageState({ path: filePath });
    return filePath;
  }

  async write(name: string, state: StoredState): Promise<string> {
    const filePath = await this.ensurePath(name);
    await fs.writeFile(filePath, JSON.stringify(state, null, 2), 'utf-8');
    return filePath;
  }

  async read(name: string): Promise<StoredState | undefined> {
    const filePath = this.resolveFilePath(name);
    if (!(await this.fileExists(filePath))) {
      return undefined;
    }

    const contents = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(contents) as StoredState;
  }

  async getPath(name: string): Promise<string | undefined> {
    const filePath = this.resolveFilePath(name);
    return (await this.fileExists(filePath)) ? filePath : undefined;
  }

  async list(): Promise<string[]> {
    await this.ensureDir();
    const entries = await fs.readdir(this.storageDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => path.resolve(this.storageDir, entry.name));
  }

  async clear(name?: string): Promise<void> {
    if (name) {
      const filePath = this.resolveFilePath(name);
      await fs.rm(filePath, { force: true });
      return;
    }

    await fs.rm(this.storageDir, { recursive: true, force: true });
    this.ensured = false;
  }

  private async ensurePath(name: string): Promise<string> {
    await this.ensureDir();
    const filePath = this.resolveFilePath(name);
    await fs.writeFile(filePath, '', { flag: 'a' });
    return filePath;
  }

  private async ensureDir(): Promise<void> {
    if (this.ensured) {
      return;
    }

    await fs.mkdir(this.storageDir, { recursive: true });
    this.ensured = true;
  }

  private resolveFilePath(name: string): string {
    const filename = name.endsWith('.json') ? name : `${name}.json`;
    return path.resolve(this.storageDir, filename);
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
