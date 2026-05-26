import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { DatabaseConfig, OracleConfig } from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

const DB_CONFIG_PATH = path.join(DATA_DIR, 'db-config.json');
const ORACLE_CONFIG_PATH = path.join(DATA_DIR, 'oracle-config.json');

export async function saveDatabaseConfig(config: DatabaseConfig): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_CONFIG_PATH, JSON.stringify(config, null, 2));
}

export async function loadDatabaseConfig(): Promise<DatabaseConfig | null> {
  if (fs.existsSync(DB_CONFIG_PATH)) {
    const content = fs.readFileSync(DB_CONFIG_PATH, 'utf-8');
    return JSON.parse(content);
  }

  if (fs.existsSync(ORACLE_CONFIG_PATH)) {
    const content = fs.readFileSync(ORACLE_CONFIG_PATH, 'utf-8');
    const legacy = JSON.parse(content) as OracleConfig;
    return { type: 'oracle', ...legacy };
  }

  return null;
}

export async function loadLegacyOracleConfig(): Promise<OracleConfig | null> {
  if (fs.existsSync(ORACLE_CONFIG_PATH)) {
    const content = fs.readFileSync(ORACLE_CONFIG_PATH, 'utf-8');
    return JSON.parse(content);
  }
  return null;
}
