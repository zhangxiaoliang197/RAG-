import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import type { ColumnMetadata, DamengDatabaseConfig } from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DRIVER_DIR = path.join(DATA_DIR, 'db-drivers');
const BRIDGE_DIR = path.join(DRIVER_DIR, 'bridge');
const BRIDGE_CLASS = 'DmJdbcBridge';

function buildJdbcUrl(config: DamengDatabaseConfig): string {
  if (config.jdbcUrl && config.jdbcUrl.trim()) return config.jdbcUrl.trim();
  return `jdbc:dm://${config.host}:${config.port}`;
}

function getDriverJarPath(config: DamengDatabaseConfig): string {
  const jarPath = config.driverJarPath || process.env.DAMENG_JDBC_JAR;
  if (!jarPath) throw new Error('未配置达梦 JDBC 驱动文件路径');
  return jarPath;
}

async function ensureBridgeCompiled(): Promise<string> {
  if (!fs.existsSync(BRIDGE_DIR)) fs.mkdirSync(BRIDGE_DIR, { recursive: true });

  const classFile = path.join(BRIDGE_DIR, `${BRIDGE_CLASS}.class`);
  if (fs.existsSync(classFile)) return BRIDGE_DIR;

  const sourcePath = path.join(__dirname, '../java', `${BRIDGE_CLASS}.java`);
  if (!fs.existsSync(sourcePath)) throw new Error('缺少达梦 JDBC 桥接源码文件');

  await new Promise<void>((resolve, reject) => {
    execFile('javac', ['-encoding', 'UTF-8', '-d', BRIDGE_DIR, sourcePath], { windowsHide: true }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr || err.message));
        return;
      }
      resolve();
    });
  });

  if (!fs.existsSync(classFile)) throw new Error('达梦 JDBC 桥接编译失败');
  return BRIDGE_DIR;
}

async function runBridge<T>(
  action: string,
  config: DamengDatabaseConfig,
  schema: string,
  tableName: string,
  sql: string
): Promise<T> {
  const jarPath = getDriverJarPath(config);
  const bridgeCpDir = await ensureBridgeCompiled();
  const cp = `${jarPath}${path.delimiter}${bridgeCpDir}`;

  const stdin = [
    buildJdbcUrl(config),
    config.user,
    config.password,
    schema || '',
    tableName || '',
    Buffer.from(sql || '', 'utf-8').toString('base64')
  ].join('\n');

  const { stdout } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = execFile('java', ['-cp', cp, BRIDGE_CLASS, action], { windowsHide: true, maxBuffer: 20 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr || err.message));
        return;
      }
      resolve({ stdout, stderr });
    });
    if (child.stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }
  });

  const text = stdout.trim();
  const obj = JSON.parse(text);
  if (!obj.success) throw new Error(obj.error || '达梦操作失败');
  return obj as T;
}

export async function testDamengConnection(
  config: DamengDatabaseConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    await runBridge('TEST', config, '', '', '');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || String(error) };
  }
}

export async function getDamengTables(
  config: DamengDatabaseConfig,
  schema?: string
): Promise<string[]> {
  const result = await runBridge<{ success: true; tables: string[] }>('TABLES', config, schema || '', '', '');
  return result.tables || [];
}

export async function getDamengTableStructure(
  config: DamengDatabaseConfig,
  tableName: string,
  schema?: string
): Promise<ColumnMetadata[]> {
  const result = await runBridge<{ success: true; columns: ColumnMetadata[] }>(
    'COLUMNS',
    config,
    schema || '',
    tableName,
    ''
  );
  return result.columns || [];
}

export async function executeDamengSql(
  config: DamengDatabaseConfig,
  sql: string
): Promise<{ columns: string[]; rows: any[] }> {
  const result = await runBridge<{ success: true; columns: string[]; rows: any[] }>('EXECUTE', config, '', '', sql);
  return { columns: result.columns || [], rows: result.rows || [] };
}

export async function validateDamengSql(
  config: DamengDatabaseConfig,
  sql: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    await runBridge('VALIDATE', config, '', '', sql);
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error?.message || String(error) };
  }
}
