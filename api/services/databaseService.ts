import type {
  ColumnMetadata,
  DatabaseConfig,
  OracleDatabaseConfig
} from '../../shared/types.js';
import {
  closeOraclePool,
  executeSql as executeOracleSql,
  getTableStructure as getOracleTableStructure,
  getTables as getOracleTables,
  initOraclePool,
  testConnection as testOracleConnection,
  validateSql as validateOracleSql
} from './oracleService.js';
import { loadDatabaseConfig, saveDatabaseConfig } from './dbConfigService.js';
import {
  executeDamengSql,
  getDamengTableStructure,
  getDamengTables,
  testDamengConnection,
  validateDamengSql
} from './damengJdbcService.js';

let activeConfig: DatabaseConfig | null = null;

export async function getActiveDatabaseConfig(): Promise<DatabaseConfig | null> {
  if (activeConfig) return activeConfig;
  activeConfig = await loadDatabaseConfig();
  if (activeConfig && activeConfig.type === 'oracle') {
    try {
      await initOraclePool(stripOracleType(activeConfig));
    } catch {}
  }
  return activeConfig;
}

export async function setActiveDatabaseConfig(config: DatabaseConfig): Promise<void> {
  activeConfig = config;
  await saveDatabaseConfig(config);

  if (config.type === 'oracle') {
    await initOraclePool(stripOracleType(config));
  } else {
    await closeOraclePool();
  }
}

export async function closeActiveDatabase(): Promise<void> {
  await closeOraclePool();
}

export async function testDatabaseConnection(
  config: DatabaseConfig
): Promise<{ success: boolean; error?: string }> {
  if (config.type === 'oracle') return testOracleConnection(stripOracleType(config));
  return testDamengConnection(config);
}

export async function getRemoteTables(schema?: string): Promise<string[]> {
  const config = await getActiveDatabaseConfig();
  if (!config) throw new Error('请先配置数据库连接');
  if (config.type === 'oracle') return getOracleTables(schema);
  return getDamengTables(config, schema);
}

export async function getRemoteTableStructure(
  tableName: string,
  schema?: string
): Promise<ColumnMetadata[]> {
  const config = await getActiveDatabaseConfig();
  if (!config) throw new Error('请先配置数据库连接');
  if (config.type === 'oracle') return getOracleTableStructure(tableName, schema);
  return getDamengTableStructure(config, tableName, schema);
}

export async function executeSql(sql: string): Promise<{ columns: string[]; rows: any[] }> {
  const config = await getActiveDatabaseConfig();
  if (!config) throw new Error('请先配置数据库连接');
  if (config.type === 'oracle') return executeOracleSql(sql);
  return executeDamengSql(config, sql);
}

export async function validateSql(sql: string): Promise<{ valid: boolean; error?: string }> {
  const config = await getActiveDatabaseConfig();
  if (!config) throw new Error('请先配置数据库连接');
  if (config.type === 'oracle') return validateOracleSql(sql);
  return validateDamengSql(config, sql);
}

function stripOracleType(config: OracleDatabaseConfig): any {
  const { type, ...rest } = config as any;
  return rest;
}
