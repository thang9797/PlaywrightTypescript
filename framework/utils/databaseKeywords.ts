import type { EnvironmentDatabaseConfig } from '../config/environment';

export type SqlParameter = string | number | boolean | Date | null | Buffer;

export interface DatabaseTransactionConnection {
  query<T = unknown[]>(sql: string, params?: SqlParameter[] | Record<string, SqlParameter>): Promise<[T, unknown]>;
  execute<T = unknown[]>(sql: string, params?: SqlParameter[] | Record<string, SqlParameter>): Promise<[T, unknown]>;
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): void;
}

interface MySqlPool {
  query<T = unknown[]>(sql: string, params?: SqlParameter[] | Record<string, SqlParameter>): Promise<[T, unknown]>;
  execute<T = unknown[]>(sql: string, params?: SqlParameter[] | Record<string, SqlParameter>): Promise<[T, unknown]>;
  getConnection(): Promise<DatabaseTransactionConnection>;
  end(): Promise<void>;
}

interface MySqlModule {
  createPool(config: string | Record<string, unknown>): MySqlPool;
}

export class DatabaseKeywords {
  private poolPromise: Promise<MySqlPool> | null = null;

  constructor(private readonly config: EnvironmentDatabaseConfig) {
    if (!config || (!config.uri && !config.host)) {
      throw new Error('Database configuration must include either a uri or host.');
    }
  }

  async executeQuery<T = Record<string, unknown>>(
    sql: string,
    params?: SqlParameter[] | Record<string, SqlParameter>
  ): Promise<T[]> {
    const pool = await this.getPool();
    const [rows] = await pool.query<T[]>(sql, params);
    return rows;
  }

  async executeNonQuery(
    sql: string,
    params?: SqlParameter[] | Record<string, SqlParameter>
  ): Promise<number> {
    const pool = await this.getPool();
    const [result] = await pool.execute<{ affectedRows?: number } & Record<string, unknown>>(sql, params);
    const affectedRows = typeof result.affectedRows === 'number' ? result.affectedRows : 0;
    return affectedRows;
  }

  async executeTransaction<T>(callback: (connection: DatabaseTransactionConnection) => Promise<T>): Promise<T> {
    const pool = await this.getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async dispose(): Promise<void> {
    if (!this.poolPromise) {
      return;
    }

    const pool = await this.poolPromise;
    await pool.end();
    this.poolPromise = null;
  }

  private async getPool(): Promise<MySqlPool> {
    if (!this.poolPromise) {
      this.poolPromise = this.createPool();
    }

    return this.poolPromise;
  }

  private async createPool(): Promise<MySqlPool> {
    const moduleId = 'mysql2/promise';

    let mysql: MySqlModule;

    try {
      mysql = (await import(moduleId as string)) as MySqlModule;
    } catch (error) {
      throw new Error(
        'The "mysql2" package is required to use DatabaseKeywords. Install it with "npm install mysql2".'
      );
    }

    if (this.config.uri) {
      return mysql.createPool({
        uri: this.config.uri,
        waitForConnections: true,
        connectionLimit: this.config.connectionLimit ?? 10,
      });
    }

    return mysql.createPool({
      host: this.config.host,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
      port: this.config.port,
      ssl: this.config.ssl,
      waitForConnections: true,
      connectionLimit: this.config.connectionLimit ?? 10,
    });
  }
}
